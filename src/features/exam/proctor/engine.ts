import type { IntegrityEventType } from '@/domain/exam/integrity';
import {
  calibrate,
  createProctorTracker,
  stepProctor,
  type FaceReading,
  type FrameSignals,
  type ObjectSignals,
  type ProctorCalibration,
  type ProctorInput,
  type ProctorTrackerState,
} from '@/domain/exam/proctor';
import { loadProctorAnalyzer, type ProctorAnalyzer } from './analyzer';
import { createLevelMeter, type LevelMeter } from './audio';

/** Browser APIs the engine uses; injected so tests can replace them. */
export interface ProctorEnvironment {
  getUserMedia: ((constraints: MediaStreamConstraints) => Promise<MediaStream>) | null;
  loadAnalyzer: () => Promise<ProctorAnalyzer>;
  createLevelMeter: (stream: MediaStream) => LevelMeter;
  createVideo: () => HTMLVideoElement;
  now: () => number;
  setInterval: (fn: () => void, ms: number) => number;
  clearInterval: (id: number) => void;
  setTimeout: (fn: () => void, ms: number) => number;
  clearTimeout: (id: number) => void;
}

export function browserProctorEnvironment(): ProctorEnvironment {
  const media = typeof navigator !== 'undefined' ? navigator.mediaDevices : undefined;
  return {
    getUserMedia: media?.getUserMedia ? (constraints) => media.getUserMedia(constraints) : null,
    loadAnalyzer: loadProctorAnalyzer,
    createLevelMeter,
    createVideo: () => document.createElement('video'),
    now: () => Date.now(),
    setInterval: (fn, ms) => window.setInterval(fn, ms),
    clearInterval: (id) => {
      window.clearInterval(id);
    },
    setTimeout: (fn, ms) => window.setTimeout(fn, ms),
    clearTimeout: (id) => {
      window.clearTimeout(id);
    },
  };
}

export type ProctorPhase =
  | 'idle'
  | 'requesting'
  | 'loading'
  | 'ready'
  | 'calibrating'
  | 'calibrated'
  | 'running'
  | 'stopped'
  | 'error';

export type ProctorError =
  | 'unsupported'
  | 'permission-denied'
  | 'no-device'
  | 'device-busy'
  | 'model-failed'
  | 'calibration-failed';

export interface ProctorState {
  phase: ProctorPhase;
  error: ProctorError | null;
  /** For the live preview. Never recorded. */
  stream: MediaStream | null;
  cameraLabel: string;
  frame: FrameSignals | null;
  objects: ObjectSignals | null;
  levelDb: number | null;
  cameraLost: boolean;
  microphoneLost: boolean;
  calibration: ProctorCalibration | null;
}

export const INITIAL_PROCTOR_STATE: ProctorState = {
  phase: 'idle',
  error: null,
  stream: null,
  cameraLabel: '',
  frame: null,
  objects: null,
  levelDb: null,
  cameraLost: false,
  microphoneLost: false,
  calibration: null,
};

/** Face model runs 4 times a second, the heavier object model once a second. */
export const FRAME_INTERVAL_MS = 250;
export const OBJECT_INTERVAL_MS = 1000;
export const AUDIO_INTERVAL_MS = 100;
export const CALIBRATION_MS = 3000;
/** A muted track (for example a hardware privacy switch) counts as lost after this long. */
export const MUTE_GRACE_MS = 3000;
/** Share of calibration frames that must show exactly one face. */
const CALIBRATION_FACE_SHARE = 0.6;
/** Calibration waits for at least this many frames (slow devices), up to 3× its duration. */
const MIN_CALIBRATION_FRAMES = 6;

export type ProctorListener = (type: IntegrityEventType, at: number) => void;

/**
 * The AI proctor for one exam. Lifecycle: `prepare` (camera, microphone, models) →
 * `calibrate` (neutral pose and room noise) → `begin` (rules apply, violations reported to
 * the listener) → `stop` (every track stopped, models closed). Frames and audio are
 * analysed in memory and discarded; only event types leave this class.
 */
export class ProctorEngine {
  private state: ProctorState = INITIAL_PROCTOR_STATE;
  private readonly subscribers = new Set<() => void>();
  private stream: MediaStream | null = null;
  private video: HTMLVideoElement | null = null;
  private meter: LevelMeter | null = null;
  private analyzer: ProctorAnalyzer | null = null;
  private intervals: number[] = [];
  private timeouts: number[] = [];
  private tracker: ProctorTrackerState | null = null;
  private listener: ProctorListener | null = null;
  private calibrationFaces: FaceReading[] = [];
  private calibrationNoise: number[] = [];
  private calibrationFrames = 0;
  private stopped = false;
  /** Read through a method so checks after `await` aren't narrowed away. */
  private isStopped = () => this.stopped;
  /** The exam this engine proctors, once it has begun. */
  examId: string | null = null;

