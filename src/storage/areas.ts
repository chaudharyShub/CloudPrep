import { DOMAINS, type DomainId } from '@/domain/exam-guide/clf-c02';
import type { ProgressMap, QuestionProgress } from '@/domain/practice/progress';
import type { DomainTally, PracticeSessionSummary } from '@/domain/practice/session';
import type { AreaDefinition, Parsed } from './envelope';
import { isCount, isNonEmptyString, isRecord, isSafeKey, isTimestamp } from './guards';

/**
 * Persisted storage areas. Each has its own key and schema version, so a problem in one
 * area never affects another. Validation is hand-written (docs/DECISIONS.md D-005).
 */

export type Bookmarks = Readonly<Record<string, { readonly addedAt: number }>>;

/** Newest first. Older summaries beyond this are dropped. */
export const MAX_SESSION_SUMMARIES = 50;

const DOMAIN_IDS = new Set<string>(DOMAINS.map((domain) => domain.id));

function parseQuestionProgress(value: unknown): QuestionProgress | null {
  if (!isRecord(value)) return null;
  const {
    attempts,
    correct,
    lastResult,
    firstAnsweredAt,
    lastAnsweredAt,
    lastIncorrectAt,
    lastSessionId,
  } = value;
  if (
    !isCount(attempts) ||
    attempts < 1 ||
    !isCount(correct) ||
    correct > attempts ||
    (lastResult !== 'correct' && lastResult !== 'incorrect') ||
    !isTimestamp(firstAnsweredAt) ||
    !isTimestamp(lastAnsweredAt) ||
    firstAnsweredAt > lastAnsweredAt ||
    !(lastIncorrectAt === null || isTimestamp(lastIncorrectAt)) ||
    !isNonEmptyString(lastSessionId) ||
    // Consistency checks that catch corrupted counters.
    (lastResult === 'correct' && correct === 0) ||
    (lastResult === 'incorrect' && (correct === attempts || lastIncorrectAt === null))
  ) {
    return null;
  }
  return {
    attempts,
    correct,
    lastResult,
    firstAnsweredAt,
    lastAnsweredAt,
    lastIncorrectAt,
    lastSessionId,
  };
}

export function parseProgress(data: unknown): Parsed<ProgressMap> | null {
  if (!isRecord(data)) return null;
  const value: Record<string, QuestionProgress> = {};
  let dropped = 0;
  for (const [questionId, entry] of Object.entries(data)) {
    const parsed = parseQuestionProgress(entry);
    if (parsed && isSafeKey(questionId)) value[questionId] = parsed;
    else dropped++;
  }
  return { value, dropped };
}

export function parseBookmarks(data: unknown): Parsed<Bookmarks> | null {
  if (!isRecord(data)) return null;
  const value: Record<string, { addedAt: number }> = {};
  let dropped = 0;
  for (const [questionId, entry] of Object.entries(data)) {
    if (isSafeKey(questionId) && isRecord(entry) && isTimestamp(entry['addedAt'])) {
      value[questionId] = { addedAt: entry['addedAt'] };
    } else {
      dropped++;
    }
  }
  return { value, dropped };
}

function parseByDomain(value: unknown): Partial<Record<DomainId, DomainTally>> | null {
  if (!isRecord(value)) return null;
  const result: Partial<Record<DomainId, DomainTally>> = {};
  for (const [domain, tally] of Object.entries(value)) {
    if (!DOMAIN_IDS.has(domain) || !isRecord(tally)) return null;
    const { answered, correct } = tally;
    if (!isCount(answered) || !isCount(correct) || correct > answered) return null;
    result[domain as DomainId] = { answered, correct };
  }
  return result;
}

function parseSummary(value: unknown): PracticeSessionSummary | null {
  if (!isRecord(value)) return null;
  const { id, label, startedAt, finishedAt, total, answered, correct, incorrectQuestionIds } =
    value;
  const byDomain = parseByDomain(value['byDomain']);
  if (
    !isNonEmptyString(id) ||
    typeof label !== 'string' ||
    !isTimestamp(startedAt) ||
    !isTimestamp(finishedAt) ||
    !isCount(total) ||
    !isCount(answered) ||
    !isCount(correct) ||
    answered > total ||
    correct > answered ||
    !byDomain ||
    !Array.isArray(incorrectQuestionIds) ||
    !incorrectQuestionIds.every(isNonEmptyString)
  ) {
    return null;
  }
  return {
    id,
    label,
    startedAt,
    finishedAt,
    total,
    answered,
    correct,
    byDomain,
    incorrectQuestionIds,
  };
}

export function parseSessions(data: unknown): Parsed<readonly PracticeSessionSummary[]> | null {
  if (!Array.isArray(data)) return null;
  const value: PracticeSessionSummary[] = [];
  const ids = new Set<string>();
  let dropped = 0;
  for (const entry of data) {
    const parsed = parseSummary(entry);
    if (parsed && !ids.has(parsed.id)) {
      ids.add(parsed.id);
      value.push(parsed);
    } else {
      dropped++;
    }
  }
  return { value: value.slice(0, MAX_SESSION_SUMMARIES), dropped };
}

export const PROGRESS_AREA: AreaDefinition<ProgressMap> = {
  name: 'progress',
  currentVersion: 1,
  fallback: () => ({}),
  migrations: {},
  parse: parseProgress,
};

export const BOOKMARKS_AREA: AreaDefinition<Bookmarks> = {
  name: 'bookmarks',
  currentVersion: 1,
  fallback: () => ({}),
  migrations: {},
  parse: parseBookmarks,
};

export const SESSIONS_AREA: AreaDefinition<readonly PracticeSessionSummary[]> = {
  name: 'practiceSessions',
  currentVersion: 1,
  fallback: () => [],
  migrations: {},
  parse: parseSessions,
};
