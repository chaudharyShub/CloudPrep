import { describe, expect, it, vi } from 'vitest';
import type { IntegrityEventType } from '@/domain/exam/integrity';
import { IntegrityMonitor, isBlockedShortcut, type MonitorEnvironment } from './monitor';

type Handler = (event: Event) => void;

/** A fake browser: event targets we can fire. */
function fakeEnv(options: { fullscreen?: 'ok' | 'reject' | 'missing'; extended?: boolean } = {}) {
  const { fullscreen = 'ok', extended = false } = options;
  const listeners = {
    window: new Map<string, Set<Handler>>(),
    document: new Map<string, Set<Handler>>(),
    screen: new Map<string, Set<Handler>>(),
  };
  type Kind = keyof typeof listeners;
  const target = (kind: Kind) => ({
    addEventListener: vi.fn((name: string, fn: Handler) => {
      const set = listeners[kind].get(name) ?? new Set();
      set.add(fn);
      listeners[kind].set(name, set);
    }),
    removeEventListener: vi.fn((name: string, fn: Handler) => {
      listeners[kind].get(name)?.delete(fn);
    }),
  });
  /** Fires an event; returns whether a listener prevented its default action. */
  const fire = (kind: Kind, name: string, init: Record<string, unknown> = {}) => {
    let prevented = false;
    const event = {
      type: name,
      preventDefault: () => {
        prevented = true;
      },
      ...init,
    } as unknown as Event;
    for (const fn of listeners[kind].get(name) ?? []) fn(event);
    return prevented;
  };
  const doc = {
    ...target('document'),
    visibilityState: 'visible' as DocumentVisibilityState,
    fullscreenElement: null as Element | null,
    exitFullscreen: vi.fn(() => Promise.resolve()),
    documentElement: {
      requestFullscreen:
        fullscreen === 'missing'
          ? undefined
          : vi.fn(() =>
              fullscreen === 'ok' ? Promise.resolve() : Promise.reject(new Error('denied')),
            ),
    },
  };
  const screen = { ...target('screen'), isExtended: extended };
  let now = 1000;
  const env: MonitorEnvironment = {
    window: target('window'),
    document: doc as unknown as MonitorEnvironment['document'],
    screen,
    now: () => now,
  };
  const events: IntegrityEventType[] = [];
  return {
    env,
    events,
    onEvent: (type: IntegrityEventType) => events.push(type),
    fire,
    doc,
    screen,
    advance: (ms: number) => {
      now += ms;
    },
    listenerCount: () =>
      Object.values(listeners)
        .flatMap((map) => [...map.values()])
        .reduce((n, set) => n + set.size, 0),
  };
}

const key = (
  k: string,
  mods: Partial<Record<'ctrlKey' | 'metaKey' | 'shiftKey' | 'altKey', boolean>> = {},
) => ({
  key: k,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  altKey: false,
  ...mods,
});

describe('focus monitoring', () => {
  it('logs tab, focus and fullscreen changes with type and time only', () => {
    const fake = fakeEnv();
    const monitor = new IntegrityMonitor(fake.env, 'focus', fake.onEvent);
    monitor.start();
    fake.doc.visibilityState = 'hidden';
    fake.fire('document', 'visibilitychange');
    fake.doc.visibilityState = 'visible';
    fake.fire('document', 'visibilitychange');
    fake.fire('window', 'blur');
    fake.fire('window', 'focus');
    fake.doc.fullscreenElement = {} as Element;
    fake.fire('document', 'fullscreenchange');
    fake.doc.fullscreenElement = null;
    fake.fire('document', 'fullscreenchange');
    expect(fake.events).toEqual([
      'monitoring-started',
      'tab-hidden',
      'tab-visible',
      'window-blur',
      'window-focus',
      'fullscreen-entered',
      'fullscreen-exited',
    ]);
    expect(monitor.getState().fullscreenExited).toBe(true);
    monitor.dismissFullscreenWarning();
    expect(monitor.getState().fullscreenExited).toBe(false);
  });

  it('does nothing at all in standard mode', () => {
    const fake = fakeEnv();
    const monitor = new IntegrityMonitor(fake.env, 'standard', fake.onEvent);
    monitor.start();
    fake.fire('window', 'blur');
    expect(fake.events).toEqual([]);
    expect(fake.listenerCount()).toBe(0);
  });

  it('does not block shortcuts or watch the pointer in strict practice', () => {
    const fake = fakeEnv({ extended: true });
    const monitor = new IntegrityMonitor(fake.env, 'focus', fake.onEvent);
    monitor.start();
    expect(fake.fire('document', 'copy')).toBe(false);
    fake.fire('document', 'mouseout', { relatedTarget: null });
    expect(fake.events).toEqual(['monitoring-started']);
  });

  it('removes every listener when stopped, and stop is safe to repeat', () => {
    const fake = fakeEnv();
    const monitor = new IntegrityMonitor(fake.env, 'focus', fake.onEvent);
    monitor.start();
    expect(fake.listenerCount()).toBe(4);
    monitor.stop();
    monitor.stop();
    expect(fake.listenerCount()).toBe(0);
    fake.fire('window', 'blur');
    expect(fake.events).toEqual(['monitoring-started']);
  });

  it('logs when the learner stops monitoring', () => {
    const fake = fakeEnv();
    const monitor = new IntegrityMonitor(fake.env, 'focus', fake.onEvent);
    monitor.start();
    monitor.stop(true);
    expect(fake.events).toEqual(['monitoring-started', 'monitoring-stopped']);
    expect(monitor.getState().active).toBe(false);
  });

  it('can be restarted after stopping (React runs effects twice in development)', () => {
    const fake = fakeEnv();
    const monitor = new IntegrityMonitor(fake.env, 'focus', fake.onEvent);
    monitor.start();
    monitor.stop();
    monitor.start();
    expect(fake.listenerCount()).toBe(4);
  });
});

