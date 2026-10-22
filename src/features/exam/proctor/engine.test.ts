import { describe, expect, it, vi } from 'vitest';
import type { IntegrityEventType } from '@/domain/exam/integrity';
import type { FrameSignals, ObjectSignals } from '@/domain/exam/proctor';
import type { ProctorAnalyzer } from './analyzer';
import { CALIBRATION_MS, MUTE_GRACE_MS, ProctorEngine, type ProctorEnvironment } from './engine';

const FACE = { yaw: 0, pitch: 0, gazeSide: 0, gazeUp: 0, gazeDown: 0, blink: 0, jawOpen: 0 };

/** Fake camera, microphone, models and clock. Timers only run when the test says so. */
function fakeEnv(
  options: { media?: 'ok' | 'denied' | 'busy' | 'none'; model?: 'ok' | 'fail' } = {},
) {
  const { media = 'ok', model = 'ok' } = options;
  const trackListeners = new Map<string, Map<string, () => void>>();
  const makeTrack = (kind: 'video' | 'audio') => {
    const listeners = new Map<string, () => void>();
    trackListeners.set(kind, listeners);
    return {
      kind,
      label: kind === 'video' ? 'Integrated Webcam' : 'Microphone',
      muted: false,
      readyState: 'live',
      stop: vi.fn(function (this: { readyState: string }) {
        this.readyState = 'ended';
      }),
      addEventListener: vi.fn((name: string, fn: () => void) => listeners.set(name, fn)),
    };
  };
  const video = makeTrack('video');
  const audio = makeTrack('audio');
  const stream = {
    getTracks: () => [video, audio],
    getVideoTracks: () => [video],
    getAudioTracks: () => [audio],
  } as unknown as MediaStream;

  let frame: FrameSignals = { faces: 1, face: FACE, brightness: 120 };
  let objects: ObjectSignals = { phone: false, persons: 1, items: 0 };
  let db = -60;
  const analyzer: ProctorAnalyzer = {
    analyzeFrame: () => frame,
    detectObjects: () => objects,
    close: vi.fn(),
  };
  const meter = { read: () => db, resume: vi.fn(() => Promise.resolve()), close: vi.fn() };
  let now = 0;
  const intervals = new Map<number, { fn: () => void; ms: number; next: number }>();
  const timeouts = new Map<number, { fn: () => void; at: number }>();
  let id = 0;

  const env: ProctorEnvironment = {
    getUserMedia:
      media === 'none'
        ? null
        : vi.fn(() =>
            media === 'ok'
              ? Promise.resolve(stream)
              : Promise.reject(
                  new DOMException(
                    'x',
                    media === 'denied' ? 'NotAllowedError' : 'NotReadableError',
                  ),
                ),
          ),
    loadAnalyzer: vi.fn(() =>
      model === 'ok' ? Promise.resolve(analyzer) : Promise.reject(new Error('offline')),
    ),
    createLevelMeter: () => meter,
    createVideo: () =>
      ({
        play: () => Promise.resolve(),
        muted: false,
        playsInline: false,
        srcObject: null,
      }) as unknown as HTMLVideoElement,
    now: () => now,
    setInterval: (fn, ms) => {
      intervals.set(++id, { fn, ms, next: now + ms });
      return id;
    },
    clearInterval: (key) => {
      intervals.delete(key);
    },
    setTimeout: (fn, ms) => {
      timeouts.set(++id, { fn, at: now + ms });
      return id;
    },
    clearTimeout: (key) => {
      timeouts.delete(key);
    },
  };

  /** Moves the clock forward, running due timers in order. */
  const advance = async (ms: number) => {
    const end = now + ms;
    for (;;) {
      let nextAt = end;
      for (const t of intervals.values()) nextAt = Math.min(nextAt, t.next);
      for (const t of timeouts.values()) nextAt = Math.min(nextAt, t.at);
      now = nextAt;
      for (const t of intervals.values()) {
        if (t.next <= now) {
          t.next += t.ms;
          t.fn();
        }
      }
      for (const [key, t] of timeouts) {
        if (t.at <= now) {
          timeouts.delete(key);
          t.fn();
        }
      }
      await Promise.resolve();
      if (now >= end) break;
    }
  };

  return {
    env,
    video,
    audio,
    analyzer,
    meter,
    advance,
    fireTrack: (kind: 'video' | 'audio', name: string) => trackListeners.get(kind)?.get(name)?.(),
    setFrame: (next: Partial<FrameSignals>) => {
      frame = { ...frame, ...next };
    },
    setObjects: (next: Partial<ObjectSignals>) => {
      objects = { ...objects, ...next };
    },
    setDb: (value: number) => {
      db = value;
    },
    activeTimers: () => intervals.size + timeouts.size,
  };
}

async function readyEngine(fake: ReturnType<typeof fakeEnv>) {
  const engine = new ProctorEngine(fake.env);
  expect(await engine.prepare()).toBe(true);
  const calibrated = engine.calibrate();
  await fake.advance(CALIBRATION_MS);
  expect(await calibrated).toBe(true);
  const events: IntegrityEventType[] = [];
  engine.begin('exam-1', (type) => events.push(type));
  return { engine, events };
}

