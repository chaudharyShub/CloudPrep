import { DOMAINS, type DomainId, type TaskStatementId } from '@/domain/exam-guide/clf-c02';
import {
  summarizeAttemptQuestions,
  timeUsed,
  type AttemptQuestion,
  type ExamAttempt,
} from '@/domain/exam/attempt';
import { meetsBenchmark, type QuestionOutcome } from '@/domain/exam/scoring';
import type { AreaDefinition, Parsed } from './envelope';
import { parseIntegrityLog } from './integrityParse';
import { includes, KINDS, REASONS } from './examAreas';
import { isCount, isNonEmptyString, isRecord, isTimestamp, isUniqueStringArray } from './guards';

/** Newest first; older attempts beyond this are dropped. */
export const MAX_EXAM_ATTEMPTS = 100;

const OUTCOMES: readonly QuestionOutcome[] = ['correct', 'incorrect', 'unanswered'];
const TASKS_BY_DOMAIN = new Map<string, Set<string>>(
  DOMAINS.map((d) => [d.id, new Set(d.taskStatements.map((t) => t.id))]),
);

function parseAttemptQuestion(value: unknown): AttemptQuestion | null {
  if (!isRecord(value)) return null;
  const {
    questionId,
    revision,
    domain,
    taskStatement,
    selectedOptionIds,
    optionOrder,
    flagged,
    outcome,
  } = value;
  if (
    !isNonEmptyString(questionId) ||
    !isCount(revision) ||
    revision < 1 ||
    typeof domain !== 'string' ||
    typeof taskStatement !== 'string' ||
    !TASKS_BY_DOMAIN.get(domain)?.has(taskStatement) ||
    !isUniqueStringArray(selectedOptionIds) ||
    !isUniqueStringArray(optionOrder) ||
    !selectedOptionIds.every((id) => optionOrder.includes(id)) ||
    typeof flagged !== 'boolean' ||
    !includes(OUTCOMES, outcome) ||
    // An outcome must agree with whether anything was selected.
    (outcome === 'unanswered') !== (selectedOptionIds.length === 0)
  ) {
    return null;
  }
  return {
    questionId,
    revision,
    domain: domain as DomainId,
    taskStatement: taskStatement as TaskStatementId,
    selectedOptionIds,
    optionOrder,
    flagged,
    outcome,
  };
}

/**
 * Validates one stored attempt. Per-question outcomes are the source of truth: the stored
 * summary is checked against a recomputation, and a mismatch is repaired (and reported).
 */
export function parseExamAttempt(
  value: unknown,
): { attempt: ExamAttempt; repaired: boolean } | null {
  if (!isRecord(value)) return null;
  const {
    id,
    kind,
    bankVersion,
    startedAt,
    endsAt,
    durationMs,
    submittedAt,
    submitReason,
    benchmarkPercent,
    questions,
    unavailableQuestionIds,
  } = value;
  if (
    !isNonEmptyString(id) ||
    !includes(KINDS, kind) ||
    typeof bankVersion !== 'string' ||
    !isTimestamp(startedAt) ||
    !isTimestamp(endsAt) ||
    !isCount(durationMs) ||
    endsAt - startedAt !== durationMs ||
    !isTimestamp(submittedAt) ||
    submittedAt < startedAt ||
    !includes(REASONS, submitReason) ||
    typeof benchmarkPercent !== 'number' ||
    benchmarkPercent < 0 ||
    benchmarkPercent > 100 ||
    !Array.isArray(questions) ||
    !isUniqueStringArray(unavailableQuestionIds)
  ) {
    return null;
  }
  const parsedQuestions: AttemptQuestion[] = [];
  const seen = new Set<string>();
  for (const entry of questions) {
    const parsed = parseAttemptQuestion(entry);
    if (!parsed || seen.has(parsed.questionId)) return null;
    seen.add(parsed.questionId);
    parsedQuestions.push(parsed);
  }

  const summary = summarizeAttemptQuestions(parsedQuestions);
  const used = timeUsed(startedAt, endsAt, submittedAt);
  const met = meetsBenchmark(summary, benchmarkPercent);
  const stored = value['summary'];
  const integrity = parseIntegrityLog(value['integrity']);
  const repaired =
    integrity.dropped > 0 ||
    !isRecord(stored) ||
    stored['total'] !== summary.total ||
    stored['correct'] !== summary.correct ||
    stored['incorrect'] !== summary.incorrect ||
    stored['unanswered'] !== summary.unanswered ||
    value['timeUsedMs'] !== used ||
    value['benchmarkMet'] !== met;

  return {
    attempt: {
      id,
      kind,
      bankVersion,
      startedAt,
      endsAt,
      durationMs,
      submittedAt,
      submitReason,
      timeUsedMs: used,
      benchmarkPercent,
      benchmarkMet: met,
      summary,
      questions: parsedQuestions,
      unavailableQuestionIds,
      integrity: integrity.log,
    },
    repaired,
  };
}

/**
 * v1 → v2: v1 stored `isCorrect` per question and no summary. Outcomes are derived from
 * `isCorrect` and the selection; summary, time used and benchmark result are computed.
 * Unrecognisable entries are passed through unchanged and then dropped by the parser.
 */
export function migrateAttemptsV1(data: unknown): unknown {
  if (!Array.isArray(data)) return data;
  return data.map((entry: unknown) => {
    if (!isRecord(entry) || !Array.isArray(entry['questions'])) return entry;
    const questions = entry['questions'].map((q: unknown) => {
      if (!isRecord(q)) return q;
      const { isCorrect, ...rest } = q;
      const selected = Array.isArray(q['selectedOptionIds']) ? q['selectedOptionIds'] : [];
      const outcome: QuestionOutcome =
        isCorrect === true ? 'correct' : selected.length === 0 ? 'unanswered' : 'incorrect';
      return { ...rest, outcome };
    });
    const migrated: Record<string, unknown> = { ...entry, questions };
    // Fill in the v2 summary fields. Malformed entries are left for the parser to reject.
    try {
      const summary = summarizeAttemptQuestions(questions as AttemptQuestion[]);
      const { startedAt, endsAt, submittedAt, benchmarkPercent } = entry;
      if (
        typeof startedAt === 'number' &&
        typeof endsAt === 'number' &&
        typeof submittedAt === 'number' &&
        typeof benchmarkPercent === 'number'
      ) {
        migrated['summary'] = summary;
        migrated['timeUsedMs'] = timeUsed(startedAt, endsAt, submittedAt);
        migrated['benchmarkMet'] = meetsBenchmark(summary, benchmarkPercent);
      }
    } catch {
      // Unknown domains etc.: the parser drops this entry.
    }
    return migrated;
  });
}

export const EXAM_ATTEMPTS_AREA: AreaDefinition<readonly ExamAttempt[]> = {
  name: 'examAttempts',
  currentVersion: 2,
  fallback: () => [],
  migrations: { 1: migrateAttemptsV1 },
  parse: (data): Parsed<readonly ExamAttempt[]> | null => {
    if (!Array.isArray(data)) return null;
    const value: ExamAttempt[] = [];
    const ids = new Set<string>();
    let dropped = 0;
    for (const entry of data) {
      const parsed = parseExamAttempt(entry);
      if (parsed && !ids.has(parsed.attempt.id)) {
        ids.add(parsed.attempt.id);
        value.push(parsed.attempt);
        if (parsed.repaired) dropped++;
      } else {
        dropped++;
      }
    }
    return { value: value.slice(0, MAX_EXAM_ATTEMPTS), dropped };
  },
};
