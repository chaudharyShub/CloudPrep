/**
 * Strict AI proctor rules (docs/DECISIONS.md D-043). Pure logic, no browser APIs:
 *
 * - `stepProctor` turns raw readings from the camera models and microphone into violation
 *   events. A condition has to last a short time before it counts, and has to clear before
 *   it can count again, so one long look away is one violation, not dozens.
 * - `proctorStatus` reads the exam's event log and decides warnings and whether the exam
 *   ends. It is derived from the saved log, so a reload can't reset it.
 *
 * Detection is approximate. The rules are deliberately stricter than a human proctor.
 */
import type { IntegrityEvent, IntegrityEventType, IntegrityLog } from './integrity';

// ── Verdict rules ───────────────────────────────────────────────────────────────────────

/** The third strike ends the exam: two warnings, then it's over. */
export const MAX_STRIKES = 3;
/** Violations this close to the previous strike count as the same incident. */
export const STRIKE_MERGE_MS = 3000;

/** End the exam immediately. */
export const ZERO_TOLERANCE_EVENTS: ReadonlySet<IntegrityEventType> = new Set<IntegrityEventType>([
  'phone-detected',
  'person-detected',
  'multiple-faces',
  'camera-lost',
  'microphone-lost',
  'extra-display',
]);

/** Each incident is a strike (a warning until the limit is reached). */
export const STRIKE_EVENTS: ReadonlySet<IntegrityEventType> = new Set<IntegrityEventType>([
  'face-not-detected',
  'camera-covered',
  'looking-away',
  'eyes-off-screen',
  'eyes-closed',
  'mouth-moving',
  'voice-detected',
  'item-detected',
  'tab-hidden',
  'window-blur',
  'fullscreen-exited',
  'pointer-left',
  'blocked-shortcut',
  'proctor-resumed',
]);

/** What the proctor did about each logged event. */
export type ProctorRole = 'info' | 'warning' | 'final-warning' | 'merged' | 'ended';

export interface ProctorStatus {
  strikeCount: number;
  /** The event that ended the exam, if any. */
  endedBy: IntegrityEvent | null;
  /** Parallel to the log's events. */
  roles: readonly ProctorRole[];
}

export function proctorStatus(log: IntegrityLog): ProctorStatus {
  const roles: ProctorRole[] = [];
  let strikeCount = 0;
  let lastStrikeAt: number | null = null;
  let endedBy: IntegrityEvent | null = null;
  for (const event of log.events) {
    if (log.mode !== 'proctored' || endedBy) {
      roles.push('info');
      continue;
    }
    if (ZERO_TOLERANCE_EVENTS.has(event.type)) {
      endedBy = event;
      roles.push('ended');
    } else if (STRIKE_EVENTS.has(event.type)) {
      if (lastStrikeAt !== null && event.at - lastStrikeAt < STRIKE_MERGE_MS) {
        roles.push('merged');
        continue;
      }
      strikeCount++;
      lastStrikeAt = event.at;
      if (strikeCount >= MAX_STRIKES) {
        endedBy = event;
        roles.push('ended');
      } else {
        roles.push(strikeCount === MAX_STRIKES - 1 ? 'final-warning' : 'warning');
      }
    } else {
      roles.push('info');
    }
  }
  return { strikeCount, endedBy, roles };
}

// ── Readings ────────────────────────────────────────────────────────────────────────────

/** One face, as measured by the face model. Angles in degrees; the rest from 0 to 1. */
export interface FaceReading {
  yaw: number;
  pitch: number;
  /** How far the eyes look sideways (either direction). */
  gazeSide: number;
  gazeUp: number;
  gazeDown: number;
  /** Eyelid closure, averaged over both eyes. */
  blink: number;
  jawOpen: number;
}

export interface FrameSignals {
  faces: number;
  /** The main face, when at least one was found. */
  face: FaceReading | null;
  /** Mean brightness of the frame, 0 to 255. */
  brightness: number;
}

export interface ObjectSignals {
  phone: boolean;
  /** People found by the object model, including the candidate. */
  persons: number;
  /** Books, laptops and screens found. */
  items: number;
}

export type ProctorInput =
  | { kind: 'frame'; at: number; signals: FrameSignals }
  | { kind: 'objects'; at: number; signals: ObjectSignals }
  | { kind: 'audio'; at: number; db: number };

/** The candidate's neutral pose and the room's noise level, measured at check-in. */
export interface ProctorCalibration {
  yaw: number;
  pitch: number;
  gazeSide: number;
  gazeUp: number;
  gazeDown: number;
  blink: number;
  jawOpen: number;
  noiseDb: number;
}

export const DEFAULT_CALIBRATION: ProctorCalibration = {
  yaw: 0,
  pitch: 0,
  gazeSide: 0,
  gazeUp: 0,
  gazeDown: 0,
  blink: 0,
  jawOpen: 0,
  noiseDb: -60,
};

