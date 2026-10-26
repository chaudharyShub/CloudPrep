import type { ExamAttempt } from '@/domain/exam/attempt';
import type { ExamSession } from '@/domain/exam/session';
import type { QuestionProgress } from '@/domain/practice/progress';
import { legacyReviewLevel } from '@/domain/practice/review';
import type { PracticeSessionSummary } from '@/domain/practice/session';
import type { PreferenceOverrides } from '@/storage/preferencesArea';

/**
 * Row shapes of the user tables (supabase/migrations) and conversions to and from the app's
 * shapes (D-047). Rows read back are turned into plain objects only; the storage parsers
 * validate them, exactly like data read from browser storage.
 */

export type ProgressRow = {
  user_id: string;
  exam_id: string;
  question_id: string;
  attempts: number;
  correct: number;
  last_result: 'correct' | 'incorrect';
  first_answered_at: string;
  last_answered_at: string;
  last_incorrect_at: string | null;
  last_session_id: string;
  /** `null` in rows saved before review levels (D-052). */
  review_level: number | null;
};

export type BookmarkRow = {
  user_id: string;
  exam_id: string;
  question_id: string;
  added_at: string;
};

export type PracticeSessionRow = {
  user_id: string;
  id: string;
  exam_id: string;
  label: string;
  started_at: string;
  finished_at: string;
  total: number;
  answered: number;
  correct: number;
  by_domain: Record<string, unknown>;
  incorrect_question_ids: string[];
};

export type AttemptRow = {
  user_id: string;
  id: string;
  exam_id: string;
  kind: string;
  bank_version: string;
  started_at: string;
  ends_at: string;
  duration_ms: number;
  submitted_at: string;
  submit_reason: string;
  time_used_ms: number;
  benchmark_percent: number;
  benchmark_met: boolean;
  summary: Record<string, unknown>;
  unavailable_question_ids: string[];
  integrity: Record<string, unknown>;
};

export type AttemptQuestionRow = {
  user_id: string;
  attempt_id: string;
  position: number;
  question_id: string;
  revision: number;
  domain_id: string;
  topic_id: string;
  selected_option_ids: string[];
  option_order: string[];
  flagged: boolean;
  outcome: string;
};

export type ActiveExamRow = {
  user_id: string;
  exam_id: string;
  session: Record<string, unknown>;
};

export type PreferencesRow = {
  user_id: string;
  preferences: Record<string, unknown>;
};

const iso = (ms: number): string => new Date(ms).toISOString();
/** Unreadable dates become NaN, which the storage parsers reject. */
const ms = (value: unknown): number => (typeof value === 'string' ? Date.parse(value) : NaN);

/** JSON-safe copy for jsonb columns. */
const json = (value: object): Record<string, unknown> =>
  JSON.parse(JSON.stringify(value)) as Record<string, unknown>;

export function progressToRow(
  userId: string,
  examId: string,
  questionId: string,
  entry: QuestionProgress,
): ProgressRow {
  return {
    user_id: userId,
    exam_id: examId,
    question_id: questionId,
    attempts: entry.attempts,
    correct: entry.correct,
    last_result: entry.lastResult,
    first_answered_at: iso(entry.firstAnsweredAt),
    last_answered_at: iso(entry.lastAnsweredAt),
    last_incorrect_at: entry.lastIncorrectAt === null ? null : iso(entry.lastIncorrectAt),
    last_session_id: entry.lastSessionId,
    review_level: entry.reviewLevel,
  };
}

/**
 * The stored review level, or an estimate for rows without one. A wrong latest answer is
 * always level 0, even if an older app version left a stale level behind.
 */
function rowReviewLevel(row: Partial<ProgressRow>): unknown {
  if (row.last_result === 'incorrect') return 0;
  // Any stored value is passed on as is; the parser rejects an invalid one.
  if (row.review_level !== null && row.review_level !== undefined) return row.review_level;
  if (row.last_result !== 'correct' || typeof row.correct !== 'number') return undefined;
  return legacyReviewLevel({
    lastResult: row.last_result,
    lastIncorrectAt: row.last_incorrect_at === null ? null : 0,
    correct: row.correct,
  });
}

/** Progress rows → the progress map (question id → entry), unvalidated. */
export function rowsToProgress(rows: readonly Partial<ProgressRow>[]): Record<string, unknown> {
  const map: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
  for (const row of rows) {
    if (typeof row.question_id !== 'string') continue;
    map[row.question_id] = {
      attempts: row.attempts,
      correct: row.correct,
      lastResult: row.last_result,
      firstAnsweredAt: ms(row.first_answered_at),
      lastAnsweredAt: ms(row.last_answered_at),
      lastIncorrectAt: row.last_incorrect_at === null ? null : ms(row.last_incorrect_at),
      lastSessionId: row.last_session_id,
      reviewLevel: rowReviewLevel(row),
    };
  }
  return { ...map };
}

