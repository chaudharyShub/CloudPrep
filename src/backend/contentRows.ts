import {
  DOMAINS,
  EXAM_CODE,
  EXAM_DURATION_MINUTES,
  EXAM_GUIDE_URL,
  EXAM_ID,
  EXAM_NAME,
  EXAM_QUESTION_COUNT,
  EXAM_SCORED_QUESTION_COUNT,
  type DomainId,
  type TaskStatementId,
} from '@/domain/exam-guide/clf-c02';
import { requiredSelectionCount } from '@/domain/questions/evaluate';
import type {
  Difficulty,
  Question,
  QuestionType,
  ReviewStatus,
  SourceReference,
} from '@/domain/questions/types';

/**
 * Database rows for exam content (supabase/migrations), and conversion to and from the
 * app's `Question`. Used by the publish script now and by the app's question loader later.
 */

export interface ExamRow {
  id: string;
  code: string;
  name: string;
  provider: string;
  question_count: number;
  scored_question_count: number | null;
  duration_minutes: number;
  guide_url: string | null;
  is_published: boolean;
}

export interface ExamDomainRow {
  exam_id: string;
  id: string;
  number: number;
  name: string;
  weight_percent: number;
}

export interface ExamTopicRow {
  exam_id: string;
  id: string;
  domain_id: string;
  title: string;
  position: number;
}

/** Statuses stored in the database. Drafts are never published. */
export type PublishedStatus = Exclude<ReviewStatus, 'draft'>;

export interface QuestionRow {
  id: string;
  exam_id: string;
  revision: number;
  type: QuestionType;
  domain_id: string;
  topic_id: string;
  difficulty: Difficulty;
  status: PublishedStatus;
  stem: string;
  options: { id: string; text: string }[];
  required_selections: number;
  tags: string[];
  last_verified: string;
}

export interface QuestionKeyRow {
  question_id: string;
  revision: number;
  correct_option_ids: string[];
  explanation: string;
  option_explanations: Record<string, string>;
  references: SourceReference[];
  review_notes: string | null;
}

export interface QuestionRevisionRow {
  question_id: string;
  revision: number;
  content: Question;
}

export interface QuestionRows {
  question: QuestionRow;
  key: QuestionKeyRow;
  revision: QuestionRevisionRow;
}

/** The CLF-C02 catalogue rows, from the exam guide in code. */
export function clfExamRows(): {
  exam: ExamRow;
  domains: ExamDomainRow[];
  topics: ExamTopicRow[];
} {
  return {
    exam: {
      id: EXAM_ID,
      code: EXAM_CODE,
      name: EXAM_NAME,
      provider: 'AWS',
      question_count: EXAM_QUESTION_COUNT,
      scored_question_count: EXAM_SCORED_QUESTION_COUNT,
      duration_minutes: EXAM_DURATION_MINUTES,
      guide_url: EXAM_GUIDE_URL,
      is_published: true,
    },
    domains: DOMAINS.map((domain) => ({
      exam_id: EXAM_ID,
      id: domain.id,
      number: domain.number,
      name: domain.name,
      weight_percent: domain.weightPercent,
    })),
    topics: DOMAINS.flatMap((domain) =>
      domain.taskStatements.map((task, position) => ({
        exam_id: EXAM_ID,
        id: task.id,
        domain_id: domain.id,
        title: task.title,
        position,
      })),
    ),
  };
}

export function isPublishable(question: Question): boolean {
  return question.review.status !== 'draft';
}

/** Splits a question into its content, answer key and revision snapshot rows. */
export function questionToRows(question: Question, examId: string): QuestionRows {
  const { status } = question.review;
  if (status === 'draft') throw new Error(`Draft question ${question.id} can't be published.`);
  return {
    question: {
      id: question.id,
      exam_id: examId,
      revision: question.revision,
      type: question.type,
      domain_id: question.domain,
      topic_id: question.taskStatement,
      difficulty: question.difficulty,
      status,
      stem: question.stem,
      options: question.options.map((option) => ({ id: option.id, text: option.text })),
      required_selections: requiredSelectionCount(question),
      tags: [...question.tags],
      last_verified: question.review.lastVerified,
    },
    key: {
      question_id: question.id,
      revision: question.revision,
      correct_option_ids: [...question.correctOptionIds],
      explanation: question.explanation,
      option_explanations: Object.fromEntries(
        question.options.map((option) => [option.id, option.explanation]),
      ),
      references: question.references.map((ref) => ({ title: ref.title, url: ref.url })),
      review_notes: question.review.notes ?? null,
    },
    revision: { question_id: question.id, revision: question.revision, content: question },
  };
}

/**
 * Rebuilds a `Question` from its content and key rows. Returns null if they don't belong
 * together (different question or revision) or an option has no explanation. Database
 * values aren't trusted: callers check the result with `validateQuestion`.
 */
export function rowsToQuestion(row: QuestionRow, key: QuestionKeyRow): Question | null {
  if (row.id !== key.question_id || row.revision !== key.revision) return null;
  const options = [];
  for (const option of row.options) {
    const explanation = key.option_explanations[option.id];
    if (explanation === undefined) return null;
    options.push({ id: option.id, text: option.text, explanation });
  }
  return {
    id: row.id,
    revision: row.revision,
    type: row.type,
    stem: row.stem,
    options,
    correctOptionIds: key.correct_option_ids,
    explanation: key.explanation,
    // CLF-C02 is the only exam; the app's types are still specific to it.
    domain: row.domain_id as DomainId,
    taskStatement: row.topic_id as TaskStatementId,
    difficulty: row.difficulty,
    tags: row.tags,
    references: key.references,
    review: {
      status: row.status,
      lastVerified: row.last_verified,
      ...(key.review_notes === null ? {} : { notes: key.review_notes }),
    },
  };
}