export const PROCTOR_THRESHOLDS = {
  /** Head turned more than this from the calibrated pose. */
  headYawDeg: 25,
  headPitchDeg: 20,
  /** Eye movement beyond the calibrated level. Looking down gets more room (keyboard, notes). */
  gazeSide: 0.35,
  gazeUp: 0.35,
  gazeDown: 0.4,
  /** Eyelids at least this closed (and clearly more than at check-in). */
  blink: 0.55,
  blinkAboveCalibration: 0.3,
  /** Mouth counts as open this far above the calibrated level. */
  jawOpen: 0.08,
  mouthWindowMs: 2500,
  mouthOpenShare: 0.4,
  mouthMinSamples: 4,
  /** Sound this far above the check-in noise level, and never below the floor. */
  voiceAboveNoiseDb: 12,
  voiceFloorDb: -50,
  voiceWindowMs: 1500,
  voiceLoudShare: 0.6,
  voiceMinSamples: 5,
  /** Frames darker than this are treated as a covered camera. */
  darkBrightness: 25,
  /** Objects must appear in this many of the last few object checks. */
  objectChecks: 3,
  objectHits: 2,
} as const;

/** How long a condition must last before it counts. */
export const SUSTAIN_MS = {
  'face-not-detected': 2000,
  'multiple-faces': 1000,
  'camera-covered': 1500,
  'looking-away': 2000,
  'eyes-off-screen': 2000,
  'eyes-closed': 3000,
  'mouth-moving': 0,
  'voice-detected': 0,
  'phone-detected': 0,
  'person-detected': 0,
  'item-detected': 0,
} as const;
export type TrackedCondition = keyof typeof SUSTAIN_MS;
const CONDITIONS = Object.keys(SUSTAIN_MS) as TrackedCondition[];

/** A condition must be clear this long before it can count again. */
export const CLEAR_MS = 1500;

// ── Tracker ─────────────────────────────────────────────────────────────────────────────

interface ConditionState {
  since: number | null;
  fired: boolean;
  clearSince: number | null;
}

interface Sample {
  at: number;
  hit: boolean;
}

export interface ProctorTrackerState {
  calibration: ProctorCalibration;
  conditions: Readonly<Record<TrackedCondition, ConditionState>>;
  mouth: readonly Sample[];
  voice: readonly Sample[];
  phone: readonly boolean[];
  person: readonly boolean[];
  item: readonly boolean[];
}

export function createProctorTracker(
  calibration: ProctorCalibration = DEFAULT_CALIBRATION,
): ProctorTrackerState {
  const conditions = {} as Record<TrackedCondition, ConditionState>;
  for (const condition of CONDITIONS) {
    conditions[condition] = { since: null, fired: false, clearSince: null };
  }
  return { calibration, conditions, mouth: [], voice: [], phone: [], person: [], item: [] };
}

function updateCondition(
  state: ConditionState,
  raw: boolean,
  at: number,
  sustainMs: number,
): { state: ConditionState; fire: boolean } {
  if (raw) {
    const since = state.since ?? at;
    const fire = !state.fired && at - since >= sustainMs;
    return { state: { since, fired: state.fired || fire, clearSince: null }, fire };
  }
  if (!state.fired) return { state: { since: null, fired: false, clearSince: null }, fire: false };
  const clearSince = state.clearSince ?? at;
  if (at - clearSince >= CLEAR_MS) {
    return { state: { since: null, fired: false, clearSince: null }, fire: false };
  }
  return { state: { since: null, fired: true, clearSince }, fire: false };
}

function windowed(samples: readonly Sample[], sample: Sample, windowMs: number): Sample[] {
  return [...samples, sample].filter((s) => sample.at - s.at <= windowMs);
}

function share(samples: readonly Sample[]): number {
  return samples.length === 0 ? 0 : samples.filter((s) => s.hit).length / samples.length;
}

function lastChecks(history: readonly boolean[], hit: boolean): boolean[] {
  return [...history, hit].slice(-PROCTOR_THRESHOLDS.objectChecks);
}

/** Whether the face reading breaks a rule, relative to the calibrated pose. */
export function faceConditions(
  face: FaceReading,
  calibration: ProctorCalibration,
): { lookingAway: boolean; eyesOff: boolean; eyesClosed: boolean } {
  const t = PROCTOR_THRESHOLDS;
  const lookingAway =
    Math.abs(face.yaw - calibration.yaw) > t.headYawDeg ||
    Math.abs(face.pitch - calibration.pitch) > t.headPitchDeg;
  const eyesClosed =
    face.blink >= t.blink && face.blink - calibration.blink >= t.blinkAboveCalibration;
  const eyesOff =
    !lookingAway &&
    !eyesClosed &&
    (face.gazeSide - calibration.gazeSide > t.gazeSide ||
      face.gazeUp - calibration.gazeUp > t.gazeUp ||
      face.gazeDown - calibration.gazeDown > t.gazeDown);
  return { lookingAway, eyesOff, eyesClosed };
}

/**
 * Feeds one reading into the tracker. Returns the new state and the violations that started
 * with this reading (at most one per condition).
 */
