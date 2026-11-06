/** Shape of an official AWS exam guide, as used by the app (docs/DECISIONS.md D-066). */

/** Every supported exam has four content domains. */
export const DOMAIN_IDS = ['D1', 'D2', 'D3', 'D4'] as const;
export type DomainId = (typeof DOMAIN_IDS)[number];

/** Task statement number from the exam guide, e.g. `'2.3'`. Checked against the guide. */
export type TaskStatementId = string;

export interface TaskStatement {
  readonly id: TaskStatementId;
  readonly title: string;
}

export interface ExamDomain {
  readonly id: DomainId;
  readonly number: 1 | 2 | 3 | 4;
  readonly name: string;
  /** Share of scored content, as a percentage. */
  readonly weightPercent: number;
  readonly taskStatements: readonly TaskStatement[];
}

export interface ExamGuide {
  /** Database id (`exams.id`) and address segment, e.g. `clf-c02`. */
  readonly id: string;
  /** Official exam code, e.g. `CLF-C02`. */
  readonly code: string;
  /** Official exam name, e.g. `AWS Certified Cloud Practitioner`. */
  readonly name: string;
  /** Short name for tight spaces, e.g. `Cloud Practitioner`. */
  readonly shortName: string;
  /** Certification level, as AWS groups them. */
  readonly level: 'Foundational' | 'Associate';
  /** Question id prefix, e.g. `clf` for `clf-d1-0001`. */
  readonly questionPrefix: string;
  readonly guideUrl: string;
  /** YYYY-MM-DD the facts below were checked against the guide. */
  readonly verified: string;
  readonly questionCount: number;
  readonly scoredQuestionCount: number;
  readonly durationMinutes: number;
  /** Minimum passing scaled score (100–1,000). */
  readonly passingScore: number;
  /** Exam fee in US dollars, from the certification page (before local taxes). */
  readonly feeUsd: number;
  readonly domains: readonly ExamDomain[];
  /** Offered in production builds (D-066). Unlaunched exams show only in development and tests. */
  readonly launched: boolean;
}
