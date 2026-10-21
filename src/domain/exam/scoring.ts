import { DOMAINS, type DomainId } from '@/domain/exam-guide/clf-c02';

/**
 * Deterministic exam scoring. No partial credit (docs/DECISIONS.md D-012):
 * - single answer: correct only if the one selected option is the correct option;
 * - multiple response: correct only if the selected set equals the correct set exactly;
 * - no selection: unanswered, which scores as incorrect.
 */
export type QuestionOutcome = 'correct' | 'incorrect' | 'unanswered';

export function scoreQuestion(
  correctOptionIds: readonly string[],
  selectedOptionIds: readonly string[],
): QuestionOutcome {
  const selected = new Set(selectedOptionIds);
  if (selected.size === 0) return 'unanswered';
  const correct = new Set(correctOptionIds);
  const exact = selected.size === correct.size && [...correct].every((id) => selected.has(id));
  return exact ? 'correct' : 'incorrect';
}

/** Below this many questions, a domain result is flagged as a small sample. */
export const SMALL_SAMPLE_SIZE = 5;

export interface DomainResult {
  /** Questions from this domain in the exam. */
  total: number;
  /** Questions the learner answered (any selection). */
  attempted: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  /** correct / total: how the domain contributed to the exam score. Null if no questions. */
  score: number | null;
  /** correct / attempted: how often answered questions were right. Null if none attempted. */
  accuracy: number | null;
  /** True when `total` is too small to draw conclusions (e.g. 2 of 2 is not mastery). */
  smallSample: boolean;
}

export interface ScoreSummary {
  total: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  attempted: number;
  /** correct / total, 0–1. */
  ratio: number;
  /** Percentage correct, rounded to one decimal place. */
  percent: number;
  byDomain: Record<DomainId, DomainResult>;
}

function emptyDomain(): DomainResult {
  return {
    total: 0,
    attempted: 0,
    correct: 0,
    incorrect: 0,
    unanswered: 0,
    score: null,
    accuracy: null,
    smallSample: true,
  };
}

export function summarizeOutcomes(
  records: readonly { domain: DomainId; outcome: QuestionOutcome }[],
): ScoreSummary {
  const byDomain = Object.fromEntries(DOMAINS.map((d) => [d.id, emptyDomain()])) as Record<
    DomainId,
    DomainResult
  >;
  const totals = { correct: 0, incorrect: 0, unanswered: 0 };
  for (const { domain, outcome } of records) {
    const result = byDomain[domain];
    result.total++;
    result[outcome]++;
    totals[outcome]++;
  }
  for (const result of Object.values(byDomain)) {
    result.attempted = result.correct + result.incorrect;
    result.score = result.total === 0 ? null : result.correct / result.total;
    result.accuracy = result.attempted === 0 ? null : result.correct / result.attempted;
    result.smallSample = result.total < SMALL_SAMPLE_SIZE;
  }
  const total = records.length;
  const ratio = total === 0 ? 0 : totals.correct / total;
  return {
    total,
    ...totals,
    attempted: totals.correct + totals.incorrect,
    ratio,
    percent: Math.round(ratio * 1000) / 10,
    byDomain,
  };
}

/**
 * Whether a score meets an unofficial practice benchmark (percent, 0–100).
 * Integer comparison avoids floating-point surprises at exactly the benchmark.
 */
export function meetsBenchmark(
  summary: Pick<ScoreSummary, 'correct' | 'total'>,
  benchmarkPercent: number,
): boolean {
  return summary.total > 0 && summary.correct * 100 >= benchmarkPercent * summary.total;
}

export const BENCHMARK_MIN = 50;
export const BENCHMARK_MAX = 90;
export const BENCHMARK_STEP = 5;

export function isValidBenchmark(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= BENCHMARK_MIN &&
    value <= BENCHMARK_MAX &&
    value % BENCHMARK_STEP === 0
  );
}