  constructor(private readonly env: ProctorEnvironment = browserProctorEnvironment()) {}

  getState = (): ProctorState => this.state;

  subscribe = (subscriber: () => void): (() => void) => {
    this.subscribers.add(subscriber);
    return () => {
      this.subscribers.delete(subscriber);
    };
  };

  private set(patch: Partial<ProctorState>) {
    this.state = { ...this.state, ...patch };
    for (const subscriber of this.subscribers) subscriber();
  }

  private emit(type: IntegrityEventType) {
    this.listener?.(type, this.env.now());
  }

  /** Starts the camera, microphone and models. Call from a user action. */
  async prepare(): Promise<boolean> {
    if (this.state.phase !== 'idle' && this.state.phase !== 'error') {
      return this.state.phase !== 'stopped';
    }
    const { getUserMedia } = this.env;
    if (!getUserMedia) {
      this.set({ phase: 'error', error: 'unsupported' });
      return false;
    }
    this.set({ phase: 'requesting', error: null });
    let stream: MediaStream;
    try {
      stream = await getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        // Raw sound, so quiet speech isn't filtered out before it's measured.
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
    } catch (error) {
      const name = error instanceof DOMException ? error.name : '';
      const reason: ProctorError =
        name === 'NotAllowedError' || name === 'SecurityError'
          ? 'permission-denied'
          : name === 'NotReadableError' || name === 'AbortError'
            ? 'device-busy'
            : 'no-device';
      this.set({ phase: 'error', error: reason });
      return false;
    }
    if (this.stopped) {
      for (const track of stream.getTracks()) track.stop();
      return false;
    }
    const [videoTrack] = stream.getVideoTracks();
    const [audioTrack] = stream.getAudioTracks();
    if (!videoTrack || !audioTrack) {
      for (const track of stream.getTracks()) track.stop();
      this.set({ phase: 'error', error: 'no-device' });
      return false;
    }
    this.stream = stream;
    this.watchTrack(videoTrack, 'camera');
    this.watchTrack(audioTrack, 'microphone');

    const video = this.env.createVideo();
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    this.video = video;
    await video.play().catch(() => undefined);
    this.meter = this.env.createLevelMeter(stream);
    await this.meter.resume().catch(() => undefined);
    this.set({ phase: 'loading', stream, cameraLabel: videoTrack.label });

    try {
      const analyzer = await this.env.loadAnalyzer();
      if (this.isStopped()) {
        analyzer.close();
        return false;
      }
      this.analyzer = analyzer;
    } catch {
      this.release();
      this.set({ phase: 'error', error: 'model-failed', stream: null });
      return false;
    }
    this.startSampling();
    this.set({ phase: 'ready' });
    return true;
  }

  private watchTrack(track: MediaStreamTrack, kind: 'camera' | 'microphone') {
    const lost = () => {
      if (this.stopped) return;
      if (kind === 'camera' ? this.state.cameraLost : this.state.microphoneLost) return;
      this.set(kind === 'camera' ? { cameraLost: true } : { microphoneLost: true });
      if (this.state.phase === 'running') {
        this.emit(kind === 'camera' ? 'camera-lost' : 'microphone-lost');
      }
    };
    track.addEventListener('ended', lost);
    track.addEventListener('mute', () => {
      this.timeouts.push(
        this.env.setTimeout(() => {
          if (track.muted) lost();
        }, MUTE_GRACE_MS),
      );
    });
  }

  private startSampling() {
    this.intervals.push(
      this.env.setInterval(() => {
        this.sampleFrame();
      }, FRAME_INTERVAL_MS),
      this.env.setInterval(() => {
        this.sampleObjects();
      }, OBJECT_INTERVAL_MS),
      this.env.setInterval(() => {
        this.sampleAudio();
      }, AUDIO_INTERVAL_MS),
    );
  }

  private feed(input: ProctorInput) {
    if (this.state.phase !== 'running' || !this.tracker) return;
    const result = stepProctor(this.tracker, input);
    this.tracker = result.state;
    for (const type of result.events) this.emit(type);
  }

  /** One face-model pass. Public so tests can drive it without timers. */
  sampleFrame(): void {
    if (!this.analyzer || !this.video) return;
    const at = this.env.now();
    let signals: FrameSignals | null;
    try {
      signals = this.analyzer.analyzeFrame(this.video, at);
    } catch {
      return; // A failed frame isn't evidence of anything.
    }
    if (!signals) return;
    this.set({ frame: signals });
    if (this.state.phase === 'calibrating') {
      this.calibrationFrames++;
      if (signals.faces === 1 && signals.face) this.calibrationFaces.push(signals.face);
    }
    this.feed({ kind: 'frame', at, signals });
  }