export function bookmarkToRow(
  userId: string,
  examId: string,
  questionId: string,
  addedAt: number,
): BookmarkRow {
  return { user_id: userId, exam_id: examId, question_id: questionId, added_at: iso(addedAt) };
}

export function rowsToBookmarks(rows: readonly Partial<BookmarkRow>[]): Record<string, unknown> {
  const map: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
  for (const row of rows) {
    if (typeof row.question_id !== 'string') continue;
    map[row.question_id] = { addedAt: ms(row.added_at) };
  }
  return { ...map };
}

export function sessionToRow(
  userId: string,
  examId: string,
  session: PracticeSessionSummary,
): PracticeSessionRow {
  return {
    user_id: userId,
    id: session.id,
    exam_id: examId,
    label: session.label,
    started_at: iso(session.startedAt),
    finished_at: iso(session.finishedAt),
    total: session.total,
    answered: session.answered,
    correct: session.correct,
    by_domain: json(session.byDomain),
    incorrect_question_ids: [...session.incorrectQuestionIds],
  };
}

export function rowToSession(row: Partial<PracticeSessionRow>): unknown {
  return {
    id: row.id,
    label: row.label,
    startedAt: ms(row.started_at),
    finishedAt: ms(row.finished_at),
    total: row.total,
    answered: row.answered,
    correct: row.correct,
    byDomain: row.by_domain,
    incorrectQuestionIds: row.incorrect_question_ids,
  };
}

export function attemptToRows(
  userId: string,
  examId: string,
  attempt: ExamAttempt,
): { attempt: AttemptRow; questions: AttemptQuestionRow[] } {
  return {
    attempt: {
      user_id: userId,
      id: attempt.id,
      exam_id: examId,
      kind: attempt.kind,
      bank_version: attempt.bankVersion,
      started_at: iso(attempt.startedAt),
      ends_at: iso(attempt.endsAt),
      duration_ms: attempt.durationMs,
      submitted_at: iso(attempt.submittedAt),
      submit_reason: attempt.submitReason,
      time_used_ms: attempt.timeUsedMs,
      benchmark_percent: attempt.benchmarkPercent,
      benchmark_met: attempt.benchmarkMet,
      summary: json(attempt.summary),
      unavailable_question_ids: [...attempt.unavailableQuestionIds],
      integrity: json(attempt.integrity),
    },
    questions: attempt.questions.map((question, position) => ({
      user_id: userId,
      attempt_id: attempt.id,
      position,
      question_id: question.questionId,
      revision: question.revision,
      domain_id: question.domain,
      topic_id: question.taskStatement,
      selected_option_ids: [...question.selectedOptionIds],
      option_order: [...question.optionOrder],
      flagged: question.flagged,
      outcome: question.outcome,
    })),
  };
}

export function rowsToAttempt(
  row: Partial<AttemptRow>,
  questions: readonly Partial<AttemptQuestionRow>[],
): unknown {
  return {
    id: row.id,
    kind: row.kind,
    bankVersion: row.bank_version,
    startedAt: ms(row.started_at),
    endsAt: ms(row.ends_at),
    durationMs: row.duration_ms,
    submittedAt: ms(row.submitted_at),
    submitReason: row.submit_reason,
    timeUsedMs: row.time_used_ms,
    benchmarkPercent: row.benchmark_percent,
    benchmarkMet: row.benchmark_met,
    summary: row.summary,
    unavailableQuestionIds: row.unavailable_question_ids,
    integrity: row.integrity,
    questions: [...questions]
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((question) => ({
        questionId: question.question_id,
        revision: question.revision,
        domain: question.domain_id,
        taskStatement: question.topic_id,
        selectedOptionIds: question.selected_option_ids,
        optionOrder: question.option_order,
        flagged: question.flagged,
        outcome: question.outcome,
      })),
  };
}

export function activeExamToRow(
  userId: string,
  examId: string,
  session: ExamSession,
): ActiveExamRow {
  return { user_id: userId, exam_id: examId, session: json(session) };
}

export function preferencesToRow(userId: string, overrides: PreferenceOverrides): PreferencesRow {
  return { user_id: userId, preferences: json(overrides) };
}
