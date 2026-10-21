import type { IntegrityEventType, IntegrityMode } from '@/domain/exam/integrity';

/** Minimal shape of the browser's experimental FaceDetector (Shape Detection API). */
export interface FaceDetectorLike {
  detect: (source: HTMLVideoElement) => Promise<readonly unknown[]>;
}
export type FaceDetectorFactory = () => FaceDetectorLike;

/** Browser APIs the monitor uses; injected so tests can mock them. */
export interface MonitorEnvironment {
  window: Pick<Window, 'addEventListener' | 'removeEventListener'>;
  document: Pick<
    Document,
    | 'addEventListener'
    | 'removeEventListener'
    | 'visibilityState'
    | 'fullscreenElement'
    | 'exitFullscreen'
  > & { documentElement: { requestFullscreen?: () => Promise<void> } };
  getUserMedia: ((constraints: MediaStreamConstraints) => Promise<MediaStream>) | null;
  faceDetector: FaceDetectorFactory | null;
  createVideo: () => HTMLVideoElement;
  now: () => number;
  setInterval: (fn: () => void, ms: number) => number;
  clearInterval: (id: number) => void;
}

export type CameraState = 'off' | 'starting' | 'on' | 'denied' | 'unavailable';
export type FaceState = 'unknown' | 'visible' | 'none' | 'multiple';
export type FullscreenState = 'off' | 'on' | 'unavailable';

export interface MonitorState {
  active: boolean;
  fullscreen: FullscreenState;
  /** True after fullscreen was exited during the exam (until it is re-entered). */
  fullscreenExited: boolean;
  camera: CameraState;
  face: FaceState;
}

/** How often (ms) a camera frame is checked for faces. Frames are never stored. */
export const FACE_CHECK_INTERVAL_MS = 3000;

/** Whether this browser can run webcam checks (camera access plus built-in face detection). */
export function webcamChecksSupported(
  env: Pick<MonitorEnvironment, 'getUserMedia' | 'faceDetector'>,
): boolean {
  return env.getUserMedia !== null && env.faceDetector !== null;
}

export function browserEnvironment(): MonitorEnvironment {
  const media = typeof navigator !== 'undefined' ? navigator.mediaDevices : undefined;
  const Detector = (globalThis as { FaceDetector?: new (options?: object) => FaceDetectorLike })
    .FaceDetector;
  return {
    window,
    document,
    getUserMedia: media?.getUserMedia ? (constraints) => media.getUserMedia(constraints) : null,
    faceDetector: Detector ? () => new Detector({ maxDetectedFaces: 3, fastMode: true }) : null,
    createVideo: () => document.createElement('video'),
    now: () => Date.now(),
    setInterval: (fn, ms) => window.setInterval(fn, ms),
    clearInterval: (id) => {
      window.clearInterval(id);
    },
  };
}

/**
 * Watches browser signals during a strict-practice exam and reports them as events.
 * Only event types and timestamps leave this class; camera frames are analysed in memory
 * and discarded. `stop()` removes every listener and stops every camera track.
 */
export class IntegrityMonitor {
  private state: MonitorState = {
    active: false,
    fullscreen: 'off',
    fullscreenExited: false,
    camera: 'off',
    face: 'unknown',
  };
  private readonly listeners = new Set<() => void>();
  private stream: MediaStream | null = null;
  private video: HTMLVideoElement | null = null;
  private faceTimer: number | null = null;
  private readonly cleanups: (() => void)[] = [];
  private stopped = false;

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

