import type { FaceReading, ObjectSignals } from '@/domain/exam/proctor';

/** The parts of MediaPipe results this app reads (kept structural so tests can build them). */
export interface BlendshapeCategory {
  categoryName: string;
  score: number;
}
export interface TransformMatrix {
  data: readonly number[];
}
export interface Detection {
  categories: readonly BlendshapeCategory[];
}

const DEG = 180 / Math.PI;

/**
 * Head yaw and pitch in degrees from the face model's 4×4 transformation matrix
 * (column-major). Only differences from the calibrated pose are used, so the sign
 * convention doesn't matter.
 */
export function headAngles(matrix: TransformMatrix): { yaw: number; pitch: number } {
  const d = matrix.data;
  const r20 = d[2] ?? 0;
  const r21 = d[6] ?? 0;
  const r22 = d[10] ?? 1;
  return {
    yaw: Math.atan2(-r20, Math.hypot(r21, r22)) * DEG,
    pitch: Math.atan2(r21, r22) * DEG,
  };
}

/** Face reading from the face model's blendshapes and matrix. */
export function faceReading(
  blendshapes: readonly BlendshapeCategory[],
  matrix: TransformMatrix | undefined,
): FaceReading {
  const score = (name: string) => blendshapes.find((c) => c.categoryName === name)?.score ?? 0;
  // Looking to one side moves one eye "out" and the other "in".
  const towardLeft = (score('eyeLookOutLeft') + score('eyeLookInRight')) / 2;
  const towardRight = (score('eyeLookInLeft') + score('eyeLookOutRight')) / 2;
  const angles = matrix ? headAngles(matrix) : { yaw: 0, pitch: 0 };
  return {
    ...angles,
    gazeSide: Math.max(towardLeft, towardRight),
    gazeUp: (score('eyeLookUpLeft') + score('eyeLookUpRight')) / 2,
    gazeDown: (score('eyeLookDownLeft') + score('eyeLookDownRight')) / 2,
    blink: (score('eyeBlinkLeft') + score('eyeBlinkRight')) / 2,
    jawOpen: score('jawOpen'),
  };
}

/** COCO labels the object model is asked about. */
export const OBJECT_LABELS = ['cell phone', 'remote', 'person', 'book', 'laptop', 'tv'] as const;
/** The model often calls a phone in a hand a remote; on an exam desk both count as a phone. */
const PHONE_LABELS: ReadonlySet<string> = new Set(['cell phone', 'remote']);
/** Phones are small and the most serious, so they count at a lower confidence (D-075). */
export const PHONE_MIN_SCORE = 0.25;
export const OTHER_MIN_SCORE = 0.5;
/** A body counts as in view at this confidence (a hidden face lowers the person score). */
export const BODY_MIN_SCORE = 0.3;
/** The object model's own cut-off: the lowest of the scores above. */
export const DETECTOR_MIN_SCORE = Math.min(PHONE_MIN_SCORE, BODY_MIN_SCORE);

export function objectSignals(detections: readonly Detection[]): ObjectSignals {
  let phone = false;
  let persons = 0;
  let items = 0;
  let bodyVisible = false;
  for (const detection of detections) {
    const best = detection.categories[0];
    if (!best) continue;
    if (PHONE_LABELS.has(best.categoryName)) {
      if (best.score >= PHONE_MIN_SCORE) phone = true;
      continue;
    }
    if (best.categoryName === 'person' && best.score >= BODY_MIN_SCORE) bodyVisible = true;
    if (best.score < OTHER_MIN_SCORE) continue;
    if (best.categoryName === 'person') persons++;
    else items++;
  }
  return { phone, persons, items, bodyVisible };
}

/**
 * Combines the full frame with a zoomed-out copy of it. A phone held close to the camera
 * is often only recognised once it looks smaller. People and items are counted from the
 * full frame only, so nobody is counted twice.
 */
export function mergeObjectSignals(full: ObjectSignals, zoomedOut: ObjectSignals): ObjectSignals {
  return {
    ...full,
    phone: full.phone || zoomedOut.phone,
    bodyVisible: full.bodyVisible || zoomedOut.bodyVisible,
  };
}

/** Mean brightness (0–255) of RGBA pixel data. */
export function meanBrightness(pixels: ArrayLike<number>): number {
  let sum = 0;
  let count = 0;
  for (let i = 0; i + 2 < pixels.length; i += 4) {
    sum += ((pixels[i] ?? 0) + (pixels[i + 1] ?? 0) + (pixels[i + 2] ?? 0)) / 3;
    count++;
  }
  return count === 0 ? 0 : sum / count;
}

/** Root-mean-square level of audio samples (−1 to 1) in dBFS, floored at −100. */
export function levelDb(samples: ArrayLike<number>): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    const value = samples[i] ?? 0;
    sum += value * value;
  }
  const rms = samples.length === 0 ? 0 : Math.sqrt(sum / samples.length);
  return rms > 0 ? Math.max(-100, 20 * Math.log10(rms)) : -100;
}
