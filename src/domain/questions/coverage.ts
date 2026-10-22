import { DOMAINS, type DomainId, type TaskStatementId } from '@/domain/exam-guide/clf-c02';
import type { Difficulty, Question, QuestionType, ReviewStatus } from './types';

export interface BankCoverage {
  total: number;
  byDomain: Record<DomainId, number>;
  byTaskStatement: Record<TaskStatementId, number>;
  byType: Record<QuestionType, number>;
  byDifficulty: Record<Difficulty, number>;
  byStatus: Record<ReviewStatus, number>;
  /** Task statements in the exam guide with no questions. */
  uncoveredTaskStatements: TaskStatementId[];
}

/** Counts questions by domain, task statement, type, difficulty and review status. */
export function bankCoverage(questions: readonly Question[]): BankCoverage {
  const byDomain = Object.fromEntries(DOMAINS.map((d) => [d.id, 0])) as Record<DomainId, number>;
  const byTaskStatement = Object.fromEntries(
    DOMAINS.flatMap((d) => d.taskStatements.map((t) => [t.id, 0])),
  ) as Record<TaskStatementId, number>;
  const byType: Record<QuestionType, number> = { single: 0, multiple: 0 };
  const byDifficulty: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 };
  const byStatus: Record<ReviewStatus, number> = {
    draft: 0,
    unverified: 0,
    checked: 0,
    approved: 0,
    retired: 0,
  };

  for (const question of questions) {
    byDomain[question.domain]++;
    byTaskStatement[question.taskStatement]++;
    byType[question.type]++;
    byDifficulty[question.difficulty]++;
    byStatus[question.review.status]++;
  }

  return {
    total: questions.length,
    byDomain,
    byTaskStatement,
    byType,
    byDifficulty,
    byStatus,
    uncoveredTaskStatements: (Object.keys(byTaskStatement) as TaskStatementId[]).filter(
      (id) => byTaskStatement[id] === 0,
    ),
  };
}
