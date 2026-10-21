import { EXAM_DURATION_MINUTES, EXAM_QUESTION_COUNT } from '@/domain/exam-guide/clf-c02';
import type { ReviewStatus } from '@/domain/questions/types';

export type ExamKind = 'full' | 'short';

export interface ExamConfig {
  kind: ExamKind;
  questionCount: number;
  durationMs: number;
}

const MINUTE = 60_000;

/** The default practice exam: same length and time as the real CLF-C02 exam. */
export const FULL_EXAM: ExamConfig = {
  kind: 'full',
  questionCount: EXAM_QUESTION_COUNT,
  durationMs: EXAM_DURATION_MINUTES * MINUTE,
};

/** A shorter timed exam is only offered if at least this many balanced questions exist. */
export const MIN_SHORT_EXAM_QUESTIONS = 10;

/**
 * A shorter exam keeps the real exam's pace (90 minutes for 65 questions), rounded up
 * to a whole minute: e.g. 41 questions → ceil(41 × 90 / 65) = 57 minutes.
 */
export function shortExamConfig(questionCount: number): ExamConfig {
  const minutes = Math.ceil((questionCount * EXAM_DURATION_MINUTES) / EXAM_QUESTION_COUNT);
  return { kind: 'short', questionCount, durationMs: minutes * MINUTE };
}

/**
 * Review statuses allowed in exams. Interim (docs/DECISIONS.md D-016): `checked` questions
 * are allowed until questions are human-approved; tighten to ['approved'] once they are.
 */
export const EXAM_ELIGIBLE_STATUSES: readonly ReviewStatus[] = ['checked', 'approved'];

/** Practice score needed to count as a pass (unofficial; see PRODUCT_SPEC §6). */
export const DEFAULT_BENCHMARK_PERCENT = 70;

/** Low-time warnings, in milliseconds remaining. */
export const WARNING_THRESHOLDS_MS = { low: 10 * MINUTE, critical: 5 * MINUTE } as const;