export function stepProctor(
  state: ProctorTrackerState,
  input: ProctorInput,
): { state: ProctorTrackerState; events: TrackedCondition[] } {
  const t = PROCTOR_THRESHOLDS;
  const raw: Partial<Record<TrackedCondition, boolean>> = {};
  let next: ProctorTrackerState = state;

  if (input.kind === 'frame') {
    const { faces, face, brightness } = input.signals;
    const covered = brightness < t.darkBrightness;
    raw['camera-covered'] = covered;
    raw['face-not-detected'] = !covered && faces === 0;
    raw['multiple-faces'] = faces >= 2;
    const checks = face && faces >= 1 ? faceConditions(face, state.calibration) : null;
    raw['looking-away'] = checks?.lookingAway ?? false;
    raw['eyes-off-screen'] = checks?.eyesOff ?? false;
    raw['eyes-closed'] = checks?.eyesClosed ?? false;
    const mouthOpen = face ? face.jawOpen - state.calibration.jawOpen > t.jawOpen : false;
    const mouth = face
      ? windowed(state.mouth, { at: input.at, hit: mouthOpen }, t.mouthWindowMs)
      : [];
    next = { ...next, mouth };
    raw['mouth-moving'] = mouth.length >= t.mouthMinSamples && share(mouth) >= t.mouthOpenShare;
  } else if (input.kind === 'objects') {
    const phone = lastChecks(state.phone, input.signals.phone);
    const person = lastChecks(state.person, input.signals.persons >= 2);
    const item = lastChecks(state.item, input.signals.items > 0);
    next = { ...next, phone, person, item };
    const hits = (history: boolean[]) => history.filter(Boolean).length >= t.objectHits;
    raw['phone-detected'] = hits(phone);
    raw['person-detected'] = hits(person);
    raw['item-detected'] = hits(item);
  } else {
    const threshold = Math.max(state.calibration.noiseDb + t.voiceAboveNoiseDb, t.voiceFloorDb);
    const voice = windowed(
      state.voice,
      { at: input.at, hit: input.db > threshold },
      t.voiceWindowMs,
    );
    next = { ...next, voice };
    raw['voice-detected'] = voice.length >= t.voiceMinSamples && share(voice) >= t.voiceLoudShare;
  }

  const conditions = { ...state.conditions };
  const events: TrackedCondition[] = [];
  for (const condition of CONDITIONS) {
    const value = raw[condition];
    if (value === undefined) continue;
    const result = updateCondition(conditions[condition], value, input.at, SUSTAIN_MS[condition]);
    conditions[condition] = result.state;
    if (result.fire) events.push(condition);
  }
  return { state: { ...next, conditions }, events };
}

// ── Check-in ────────────────────────────────────────────────────────────────────────────

function median(values: readonly number[], fallback: number): number {
  if (values.length === 0) return fallback;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? (sorted[mid] ?? fallback)
    : ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
}

/** Neutral pose and noise level from readings taken while the candidate looks at the screen. */
export function calibrate(
  faces: readonly FaceReading[],
  noiseDb: readonly number[],
): ProctorCalibration {
  const d = DEFAULT_CALIBRATION;
  return {
    yaw: median(
      faces.map((f) => f.yaw),
      d.yaw,
    ),
    pitch: median(
      faces.map((f) => f.pitch),
      d.pitch,
    ),
    gazeSide: median(
      faces.map((f) => f.gazeSide),
      d.gazeSide,
    ),
    gazeUp: median(
      faces.map((f) => f.gazeUp),
      d.gazeUp,
    ),
    gazeDown: median(
      faces.map((f) => f.gazeDown),
      d.gazeDown,
    ),
    blink: median(
      faces.map((f) => f.blink),
      d.blink,
    ),
    jawOpen: median(
      faces.map((f) => f.jawOpen),
      d.jawOpen,
    ),
    // A typical (median) level, so one cough during check-in doesn't raise the threshold.
    noiseDb: median(noiseDb, d.noiseDb),
  };
}

export type CheckInIssue =
  'dark' | 'no-face' | 'multiple-faces' | 'phone' | 'person' | 'item' | 'noisy' | 'eyes-closed';

/** Above this, the room is too loud to take a proctored exam. */
export const MAX_ROOM_NOISE_DB = -35;

/** What stops check-in right now, from the latest readings. Empty means ready. */
export function checkInIssues(input: {
  frame: FrameSignals | null;
  objects: ObjectSignals | null;
  noiseDb: number | null;
}): CheckInIssue[] {
  const issues: CheckInIssue[] = [];
  const { frame, objects, noiseDb } = input;
  if (!frame || frame.brightness < PROCTOR_THRESHOLDS.darkBrightness) issues.push('dark');
  else if (frame.faces === 0) issues.push('no-face');
  else if (frame.faces > 1) issues.push('multiple-faces');
  else if (frame.face && frame.face.blink >= PROCTOR_THRESHOLDS.blink) issues.push('eyes-closed');
  if (objects?.phone) issues.push('phone');
  if (objects && objects.persons >= 2) issues.push('person');
  if (objects && objects.items > 0) issues.push('item');
  if (noiseDb !== null && noiseDb > MAX_ROOM_NOISE_DB) issues.push('noisy');
  return issues;
}
