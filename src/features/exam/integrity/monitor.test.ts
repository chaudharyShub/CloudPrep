import { describe, expect, it, vi } from 'vitest';
import type { IntegrityEventType } from '@/domain/exam/integrity';
import {
  IntegrityMonitor,
  webcamChecksSupported,
  type FaceDetectorLike,
  type MonitorEnvironment,
} from './monitor';

/** A fake browser: event targets we can fire, a controllable camera and face detector. */
function fakeEnv(
  options: {
    camera?: 'ok' | 'denied' | 'missing' | 'none';
    detector?: boolean;
    fullscreen?: 'ok' | 'reject' | 'missing';
  } = {},
) {
  const { camera = 'ok', detector = true, fullscreen = 'ok' } = options;
  const listeners = {
    window: new Map<string, Set<() => void>>(),
    document: new Map<string, Set<() => void>>(),
  };
  const target = (kind: 'window' | 'document') => ({
    addEventListener: vi.fn((name: string, fn: () => void) => {
      const set = listeners[kind].get(name) ?? new Set();
      set.add(fn);
      listeners[kind].set(name, set);
    }),
    removeEventListener: vi.fn((name: string, fn: () => void) => {
      listeners[kind].get(name)?.delete(fn);
    }),
  });
  const fire = (kind: 'window' | 'document', name: string) => {
    for (const fn of listeners[kind].get(name) ?? []) fn();
  };
  const trackEnded = new Set<() => void>();
  const track = {
    stop: vi.fn(),
    addEventListener: vi.fn((_: string, fn: () => void) => trackEnded.add(fn)),
  };
  const stream = {
    getTracks: () => [track],
    getVideoTracks: () => [track],
  } as unknown as MediaStream;
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
  let interval: (() => void) | null = null;
  let faces: unknown[] = [];
  const faceDetector: FaceDetectorLike = { detect: vi.fn(() => Promise.resolve(faces)) };
  const video = {
    play: vi.fn(() => Promise.resolve()),
    srcObject: null,
    muted: false,
    playsInline: false,
  };
  const env: MonitorEnvironment = {
    window: target('window'),
    document: doc as unknown as MonitorEnvironment['document'],
    getUserMedia:
      camera === 'none'
        ? null
        : vi.fn(() =>
            camera === 'ok'
              ? Promise.resolve(stream)
              : Promise.reject(
                  new DOMException('no', camera === 'denied' ? 'NotAllowedError' : 'NotFoundError'),
                ),
          ),
    faceDetector: detector ? () => faceDetector : null,
    createVideo: () => video as unknown as HTMLVideoElement,
    now: () => 1000,
    setInterval: vi.fn((fn: () => void) => {
      interval = fn;
      return 7;
    }),
    clearInterval: vi.fn(() => {
      interval = null;
    }),
  };
  const events: IntegrityEventType[] = [];
  return {
    env,
    events,
    onEvent: (type: IntegrityEventType) => events.push(type),
    fire,
    doc,
    track,
    endTrack: () => {
      for (const fn of trackEnded) fn();
    },
    setFaces: (n: number) => {
      faces = Array.from({ length: n }, () => ({}));
    },
    tick: async () => {
      interval?.();
      await Promise.resolve();
      await Promise.resolve();
    },
    listenerCount: () =>
      [...listeners.window.values(), ...listeners.document.values()].reduce(
        (n, set) => n + set.size,
        0,
      ),
    hasInterval: () => interval !== null,
  };
}

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

  it('does nothing at all in standard mode', async () => {
    const fake = fakeEnv();
    const monitor = new IntegrityMonitor(fake.env, 'standard', fake.onEvent);
    monitor.start();
    await monitor.startCamera();
    fake.fire('window', 'blur');
    expect(fake.events).toEqual([]);
    expect(fake.listenerCount()).toBe(0);
    expect(fake.env.getUserMedia).not.toHaveBeenCalled();
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

describe('webcam checks', () => {
  it('reports camera permission denial and continues without the camera', async () => {
    const fake = fakeEnv({ camera: 'denied' });
    const monitor = new IntegrityMonitor(fake.env, 'webcam', fake.onEvent);
    await monitor.startCamera();
    expect(fake.events).toEqual(['camera-denied']);
    expect(monitor.getState().camera).toBe('denied');
  });

  it('reports a missing camera or unsupported browser as unavailable', async () => {
    const missing = fakeEnv({ camera: 'missing' });
    await new IntegrityMonitor(missing.env, 'webcam', missing.onEvent).startCamera();
    expect(missing.events).toEqual(['camera-unavailable']);

    const noDetector = fakeEnv({ detector: false });
    await new IntegrityMonitor(noDetector.env, 'webcam', noDetector.onEvent).startCamera();
    expect(noDetector.events).toEqual(['camera-unavailable']);
    expect(noDetector.env.getUserMedia).not.toHaveBeenCalled();
    expect(webcamChecksSupported(noDetector.env)).toBe(false);
  });

  it('logs face changes only when the state changes', async () => {
    const fake = fakeEnv();
    const monitor = new IntegrityMonitor(fake.env, 'webcam', fake.onEvent);
    await monitor.startCamera();
    fake.setFaces(1);
    await fake.tick();
    await fake.tick(); // same state: not logged again
    fake.setFaces(0);
    await fake.tick();
    fake.setFaces(2);
    await fake.tick();
    expect(fake.events).toEqual([
      'camera-started',
      'face-visible',
      'face-not-detected',
      'multiple-faces',
    ]);
    expect(monitor.getState().face).toBe('multiple');
  });

  it('stops all media tracks and the detection timer when the camera is turned off', async () => {
    const fake = fakeEnv();
    const monitor = new IntegrityMonitor(fake.env, 'webcam', fake.onEvent);
    await monitor.startCamera();
    monitor.stopCamera();
    expect(fake.track.stop).toHaveBeenCalledTimes(1);
    expect(fake.hasInterval()).toBe(false);
    expect(monitor.getState().camera).toBe('off');
    expect(fake.events.at(-1)).toBe('camera-stopped');
  });

  it('stops media tracks when the session is cleaned up', async () => {
    const fake = fakeEnv();
    const monitor = new IntegrityMonitor(fake.env, 'webcam', fake.onEvent);
    monitor.start();
    await monitor.startCamera();
    monitor.stop();
    expect(fake.track.stop).toHaveBeenCalledTimes(1);
    expect(fake.hasInterval()).toBe(false);
  });

  it('releases the camera if monitoring stopped while waiting for permission', async () => {
    const fake = fakeEnv();
    const monitor = new IntegrityMonitor(fake.env, 'webcam', fake.onEvent);
    monitor.start();
    const starting = monitor.startCamera();
    monitor.stop();
    await starting;
    expect(fake.track.stop).toHaveBeenCalledTimes(1);
    expect(fake.events).not.toContain('camera-started');
  });

  it('reports a camera that disconnects during the exam', async () => {
    const fake = fakeEnv();
    const monitor = new IntegrityMonitor(fake.env, 'webcam', fake.onEvent);
    await monitor.startCamera();
    fake.endTrack();
    expect(fake.events.at(-1)).toBe('camera-unavailable');
    expect(monitor.getState().camera).toBe('unavailable');
    expect(fake.track.stop).toHaveBeenCalled();
  });

  it('ignores a failed detection frame', async () => {
    const fake = fakeEnv();
    const monitor = new IntegrityMonitor(fake.env, 'webcam', fake.onEvent);
    await monitor.startCamera();
    await monitor.checkFaces({ detect: () => Promise.reject(new Error('frame')) });
    expect(fake.events).toEqual(['camera-started']);
  });
});
