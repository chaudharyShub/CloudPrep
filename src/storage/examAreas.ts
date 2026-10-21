import type { ExamKind } from '@/domain/exam/config';
import type { ExamSession, ExamStatus, SubmitReason } from '@/domain/exam/session';
import type { AreaDefinition, Parsed } from './envelope';
import { parseIntegrityLog } from './integrityParse';
import { isCount, isNonEmptyString, isRecord, isTimestamp, isUniqueStringArray } from './guards';

export const KINDS: readonly ExamKind[] = ['full', 'short'];
const STATUSES: readonly ExamStatus[] = ['in_progress', 'confirming', 'submitted'];
export const REASONS: readonly SubmitReason[] = ['manual', 'time_expired', 'expired_while_away'];

export const includes = <T>(list: readonly T[], value: unknown): value is T =>
  (list as readonly unknown[]).includes(value);

/**
 * Validates a stored exam session. Every cross-reference must be consistent (answers only
 * for questions in the exam, only known options, no more selections than required).
 * Returns null if anything is wrong, so a damaged session is backed up rather than used.
 * A session saved while the finish dialog was open is restored as `in_progress`.
 */
export function parseExamSession(value: unknown): ExamSession | null {
  if (!isRecord(value)) return null;
  const {
    id,
    kind,
    bankVersion,
    seed,
    startedAt,
    endsAt,
    durationMs,
    questionIds,
    optionOrder,
    requiredSelections,
    answers,
    flagged,
    currentIndex,
    status,
    submittedAt,
    submitReason,
  } = value;

  if (
    !isNonEmptyString(id) ||
    !includes(KINDS, kind) ||
    typeof bankVersion !== 'string' ||
    !Number.isInteger(seed) ||
    !isTimestamp(startedAt) ||
    !isTimestamp(endsAt) ||
    !isCount(durationMs) ||
    durationMs === 0 ||
    endsAt - startedAt !== durationMs ||
    !isUniqueStringArray(questionIds) ||
    questionIds.length === 0 ||
    !isRecord(optionOrder) ||
    !isRecord(requiredSelections) ||
    !isRecord(answers) ||
    !isUniqueStringArray(flagged) ||
    !isCount(currentIndex) ||
    currentIndex >= questionIds.length ||
    !includes(STATUSES, status)
  ) {
    return null;
  }

  const inExam = new Set(questionIds);
  const order: Record<string, readonly string[]> = {};
  const required: Record<string, number> = {};
  for (const questionId of questionIds) {
    const options = optionOrder[questionId];
    const count = requiredSelections[questionId];
    if (!isUniqueStringArray(options) || options.length < 2) return null;
    if (!isCount(count) || count < 1 || count >= options.length) return null;
    order[questionId] = options;
    required[questionId] = count;
  }
  if (Object.keys(optionOrder).length !== questionIds.length) return null;
  if (Object.keys(requiredSelections).length !== questionIds.length) return null;

  const parsedAnswers: Record<string, readonly string[]> = {};
  for (const [questionId, selected] of Object.entries(answers)) {
    const options = order[questionId];
    const max = required[questionId];
    if (!options || max === undefined || !inExam.has(questionId)) return null;
    if (!isUniqueStringArray(selected)) return null;
    const list = selected;
    if (list.length > max || !list.every((optionId) => options.includes(optionId))) return null;
    parsedAnswers[questionId] = list;
  }
  if (!flagged.every((questionId) => inExam.has(questionId))) return null;

  const isSubmitted = status === 'submitted';
  if (isSubmitted) {
    if (!isTimestamp(submittedAt) || !includes(REASONS, submitReason)) return null;
  } else if (submittedAt !== null || submitReason !== null) {
    return null;
  }

  return {
    id,
    kind,
    bankVersion,
    seed: seed as number,
    startedAt,
    endsAt,
    durationMs,
    questionIds,
    optionOrder: order,
    requiredSelections: required,
    answers: parsedAnswers,
    flagged,
    currentIndex,
    status: status === 'confirming' ? 'in_progress' : status,
    submittedAt: isSubmitted ? submittedAt : null,
    submitReason: isSubmitted ? submitReason : null,
    integrity: parseIntegrityLog(value['integrity']).log,
  };
}

export const ACTIVE_EXAM_AREA: AreaDefinition<ExamSession | null> = {
  name: 'activeExam',
  currentVersion: 1,
  fallback: () => null,
  migrations: {},
  parse: (data): Parsed<ExamSession | null> | null => {
    if (data === null) return { value: null, dropped: 0 };
    const session = parseExamSession(data);
    return session ? { value: session, dropped: 0 } : null;
  },
};
