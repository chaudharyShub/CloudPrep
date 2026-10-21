import { DOMAINS, type DomainId, type TaskStatementId } from '@/domain/exam-guide/clf-c02';
import type { ExamAttempt } from '@/domain/exam/attempt';
import type { DomainResult } from '@/domain/exam/scoring';

export interface WeakDomain {
  domain: DomainId;
  result: DomainResult;
  /** Exam weight × share missed: how much this domain held the score back. */
  impact: number;
}

export interface WeakTopic {
  taskStatement: TaskStatementId;
  missed: number;
  total: number;
}

/**
 * Weak areas in one attempt:
 * - domains scoring below the benchmark, ranked by impact (official weight × share missed),
 *   so a weak heavily weighted domain comes first;
 * - task statements with at least two missed questions.
 */
export function weakAreas(
  attempt: Pick<ExamAttempt, 'summary' | 'questions'>,
  benchmarkPercent: number,
): { domains: WeakDomain[]; topics: WeakTopic[] } {
  const domains = DOMAINS.flatMap((domain) => {
    const result = attempt.summary.byDomain[domain.id];
    if (result.total === 0 || result.score === null) return [];
    if (result.score * 100 >= benchmarkPercent) return [];
    return [
      { domain: domain.id, result, impact: (domain.weightPercent / 100) * (1 - result.score) },
    ];
  }).sort((a, b) => b.impact - a.impact);

  const byTask = new Map<TaskStatementId, WeakTopic>();
  for (const question of attempt.questions) {
    const topic = byTask.get(question.taskStatement) ?? {
      taskStatement: question.taskStatement,
      missed: 0,
      total: 0,
    };
    topic.total++;
    if (question.outcome !== 'correct') topic.missed++;
    byTask.set(question.taskStatement, topic);
  }
  const topics = [...byTask.values()]
    .filter((topic) => topic.missed >= 2)
    .sort((a, b) => b.missed - a.missed || b.missed / b.total - a.missed / a.total)
    .slice(0, 3);

  return { domains, topics };
}

export type NextStep =
  | { kind: 'practise-domain'; domain: DomainId }
  | { kind: 'practise-missed'; questionIds: string[] }
  | { kind: 'pacing'; unanswered: number }
  | { kind: 'retake' }
  | { kind: 'confirm-consistency' };

/** Rule-based suggestions; every rule is explained to the learner where it's shown. */
export function nextSteps(attempt: ExamAttempt): NextStep[] {
  const steps: NextStep[] = [];
  const missed = attempt.questions.filter((q) => q.outcome !== 'correct').map((q) => q.questionId);
  if (attempt.summary.unanswered > 0) {
    steps.push({ kind: 'pacing', unanswered: attempt.summary.unanswered });
  }
  for (const weak of weakAreas(attempt, attempt.benchmarkPercent).domains.slice(0, 2)) {
    steps.push({ kind: 'practise-domain', domain: weak.domain });
  }
  if (missed.length > 0) steps.push({ kind: 'practise-missed', questionIds: missed });
  steps.push(attempt.benchmarkMet ? { kind: 'confirm-consistency' } : { kind: 'retake' });
  return steps;
}