  sampleObjects(): void {
    if (!this.analyzer || !this.video) return;
    const at = this.env.now();
    let signals: ObjectSignals | null;
    try {
      signals = this.analyzer.detectObjects(this.video, at);
    } catch {
      return;
    }
    if (!signals) return;
    this.set({ objects: signals });
    this.feed({ kind: 'objects', at, signals });
  }

  sampleAudio(): void {
    if (!this.meter) return;
    const at = this.env.now();
    const db = this.meter.read();
    this.set({ levelDb: db });
    if (this.state.phase === 'calibrating') this.calibrationNoise.push(db);
    this.feed({ kind: 'audio', at, db });
  }

  /**
   * Measures the candidate's neutral pose and the room's noise while they look at the
   * screen. Fails if a single face wasn't visible for most of the time.
   */
  async calibrate(ms = CALIBRATION_MS): Promise<boolean> {
    if (this.state.phase !== 'ready' && this.state.phase !== 'calibrated') return false;
    this.calibrationFaces = [];
    this.calibrationNoise = [];
    this.calibrationFrames = 0;
    this.set({ phase: 'calibrating', error: null });
    const wait = (delay: number) =>
      new Promise<void>((resolve) => {
        this.timeouts.push(this.env.setTimeout(resolve, delay));
      });
    const startedAt = this.env.now();
    await wait(ms);
    while (
      this.getState().phase === 'calibrating' &&
      this.calibrationFrames < MIN_CALIBRATION_FRAMES &&
      this.env.now() - startedAt < ms * 3
    ) {
      await wait(FRAME_INTERVAL_MS);
    }
    // Stopped while calibrating.
    if (this.getState().phase !== 'calibrating') return false;
    const enough =
      this.calibrationFaces.length >= 3 &&
      this.calibrationFaces.length >= this.calibrationFrames * CALIBRATION_FACE_SHARE;
    if (!enough) {
      this.set({ phase: 'ready', error: 'calibration-failed' });
      return false;
    }
    this.set({
      phase: 'calibrated',
      calibration: calibrate(this.calibrationFaces, this.calibrationNoise),
    });
    return true;
  }

  /** Starts applying the rules for an exam. Reports `proctor-started` first. */
  begin(examId: string, listener: ProctorListener): void {
    this.listener = listener;
    if (this.state.phase !== 'calibrated') return;
    this.examId = examId;
    this.tracker = createProctorTracker(this.state.calibration ?? undefined);
    this.set({ phase: 'running' });
    this.emit('proctor-started');
    // A device lost between check-in and the start still counts.
    if (this.state.cameraLost) this.emit('camera-lost');
    if (this.state.microphoneLost) this.emit('microphone-lost');
  }

  /** Re-attaches the listener (for example after the exam layout re-mounts). */
  setListener(listener: ProctorListener | null): void {
    this.listener = listener;
  }

  private release() {
    for (const id of this.intervals.splice(0)) this.env.clearInterval(id);
    for (const id of this.timeouts.splice(0)) this.env.clearTimeout(id);
    this.analyzer?.close();
    this.analyzer = null;
    this.meter?.close();
    this.meter = null;
    if (this.stream) for (const track of this.stream.getTracks()) track.stop();
    this.stream = null;
    if (this.video) this.video.srcObject = null;
    this.video = null;
  }

  /** Stops everything: camera and microphone tracks, timers and models. Safe to repeat. */
  stop(): void {
    if (this.stopped) return;
    this.stopped = true;
    this.listener = null;
    this.release();
    this.set({ phase: 'stopped', stream: null });
  }
}

// ── The one engine shared by check-in and the exam ──────────────────────────────────────

let current: ProctorEngine | null = null;
let pendingStop: number | null = null;

function cancelPendingStop() {
  if (pendingStop !== null) window.clearTimeout(pendingStop);
  pendingStop = null;
}

export function currentProctor(): ProctorEngine | null {
  return current;
}

/** Makes `engine` the shared engine, stopping any other. */
export function adoptProctor(engine: ProctorEngine): void {
  cancelPendingStop();
  if (current && current !== engine) current.stop();
  current = engine;
}

/**
 * Stops the engine after the current render pass, unless it's adopted or kept again first.
 * (React runs effect cleanups and re-runs them in development; this avoids losing the camera.)
 */
export function releaseProctor(engine: ProctorEngine): void {
  if (current !== engine) {
    engine.stop();
    return;
  }
  cancelPendingStop();
  pendingStop = window.setTimeout(() => {
    pendingStop = null;
    if (current === engine) {
      engine.stop();
      current = null;
    }
  }, 0);
}

/** Cancels a pending release of `engine`. */
export function keepProctor(engine: ProctorEngine): void {
  if (current === engine) cancelPendingStop();
}
