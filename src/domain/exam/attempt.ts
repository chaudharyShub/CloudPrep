import type { DomainId, TaskStatementId } from '@/domain/exam-guide/clf-c02';
import type { Question } from '@/domain/questions/types';
import type { ExamKind } from './config';
import {
  meetsBenchmark,
  scoreQuestion,
  summarizeOutcomes,
  type QuestionOutcome,
  type ScoreSummary,
} from './scoring';
import type { IntegrityLog } from './integrity';
import type { ExamSession, SubmitReason } from './session';

/**
 * Per-question record kept in exam history. The outcome is a snapshot taken at submission,
 * so later question changes never alter a past result (D-009). Question wording is kept
 * separately, once per question revision, in the question archive (D-031).
 */
export interface AttemptQuestion {
  readonly questionId: string;
  readonly revision: number;
  readonly domain: DomainId;
  readonly taskStatement: TaskStatementId;
  readonly selectedOptionIds: readonly string[];
  readonly optionOrder: readonly string[];
  readonly flagged: boolean;
  readonly outcome: QuestionOutcome;
}

/** A submitted exam as stored in history (schema version 2). */
export interface ExamAttempt {
  /** Same as the exam session id. */
  readonly id: string;
  readonly kind: ExamKind;
  readonly bankVersion: string;
  readonly startedAt: number;
  readonly endsAt: number;
  readonly durationMs: number;
  /** Completion time. */
  readonly submittedAt: number;
  readonly submitReason: SubmitReason;
  /** Time actually spent, capped at the allowed duration. */
  readonly timeUsedMs: number;
  /** Benchmark in effect at submission; later setting changes don't rewrite history. */
  readonly benchmarkPercent: number;
  readonly benchmarkMet: boolean;
  /** Score, counts and domain breakdown at submission. */
  readonly summary: ScoreSummary;
  readonly questions: readonly AttemptQuestion[];
  /** Questions that were in the session but missing from the bank (not scored). */
  readonly unavailableQuestionIds: readonly string[];
  /** Practice-integrity log copied from the session. Never affects scoring. */
  readonly integrity: IntegrityLog;
}

export function timeUsed(startedAt: number, endsAt: number, submittedAt: number): number {
  return Math.max(0, Math.min(submittedAt, endsAt) - startedAt);
}

/** Recomputes the summary from per-question outcomes (the source of truth). */
export function summarizeAttemptQuestions(questions: readonly AttemptQuestion[]): ScoreSummary {
  return summarizeOutcomes(questions);
}

/**
 * Turns a submitted session into an attempt record, scoring each answer with exact-set
 * matching. Unanswered and partly answered questions score as incorrect. Flags don't count.
 */
export function buildAttempt(
  session: ExamSession,
  questionsById: ReadonlyMap<string, Question>,
  benchmarkPercent: number,
): ExamAttempt {
  if (session.status !== 'submitted' || session.submittedAt === null || !session.submitReason) {
    throw new Error('Only submitted sessions can become attempts.');
  }
  const questions: AttemptQuestion[] = [];
  const unavailableQuestionIds: string[] = [];
  for (const questionId of session.questionIds) {
    const question = questionsById.get(questionId);
    if (!question) {
      unavailableQuestionIds.push(questionId);
      continue;
    }
    const selected = session.answers[questionId] ?? [];
    questions.push({
      questionId,
      revision: question.revision,
      domain: question.domain,
      taskStatement: question.taskStatement,
      selectedOptionIds: selected,
      optionOrder: session.optionOrder[questionId] ?? question.options.map((o) => o.id),
      flagged: session.flagged.includes(questionId),
      outcome: scoreQuestion(question.correctOptionIds, selected),
    });
  }
  const summary = summarizeAttemptQuestions(questions);
  return {
    id: session.id,
    kind: session.kind,
    bankVersion: session.bankVersion,
    startedAt: session.startedAt,
    endsAt: session.endsAt,
    durationMs: session.durationMs,
    submittedAt: session.submittedAt,
    submitReason: session.submitReason,
    timeUsedMs: timeUsed(session.startedAt, session.endsAt, session.submittedAt),
    benchmarkPercent,
    // An exam ended by the proctor is void, whatever the score.
    benchmarkMet:
      session.submitReason !== 'proctor_ended' && meetsBenchmark(summary, benchmarkPercent),
    summary,
    questions,
    unavailableQuestionIds,
    integrity: session.integrity,
  };
}

/** Archive key for a specific question revision. */
export function snapshotKey(questionId: string, revision: number): string {
  return `${questionId}@${String(revision)}`;
}
