import {
  DOMAIN_IDS,
  type DomainId,
  type ExamDomain,
  type TaskStatementId,
} from '@/domain/exam-guide/types';
import { createRandom, shuffle, type Random } from '@/domain/lib/random';
import type { Question } from '@/domain/questions/types';
import { allocateByWeight, fitsAvailability, type DomainCounts } from './blueprint';
import { EXAM_ELIGIBLE_STATUSES } from './config';

export interface DomainShortfall {
  domain: DomainId;
  required: number;
  available: number;
}

export type SelectionResult =
  | { ok: true; questionIds: string[]; allocation: DomainCounts }
  | { ok: false; reason: 'insufficient'; allocation: DomainCounts; shortfalls: DomainShortfall[] };

export function examEligibleQuestions(bank: readonly Question[]): Question[] {
  return bank.filter((question) => EXAM_ELIGIBLE_STATUSES.includes(question.review.status));
}

export function countByDomain(questions: readonly Question[]): DomainCounts {
  const counts = Object.fromEntries(DOMAIN_IDS.map((id) => [id, 0])) as DomainCounts;
  for (const question of questions) counts[question.domain]++;
  return counts;
}

/** Round-robin across task statements (in shuffled order) until `count` are picked. */
function roundRobin(pool: readonly Question[], count: number, random: Random): Question[] {
  const byTask = new Map<TaskStatementId, Question[]>();
  for (const question of pool) {
    const list = byTask.get(question.taskStatement) ?? [];
    list.push(question);
    byTask.set(question.taskStatement, list);
  }
  const queues = shuffle([...byTask.keys()], random).map((task) =>
    shuffle(byTask.get(task) ?? [], random),
  );
  const picked: Question[] = [];
  while (picked.length < count) {
    let progressed = false;
    for (const queue of queues) {
      const next = queue.shift();
      if (!next) continue;
      picked.push(next);
      progressed = true;
      if (picked.length === count) break;
    }
    if (!progressed) break;
  }
  return picked;
}

/**
 * Picks `count` questions from one domain. Questions not seen in earlier exams come first;
 * within each group, picks are spread across the domain's task statements.
 */
function pickFromDomain(
  pool: readonly Question[],
  count: number,
  seenIds: ReadonlySet<string>,
  random: Random,
): Question[] {
  const fresh = roundRobin(
    pool.filter((q) => !seenIds.has(q.id)),
    count,
    random,
  );
  if (fresh.length === count) return fresh;
  return [
    ...fresh,
    ...roundRobin(
      pool.filter((q) => seenIds.has(q.id)),
      count - fresh.length,
      random,
    ),
  ];
}

export interface SelectExamInput {
  /** Exam-eligible questions (see `examEligibleQuestions`). */
  questions: readonly Question[];
  questionCount: number;
  /** The exam's domains, for the weighting. */
  domains: readonly ExamDomain[];
  seed: number;
  /** Question ids used in previous exam attempts; used only to prefer fresh questions. */
  seenIds?: ReadonlySet<string>;
}

/**
 * Builds a balanced, randomly ordered set of unique questions. Never duplicates a question
 * and never returns a partial exam: if any domain is short, it reports the shortfall instead.
 * The same inputs and seed always give the same result.
 */
export function selectExamQuestions({
  questions,
  questionCount,
  domains,
  seed,
  seenIds = new Set(),
}: SelectExamInput): SelectionResult {
  const allocation = allocateByWeight(questionCount, domains);
  // Defensive: treat duplicate ids in the input as one question.
  const unique = [...new Map(questions.map((q) => [q.id, q])).values()];
  const available = countByDomain(unique);

  if (!fitsAvailability(allocation, available)) {
    return {
      ok: false,
      reason: 'insufficient',
      allocation,
      shortfalls: DOMAIN_IDS.filter((id) => available[id] < allocation[id]).map((id) => ({
        domain: id,
        required: allocation[id],
        available: available[id],
      })),
    };
  }

  const random = createRandom(seed);
  const picked = DOMAIN_IDS.flatMap((id) =>
    pickFromDomain(
      unique.filter((q) => q.domain === id),
      allocation[id],
      seenIds,
      random,
    ),
  );
  return { ok: true, allocation, questionIds: shuffle(picked, random).map((q) => q.id) };
}
