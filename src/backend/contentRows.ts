import type { DomainId, ExamGuide } from '@/domain/exam-guide/types';
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

/**
 * One exam's catalogue rows, from its exam guide in code (D-066). `published` says whether
 * the exam has questions to publish; user data can reference the exam either way.
 */
export function examRows(
  guide: ExamGuide,
  published: boolean,
): {
  exam: ExamRow;
  domains: ExamDomainRow[];
  topics: ExamTopicRow[];
} {
  return {
    exam: {
      id: guide.id,
      code: guide.code,
      name: guide.name,
      provider: 'AWS',
      question_count: guide.questionCount,
      scored_question_count: guide.scoredQuestionCount,
      duration_minutes: guide.durationMinutes,
      guide_url: guide.guideUrl,
      is_published: published,
    },
    domains: guide.domains.map((domain) => ({
      exam_id: guide.id,
      id: domain.id,
      number: domain.number,
      name: domain.name,
      weight_percent: domain.weightPercent,
    })),
    topics: guide.domains.flatMap((domain) =>
      domain.taskStatements.map((task, position) => ({
        exam_id: guide.id,
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
    taskStatement: row.topic_id,
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
