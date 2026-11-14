import type { DomainId, ExamGuide, TaskStatementId } from '@/domain/exam-guide/types';
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

/** Counts one exam's questions by domain, task statement, type, difficulty and review status. */
export function bankCoverage(questions: readonly Question[], exam: ExamGuide): BankCoverage {
  const byDomain = Object.fromEntries(exam.domains.map((d) => [d.id, 0])) as Record<
    DomainId,
    number
  >;
  const byTaskStatement = Object.fromEntries(
    exam.domains.flatMap((d) => d.taskStatements.map((t) => [t.id, 0])),
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
    byTaskStatement[question.taskStatement] = (byTaskStatement[question.taskStatement] ?? 0) + 1;
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
    uncoveredTaskStatements: Object.keys(byTaskStatement).filter((id) => byTaskStatement[id] === 0),
  };
}
