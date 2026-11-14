import type { IntegrityEventType, IntegrityMode } from '@/domain/exam/integrity';

type Listener = (event: Event) => void;
interface EventTargetLike {
  addEventListener: (type: string, listener: Listener, options?: boolean) => void;
  removeEventListener: (type: string, listener: Listener, options?: boolean) => void;
}

/** Browser APIs the monitor uses; injected so tests can mock them. */
export interface MonitorEnvironment {
  window: EventTargetLike;
  document: EventTargetLike & {
    visibilityState: DocumentVisibilityState;
    fullscreenElement: Element | null;
    exitFullscreen: () => Promise<void>;
    documentElement: { requestFullscreen?: () => Promise<void> };
  };
  /** `isExtended` is only reported by Chromium-based browsers. */
  screen: (EventTargetLike & { isExtended?: boolean }) | null;
  now: () => number;
}

export type FullscreenState = 'off' | 'on' | 'unavailable';

export interface MonitorState {
  active: boolean;
  fullscreen: FullscreenState;
  /** True after fullscreen was exited during the exam (until it is re-entered). */
  fullscreenExited: boolean;
}

export function browserEnvironment(): MonitorEnvironment {
  return {
    window,
    document,
    // Not every browser exposes screen events (or a screen object, in tests).
    screen:
      typeof (window.screen as Partial<EventTarget> | undefined)?.addEventListener === 'function'
        ? (window.screen as unknown as MonitorEnvironment['screen'])
        : null,
    now: () => Date.now(),
  };
}

/** Keys blocked during a proctored exam: copy, paste, print, save, find, dev tools, … */
export function isBlockedShortcut(event: {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}): boolean {
  const key = event.key.toLowerCase();
  if (key === 'printscreen' || key === 'f12') return true;
  const command = event.ctrlKey || event.metaKey;
  if (!command) return false;
  if (event.shiftKey && ['i', 'j', 'c', 'k', 's'].includes(key)) return true; // dev tools, screenshots
  if (event.altKey && ['i', 'j', 'c'].includes(key)) return true; // dev tools on macOS
  return ['c', 'x', 'v', 'a', 'p', 's', 'u', 'f', 'g', 'o'].includes(key);
}

/** Repeated blocked actions (holding a key) are logged at most once per this period. */
const BLOCKED_LOG_INTERVAL_MS = 1000;

/**
 * Watches browser signals during a strict or proctored exam and reports them as events.
 * Proctored mode also blocks shortcuts and watches the pointer and displays. Only event
 * types and timestamps leave this class. `stop()` removes every listener.
 */
export class IntegrityMonitor {
  private state: MonitorState = { active: false, fullscreen: 'off', fullscreenExited: false };
  private readonly listeners = new Set<() => void>();
  private readonly cleanups: (() => void)[] = [];
  private stopped = false;
  private lastBlockedAt = -Infinity;

  constructor(
    private readonly env: MonitorEnvironment,
    private readonly mode: IntegrityMode,
    private readonly onEvent: (type: IntegrityEventType, at: number) => void,
  ) {}

  getState = (): MonitorState => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private set(patch: Partial<MonitorState>) {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) listener();
  }

  private log(type: IntegrityEventType) {
    this.onEvent(type, this.env.now());
  }

  private listen(target: EventTargetLike, name: string, handler: Listener, capture = false) {
    target.addEventListener(name, handler, capture);
    this.cleanups.push(() => {
      target.removeEventListener(name, handler, capture);
    });
  }

  /** Attaches the listeners. Does nothing in standard mode. */
  start(): void {
    if (this.mode === 'standard' || this.state.active) return;
    this.stopped = false; // restartable (React development mode runs effects twice)
    this.set({ active: true, fullscreen: this.env.document.fullscreenElement ? 'on' : 'off' });
    this.log('monitoring-started');

    const { document: doc, window: win } = this.env;
    this.listen(doc, 'visibilitychange', () => {
      this.log(doc.visibilityState === 'hidden' ? 'tab-hidden' : 'tab-visible');
    });
    this.listen(win, 'blur', () => {
      this.log('window-blur');
    });
    this.listen(win, 'focus', () => {
      this.log('window-focus');
    });
    this.listen(doc, 'fullscreenchange', () => {
      if (doc.fullscreenElement) {
        this.set({ fullscreen: 'on', fullscreenExited: false });
        this.log('fullscreen-entered');
      } else {
        this.set({ fullscreen: 'off', fullscreenExited: true });
        this.log('fullscreen-exited');
      }
    });
    if (this.mode === 'proctored') this.startProctoredSignals();
  }

  private blocked(event: Event) {
    event.preventDefault();
    const now = this.env.now();
    if (now - this.lastBlockedAt < BLOCKED_LOG_INTERVAL_MS) return;
    this.lastBlockedAt = now;
    this.log('blocked-shortcut');
  }

  private startProctoredSignals() {
    const { document: doc, window: win, screen } = this.env;
    // The pointer leaving the page (in fullscreen, that means another monitor).
    this.listen(doc, 'mouseout', (event) => {
      if (!(event as MouseEvent).relatedTarget) this.log('pointer-left');
    });
    const onKey = (event: Event) => {
      if (isBlockedShortcut(event as KeyboardEvent)) this.blocked(event);
    };
    this.listen(win, 'keydown', onKey, true);
    // On Windows, Print Screen often only sends keyup.
    this.listen(
      win,
      'keyup',
      (event) => {
        if ((event as KeyboardEvent).key === 'PrintScreen') this.blocked(event);
      },
      true,
    );
    for (const name of ['copy', 'cut', 'paste', 'contextmenu', 'dragstart']) {
      this.listen(doc, name, (event) => {
        this.blocked(event);
      });
    }
    this.listen(win, 'beforeprint', (event) => {
      this.blocked(event);
    });
    if (screen) {
      if (screen.isExtended) this.log('extra-display');
      this.listen(screen, 'change', () => {
        if (screen.isExtended) this.log('extra-display');
      });
    }
  }

  /**
   * Requests fullscreen. Must be called from a user action (a click). Never throws:
   * if the browser refuses, the exam simply continues without fullscreen.
   */
  async requestFullscreen(): Promise<boolean> {
    const request = this.env.document.documentElement.requestFullscreen;
    if (!request) {
      this.set({ fullscreen: 'unavailable' });
      this.log('fullscreen-unavailable');
      return false;
    }
    try {
      await request.call(this.env.document.documentElement);
      return true;
    } catch {
      this.set({ fullscreen: 'unavailable' });
      this.log('fullscreen-unavailable');
      return false;
    }
  }

  /** Lets the learner continue without fullscreen after exiting it (strict mode only). */
  dismissFullscreenWarning(): void {
    this.set({ fullscreenExited: false });
  }

  /** Leaves fullscreen if the page is in it. */
  exitFullscreen(): void {
    if (this.env.document.fullscreenElement) {
      void this.env.document.exitFullscreen().catch(() => undefined);
    }
  }

  /**
   * Ends monitoring: removes all listeners and, unless `keepFullscreen`, leaves fullscreen.
   * Safe to call more than once. `byUser` logs that the learner switched monitoring off.
   */
  stop(byUser = false, { keepFullscreen = false }: { keepFullscreen?: boolean } = {}): void {
    if (this.stopped) return;
    this.stopped = true;
    if (byUser && this.state.active) this.log('monitoring-stopped');
    for (const cleanup of this.cleanups.splice(0)) cleanup();
    if (!keepFullscreen) this.exitFullscreen();
    this.set({ active: false });
  }
}
