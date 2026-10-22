import type { DomainId, TaskStatementId } from '@/domain/exam-guide/clf-c02';

export const QUESTION_TYPES = ['single', 'multiple'] as const;
/** `single` = multiple choice (one correct of four); `multiple` = multiple response (two or more correct of five or more). */
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

/**
 * Review workflow (docs/DECISIONS.md D-016):
 * - `draft`: work in progress; never shown outside development.
 * - `unverified`: complete and validated, cited pages confirmed to exist, but the content has
 *   not been checked line by line against them (D-041). Shown, with a note saying so.
 * - `checked`: checked by the author against the cited AWS documentation.
 * - `approved`: additionally reviewed and signed off by a human reviewer.
 * - `retired`: kept so its ID is never reused; never shown.
 */
export const REVIEW_STATUSES = ['draft', 'unverified', 'checked', 'approved', 'retired'] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export interface AnswerOption {
  /** Stable within the question ('a', 'b', …). Never renumber after release. */
  readonly id: string;
  readonly text: string;
  /** Why this option is right or wrong. Required for every option. */
  readonly explanation: string;
}

export interface SourceReference {
  readonly title: string;
  /** https URL on docs.aws.amazon.com or aws.amazon.com. */
  readonly url: string;
}

export interface Question {
  /** Format `clf-d<domain>-<4 digits>`, e.g. `clf-d2-0007`. Never reused. */
  readonly id: string;
  /** Bump when a change could alter the correct answer. */
  readonly revision: number;
  readonly type: QuestionType;
  readonly stem: string;
  readonly options: readonly AnswerOption[];
  readonly correctOptionIds: readonly string[];
  /** Why the correct answer(s) are correct. */
  readonly explanation: string;
  readonly domain: DomainId;
  /** The exam-guide task statement this question targets; used as its topic. */
  readonly taskStatement: TaskStatementId;
  readonly difficulty: Difficulty;
  /** Optional educational tags, e.g. service names. */
  readonly tags: readonly string[];
  readonly references: readonly SourceReference[];
  readonly review: {
    readonly status: ReviewStatus;
    /** YYYY-MM-DD the content was last checked against its sources. */
    readonly lastVerified: string;
    readonly notes?: string;
  };
}

/** Statuses that may appear in Learning Mode. */
export const PRACTICE_VISIBLE_STATUSES: readonly ReviewStatus[] = [
  'unverified',
  'checked',
  'approved',
];