describe('ProctorEngine', () => {
  it('AC-7.1 starts the camera, microphone and models, then calibrates and begins', async () => {
    const fake = fakeEnv();
    const { engine, events } = await readyEngine(fake);
    const constraints = vi.mocked(fake.env.getUserMedia)?.mock.calls[0]?.[0];
    // Raw sound: no noise suppression, so quiet speech is measured.
    expect(constraints?.audio).toMatchObject({ noiseSuppression: false });
    expect(engine.getState()).toMatchObject({ phase: 'running', cameraLabel: 'Integrated Webcam' });
    expect(engine.getState().calibration?.noiseDb).toBe(-60);
    expect(engine.examId).toBe('exam-1');
    expect(events).toEqual(['proctor-started']);
  });

  it('AC-7.1 explains permission, busy-device and model failures', async () => {
    for (const [options, error] of [
      [{ media: 'denied' }, 'permission-denied'],
      [{ media: 'busy' }, 'device-busy'],
      [{ media: 'none' }, 'unsupported'],
      [{ model: 'fail' }, 'model-failed'],
    ] as const) {
      const fake = fakeEnv(options);
      const engine = new ProctorEngine(fake.env);
      expect(await engine.prepare()).toBe(false);
      expect(engine.getState()).toMatchObject({ phase: 'error', error });
    }
  });

  it('AC-7.7 releases the camera and microphone if the models fail to load', async () => {
    const fake = fakeEnv({ model: 'fail' });
    await new ProctorEngine(fake.env).prepare();
    expect(fake.video.stop).toHaveBeenCalled();
    expect(fake.audio.stop).toHaveBeenCalled();
  });

  it('AC-7.1 refuses to calibrate without a single face in view', async () => {
    const fake = fakeEnv();
    const engine = new ProctorEngine(fake.env);
    await engine.prepare();
    fake.setFrame({ faces: 0, face: null });
    const calibrated = engine.calibrate();
    await fake.advance(CALIBRATION_MS);
    expect(await calibrated).toBe(false);
    expect(engine.getState()).toMatchObject({ phase: 'ready', error: 'calibration-failed' });
  });

  it('AC-7.1 keeps calibrating on a slow device until it has enough frames', async () => {
    const fake = fakeEnv();
    const engine = new ProctorEngine(fake.env);
    await engine.prepare();
    let frames = 0;
    const original = fake.analyzer.analyzeFrame;
    // Only every fourth frame arrives (a busy device).
    fake.analyzer.analyzeFrame = (video, now) => (frames++ % 4 === 0 ? original(video, now) : null);
    const calibrated = engine.calibrate(2000);
    await fake.advance(2000);
    expect(engine.getState().phase).toBe('calibrating');
    await fake.advance(4000);
    expect(await calibrated).toBe(true);
  });

  it('AC-7.2 reports violations from the camera, objects and microphone while running', async () => {
    const fake = fakeEnv();
    const { events } = await readyEngine(fake);
    fake.setFrame({ face: { ...FACE, yaw: 45 } });
    await fake.advance(2500);
    fake.setFrame({ face: FACE });
    fake.setObjects({ phone: true });
    fake.setDb(-20);
    await fake.advance(2500);
    expect(events).toEqual(
      expect.arrayContaining(['looking-away', 'phone-detected', 'voice-detected']),
    );
  });

  it('AC-7.2 reports nothing before the exam begins (during check-in)', async () => {
    const fake = fakeEnv();
    const engine = new ProctorEngine(fake.env);
    const listener = vi.fn();
    engine.setListener(listener);
    await engine.prepare();
    fake.setObjects({ phone: true });
    await fake.advance(5000);
    expect(listener).not.toHaveBeenCalled();
    expect(engine.getState().objects?.phone).toBe(true);
  });

  it('AC-7.4 reports a lost camera at once, and a muted microphone after a grace period', async () => {
    const fake = fakeEnv();
    const { events } = await readyEngine(fake);
    fake.fireTrack('video', 'ended');
    expect(events.at(-1)).toBe('camera-lost');

    fake.audio.muted = true;
    fake.fireTrack('audio', 'mute');
    await fake.advance(MUTE_GRACE_MS - 100);
    expect(events).not.toContain('microphone-lost');
    await fake.advance(200);
    expect(events.at(-1)).toBe('microphone-lost');
  });

  it('AC-7.7 stops every track, timer and model on stop, and stop is safe to repeat', async () => {
    const fake = fakeEnv();
    const { engine, events } = await readyEngine(fake);
    engine.stop();
    engine.stop();
    expect(fake.video.stop).toHaveBeenCalled();
    expect(fake.audio.stop).toHaveBeenCalled();
    expect(fake.analyzer.close).toHaveBeenCalledTimes(1);
    expect(fake.meter.close).toHaveBeenCalledTimes(1);
    expect(fake.activeTimers()).toBe(0);
    expect(engine.getState()).toMatchObject({ phase: 'stopped', stream: null });
    fake.fireTrack('video', 'ended');
    expect(events).toEqual(['proctor-started']);
  });
});