  /** Attaches focus and fullscreen listeners. Does nothing in standard mode. */
  start(): void {
    if (this.mode === 'standard' || this.state.active) return;
    this.stopped = false; // restartable (React development mode runs effects twice)
    this.set({ active: true, fullscreen: this.env.document.fullscreenElement ? 'on' : 'off' });
    this.log('monitoring-started');

    const listen = <K extends string>(
      target: {
        addEventListener: (k: K, fn: () => void) => void;
        removeEventListener: (k: K, fn: () => void) => void;
      },
      name: K,
      handler: () => void,
    ) => {
      target.addEventListener(name, handler);
      this.cleanups.push(() => {
        target.removeEventListener(name, handler);
      });
    };
    const doc = this.env.document as unknown as Parameters<typeof listen>[0];
    const win = this.env.window as unknown as Parameters<typeof listen>[0];
    listen(doc, 'visibilitychange', () => {
      this.log(this.env.document.visibilityState === 'hidden' ? 'tab-hidden' : 'tab-visible');
    });
    listen(win, 'blur', () => {
      this.log('window-blur');
    });
    listen(win, 'focus', () => {
      this.log('window-focus');
    });
    listen(doc, 'fullscreenchange', () => {
      if (this.env.document.fullscreenElement) {
        this.set({ fullscreen: 'on', fullscreenExited: false });
        this.log('fullscreen-entered');
      } else {
        this.set({ fullscreen: 'off', fullscreenExited: true });
        this.log('fullscreen-exited');
      }
    });
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

  /** Lets the learner continue without fullscreen after exiting it. */
  dismissFullscreenWarning(): void {
    this.set({ fullscreenExited: false });
  }

  /** Starts the camera for local face-presence checks (webcam mode only). */
  async startCamera(): Promise<void> {
    if (this.mode !== 'webcam' || this.stream || this.state.camera === 'starting') return;
    const { getUserMedia, faceDetector } = this.env;
    if (!getUserMedia || !faceDetector) {
      this.set({ camera: 'unavailable' });
      this.log('camera-unavailable');
      return;
    }
    this.set({ camera: 'starting' });
    let stream: MediaStream;
    try {
      stream = await getUserMedia({ video: { width: 320, height: 240 }, audio: false });
    } catch (error) {
      const denied =
        error instanceof DOMException &&
        (error.name === 'NotAllowedError' || error.name === 'SecurityError');
      this.set({ camera: denied ? 'denied' : 'unavailable' });
      this.log(denied ? 'camera-denied' : 'camera-unavailable');
      return;
    }
    if (this.stopped) {
      // Stopped while waiting for permission: release the camera immediately.
      for (const track of stream.getTracks()) track.stop();
      return;
    }
    this.stream = stream;
    for (const track of stream.getVideoTracks()) {
      track.addEventListener('ended', () => {
        if (!this.stream) return;
        this.releaseCamera();
        this.set({ camera: 'unavailable', face: 'unknown' });
        this.log('camera-unavailable');
      });
    }
    const video = this.env.createVideo();
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    this.video = video;
    try {
      await video.play();
    } catch {
      // Frames may still be available; detection handles failures below.
    }
    this.set({ camera: 'on' });
    this.log('camera-started');
    const detector = faceDetector();
    this.faceTimer = this.env.setInterval(() => {
      void this.checkFaces(detector);
    }, FACE_CHECK_INTERVAL_MS);
  }

  /** One detection pass. Logs only when the face state changes, to avoid noise. */
  async checkFaces(detector: FaceDetectorLike): Promise<void> {
    if (!this.video) return;
    let count: number;
    try {
      count = (await detector.detect(this.video)).length;
    } catch {
      return; // A failed frame isn't evidence of anything.
    }
    // The camera may have been turned off while detection was running.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!this.video) return;
    const face: FaceState = count === 0 ? 'none' : count === 1 ? 'visible' : 'multiple';
    if (face === this.state.face) return;
    this.set({ face });
    this.log(
      face === 'visible'
        ? 'face-visible'
        : face === 'none'
          ? 'face-not-detected'
          : 'multiple-faces',
    );
  }

  private releaseCamera() {
    if (this.faceTimer !== null) this.env.clearInterval(this.faceTimer);
    this.faceTimer = null;
    if (this.stream) for (const track of this.stream.getTracks()) track.stop();
    this.stream = null;
    if (this.video) this.video.srcObject = null;
    this.video = null;
  }

  /** Turns the camera off at the learner's request; the exam continues. */
  stopCamera(): void {
    if (!this.stream) return;
    this.releaseCamera();
    this.set({ camera: 'off', face: 'unknown' });
    this.log('camera-stopped');
  }

  /**
   * Ends monitoring: removes all listeners, stops all camera tracks and leaves fullscreen.
   * Safe to call more than once. `byUser` logs that the learner switched monitoring off.
   */
  stop(byUser = false): void {
    if (this.stopped) return;
    this.stopped = true;
    if (byUser && this.state.active) this.log('monitoring-stopped');
    for (const cleanup of this.cleanups.splice(0)) cleanup();
    if (this.stream) {
      this.releaseCamera();
      if (byUser) this.log('camera-stopped');
    }
    if (this.env.document.fullscreenElement) {
      void this.env.document.exitFullscreen().catch(() => undefined);
    }
    this.set({
      active: false,
      camera: this.state.camera === 'on' ? 'off' : this.state.camera,
      face: 'unknown',
    });
  }
}
