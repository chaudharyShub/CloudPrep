import type { DomainId, TaskStatementId } from '@/domain/exam-guide/clf-c02';
import { PRACTICE_VISIBLE_STATUSES, type Difficulty, type Question } from './types';

export interface QuestionFilter {
  /** Empty or omitted = all domains. */
  domains?: readonly DomainId[];
  /** Empty or omitted = all task statements in the chosen domains. */
  taskStatements?: readonly TaskStatementId[];
  /** Empty or omitted = all difficulties. */
  difficulties?: readonly Difficulty[];
  /** Restrict to these question ids (e.g. bookmarks or mistakes). */
  ids?: readonly string[];
  /** Exclude these question ids (e.g. already answered). */
  excludeIds?: readonly string[];
}

/** Questions that may be practised: checked or approved, never drafts or retired ones. */
export function practiceableQuestions(bank: readonly Question[]): Question[] {
  return bank.filter((question) => PRACTICE_VISIBLE_STATUSES.includes(question.review.status));
}

export function filterQuestions(
  questions: readonly Question[],
  filter: QuestionFilter,
): Question[] {
  const domains = filter.domains?.length ? new Set(filter.domains) : null;
  const tasks = filter.taskStatements?.length ? new Set(filter.taskStatements) : null;
  const difficulties = filter.difficulties?.length ? new Set(filter.difficulties) : null;
  const ids = filter.ids ? new Set(filter.ids) : null;
  const exclude = filter.excludeIds?.length ? new Set(filter.excludeIds) : null;
  return questions.filter(
    (question) =>
      (!domains || domains.has(question.domain)) &&
      (!tasks || tasks.has(question.taskStatement)) &&
      (!difficulties || difficulties.has(question.difficulty)) &&
      (!ids || ids.has(question.id)) &&
      (!exclude || !exclude.has(question.id)),
  );
}

export function indexQuestions(questions: readonly Question[]): ReadonlyMap<string, Question> {
  return new Map(questions.map((question) => [question.id, question]));
}
