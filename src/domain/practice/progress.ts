import { DOMAINS, type DomainId } from '@/domain/exam-guide/clf-c02';
import type { Question } from '@/domain/questions/types';
import { nextReviewLevel } from './review';

/**
 * Practice progress for one question.
 *
 * Statistics come in two kinds (docs/DECISIONS.md D-019):
 * - Attempt counts (`attempts`, `correct`) count every checked answer, including retries.
 * - Question-level state (`lastResult`) describes the learner's latest answer to that question.
 * Dashboard accuracy uses question-level state, so retrying a question many times
 * never inflates or deflates it.
 */
export interface QuestionProgress {
  readonly attempts: number;
  readonly correct: number;
  readonly lastResult: 'correct' | 'incorrect';
  readonly firstAnsweredAt: number;
  readonly lastAnsweredAt: number;
  /** When it was last answered incorrectly; `null` if never. Drives the mistakes list. */
  readonly lastIncorrectAt: number | null;
  /** Session that recorded the latest attempt. Makes recording idempotent per session. */
  readonly lastSessionId: string;
  /** Review schedule level, 0 to MAX_REVIEW_LEVEL (D-052). 0 whenever the latest answer is wrong. */
  readonly reviewLevel: number;
}

export type ProgressMap = Readonly<Record<string, QuestionProgress>>;

export interface AnswerRecord {
  questionId: string;
  isCorrect: boolean;
  at: number;
  sessionId: string;
}

/**
 * Adds one checked answer. A question is counted at most once per session: recording the
 * same question again with the same `sessionId` returns the map unchanged.
 */
export function recordAnswer(progress: ProgressMap, record: AnswerRecord): ProgressMap {
  const existing = progress[record.questionId];
  if (existing?.lastSessionId === record.sessionId) return progress;
  const reviewLevel = nextReviewLevel(existing, record.isCorrect, record.at);
  const next: QuestionProgress = existing
    ? {
        attempts: existing.attempts + 1,
        correct: existing.correct + (record.isCorrect ? 1 : 0),
        lastResult: record.isCorrect ? 'correct' : 'incorrect',
        firstAnsweredAt: existing.firstAnsweredAt,
        lastAnsweredAt: record.at,
        lastIncorrectAt: record.isCorrect ? existing.lastIncorrectAt : record.at,
        lastSessionId: record.sessionId,
        reviewLevel,
      }
    : {
        attempts: 1,
        correct: record.isCorrect ? 1 : 0,
        lastResult: record.isCorrect ? 'correct' : 'incorrect',
        firstAnsweredAt: record.at,
        lastAnsweredAt: record.at,
        lastIncorrectAt: record.isCorrect ? null : record.at,
        lastSessionId: record.sessionId,
        reviewLevel,
      };
  return { ...progress, [record.questionId]: next };
}

/**
 * Questions whose latest answer was incorrect, most recent mistake first.
 * Only ids in `availableIds` are returned, so removed questions never appear.
 */
export function mistakeIds(progress: ProgressMap, availableIds: ReadonlySet<string>): string[] {
  return Object.entries(progress)
    .filter(([id, entry]) => entry.lastResult === 'incorrect' && availableIds.has(id))
    .sort(([, a], [, b]) => (b.lastIncorrectAt ?? 0) - (a.lastIncorrectAt ?? 0))
    .map(([id]) => id);
}

export interface PracticeStats {
  /** Unique questions answered at least once. */
  answeredQuestions: number;
  /** Unique questions whose latest answer is correct. */
  correctQuestions: number;
  /** All checked answers, including retries. */
  attempts: number;
  correctAttempts: number;
  /** correctQuestions / answeredQuestions, or `null` before any answer. */
  accuracy: number | null;
  /** Practiceable questions in this scope. */
  availableQuestions: number;
}

function emptyStats(): PracticeStats {
  return {
    answeredQuestions: 0,
    correctQuestions: 0,
    attempts: 0,
    correctAttempts: 0,
    accuracy: null,
    availableQuestions: 0,
  };
}

function addTo(stats: PracticeStats, entry: QuestionProgress | undefined): void {
  stats.availableQuestions++;
  if (!entry) return;
  stats.answeredQuestions++;
  stats.attempts += entry.attempts;
  stats.correctAttempts += entry.correct;
  if (entry.lastResult === 'correct') stats.correctQuestions++;
}

function finalize(stats: PracticeStats): PracticeStats {
  return {
    ...stats,
    accuracy:
      stats.answeredQuestions === 0 ? null : stats.correctQuestions / stats.answeredQuestions,
  };
}

/** Overall and per-domain stats for the given (practiceable) questions. */
export function practiceStats(
  progress: ProgressMap,
  questions: readonly Question[],
): { overall: PracticeStats; byDomain: Record<DomainId, PracticeStats> } {
  const overall = emptyStats();
  const byDomain = Object.fromEntries(DOMAINS.map((domain) => [domain.id, emptyStats()])) as Record<
    DomainId,
    PracticeStats
  >;
  for (const question of questions) {
    const entry = progress[question.id];
    addTo(overall, entry);
    addTo(byDomain[question.domain], entry);
  }
  return {
    overall: finalize(overall),
    byDomain: Object.fromEntries(
      DOMAINS.map((domain) => [domain.id, finalize(byDomain[domain.id])]),
    ) as Record<DomainId, PracticeStats>,
  };
}

/** Answers a domain needs before it can be called the weakest (D-057). */
export const WEAKEST_MIN_ANSWERED = 20;

/**
 * The practice domain with the lowest accuracy, or `null` until at least two domains have
 * WEAKEST_MIN_ANSWERED answers each, so a few early answers never label a domain. Ties go
 * to the domain listed first.
 */
export function weakestDomain(byDomain: Record<DomainId, PracticeStats>): DomainId | null {
  const eligible = DOMAINS.filter(
    (domain) => byDomain[domain.id].answeredQuestions >= WEAKEST_MIN_ANSWERED,
  );
  if (eligible.length < 2) return null;
  let weakest: DomainId | null = null;
  let lowest = Infinity;
  for (const domain of eligible) {
    const accuracy = byDomain[domain.id].accuracy ?? 0;
    if (accuracy < lowest) {
      lowest = accuracy;
      weakest = domain.id;
    }
  }
  return weakest;
}