describe('fullscreen', () => {
  it('reports a refused fullscreen request without throwing', async () => {
    const fake = fakeEnv({ fullscreen: 'reject' });
    const monitor = new IntegrityMonitor(fake.env, 'focus', fake.onEvent);
    await expect(monitor.requestFullscreen()).resolves.toBe(false);
    expect(fake.events).toEqual(['fullscreen-unavailable']);
    expect(monitor.getState().fullscreen).toBe('unavailable');
  });

  it('reports a browser without fullscreen support', async () => {
    const fake = fakeEnv({ fullscreen: 'missing' });
    const monitor = new IntegrityMonitor(fake.env, 'focus', fake.onEvent);
    await expect(monitor.requestFullscreen()).resolves.toBe(false);
    expect(fake.events).toEqual(['fullscreen-unavailable']);
  });

  it('leaves fullscreen when monitoring ends', () => {
    const fake = fakeEnv();
    const monitor = new IntegrityMonitor(fake.env, 'focus', fake.onEvent);
    monitor.start();
    fake.doc.fullscreenElement = {} as Element;
    monitor.stop();
    expect(fake.doc.exitFullscreen).toHaveBeenCalled();
  });
});

describe('proctored browser signals', () => {
  it('AC-7.3 blocks copy, paste, the context menu and printing, and logs them', () => {
    const fake = fakeEnv();
    const monitor = new IntegrityMonitor(fake.env, 'proctored', fake.onEvent);
    monitor.start();
    for (const name of ['copy', 'paste', 'cut', 'contextmenu']) {
      expect(fake.fire('document', name)).toBe(true);
      fake.advance(2000);
    }
    expect(fake.fire('window', 'keydown', key('c', { ctrlKey: true }))).toBe(true);
    fake.advance(2000);
    expect(fake.fire('window', 'keyup', key('PrintScreen'))).toBe(true);
    expect(fake.events.filter((e) => e === 'blocked-shortcut')).toHaveLength(6);
  });

  it('AC-7.3 logs a held-down shortcut once, not on every key repeat', () => {
    const fake = fakeEnv();
    const monitor = new IntegrityMonitor(fake.env, 'proctored', fake.onEvent);
    monitor.start();
    for (let i = 0; i < 5; i++) fake.fire('window', 'keydown', key('F12'));
    expect(fake.events.filter((e) => e === 'blocked-shortcut')).toHaveLength(1);
  });

  it('AC-7.3 lets ordinary keys through (answers can be chosen with the keyboard)', () => {
    const fake = fakeEnv();
    const monitor = new IntegrityMonitor(fake.env, 'proctored', fake.onEvent);
    monitor.start();
    for (const k of ['ArrowDown', ' ', 'Enter', 'Tab', 'a']) {
      expect(fake.fire('window', 'keydown', key(k))).toBe(false);
    }
    expect(fake.events).toEqual(['monitoring-started']);
  });

  it('AC-7.3 logs the pointer leaving the page, but not moving between elements', () => {
    const fake = fakeEnv();
    const monitor = new IntegrityMonitor(fake.env, 'proctored', fake.onEvent);
    monitor.start();
    fake.fire('document', 'mouseout', { relatedTarget: {} });
    fake.fire('document', 'mouseout', { relatedTarget: null });
    expect(fake.events).toEqual(['monitoring-started', 'pointer-left']);
  });

  it('AC-7.3 reports a second display at the start and when one is connected', () => {
    const fake = fakeEnv({ extended: true });
    const monitor = new IntegrityMonitor(fake.env, 'proctored', fake.onEvent);
    monitor.start();
    expect(fake.events).toEqual(['monitoring-started', 'extra-display']);

    const single = fakeEnv();
    const other = new IntegrityMonitor(single.env, 'proctored', single.onEvent);
    other.start();
    single.fire('screen', 'change');
    single.screen.isExtended = true;
    single.fire('screen', 'change');
    expect(single.events).toEqual(['monitoring-started', 'extra-display']);
  });

  it('AC-7.7 removes every proctored listener when stopped', () => {
    const fake = fakeEnv();
    const monitor = new IntegrityMonitor(fake.env, 'proctored', fake.onEvent);
    monitor.start();
    expect(fake.listenerCount()).toBeGreaterThan(4);
    monitor.stop();
    expect(fake.listenerCount()).toBe(0);
  });
});

describe('isBlockedShortcut', () => {
  it('AC-7.3 covers copy, paste, print, save, dev tools and screenshots', () => {
    expect(isBlockedShortcut(key('v', { ctrlKey: true }))).toBe(true);
    expect(isBlockedShortcut(key('P', { metaKey: true }))).toBe(true);
    expect(isBlockedShortcut(key('i', { ctrlKey: true, shiftKey: true }))).toBe(true);
    expect(isBlockedShortcut(key('i', { metaKey: true, altKey: true }))).toBe(true);
    expect(isBlockedShortcut(key('s', { metaKey: true, shiftKey: true }))).toBe(true);
    expect(isBlockedShortcut(key('F12'))).toBe(true);
    expect(isBlockedShortcut(key('c'))).toBe(false);
    expect(isBlockedShortcut(key('ArrowLeft', { ctrlKey: true }))).toBe(false);
  });
});
