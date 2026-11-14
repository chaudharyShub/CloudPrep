import { DOMAIN_IDS, type DomainId, type ExamGuide } from '@/domain/exam-guide/types';
import { allocateByWeight, maxBalancedQuestionCount } from '@/domain/exam/blueprint';
import {
  fullExamConfig,
  MIN_SHORT_EXAM_QUESTIONS,
  shortExamConfig,
  type ExamConfig,
} from '@/domain/exam/config';
import { countByDomain, examEligibleQuestions } from '@/domain/exam/select';
import { indexQuestions, practiceableQuestions } from '@/domain/questions/query';
import type { Question } from '@/domain/questions/types';

/** A loaded question bank with everything the pages derive from it, computed once per version. */
export interface QuestionBank {
  /** The exam these questions are for. */
  readonly exam: ExamGuide;
  /** `BANK_VERSION` / `exams.bank_version` the questions came from. */
  readonly version: string;
  /** Questions learners may practise (D-016, D-041), plus lookups. */
  readonly practice: {
    readonly questions: readonly Question[];
    readonly byId: ReadonlyMap<string, Question>;
    readonly ids: ReadonlySet<string>;
  };
  /** Exam-eligible questions and what exams the bank can supply. */
  readonly examQuestions: {
    readonly questions: readonly Question[];
    readonly byId: ReadonlyMap<string, Question>;
    readonly availability: Readonly<Record<DomainId, number>>;
    /** Questions per domain the full exam needs. */
    readonly fullAllocation: Readonly<Record<DomainId, number>>;
    /** Whether the bank can supply a full exam (65 questions). */
    readonly fullAvailable: boolean;
    /** The largest balanced shorter exam the bank can supply, or null if it's too small. */
    readonly shortConfig: ExamConfig | null;
  };
}

export function buildQuestionBank(
  questions: readonly Question[],
  version: string,
  exam: ExamGuide,
): QuestionBank {
  const practice = practiceableQuestions(questions);
  const practiceById = indexQuestions(practice);
  const examQuestions = examEligibleQuestions(questions);
  const availability = countByDomain(examQuestions);
  const full = fullExamConfig(exam);
  const fullAllocation = allocateByWeight(full.questionCount, exam.domains);
  const shortCount = maxBalancedQuestionCount(availability, full.questionCount - 1, exam.domains);
  return {
    exam,
    version,
    practice: { questions: practice, byId: practiceById, ids: new Set(practiceById.keys()) },
    examQuestions: {
      questions: examQuestions,
      byId: indexQuestions(examQuestions),
      availability,
      fullAllocation,
      fullAvailable: DOMAIN_IDS.every((id) => availability[id] >= fullAllocation[id]),
      shortConfig:
        shortCount >= MIN_SHORT_EXAM_QUESTIONS ? shortExamConfig(exam, shortCount) : null,
    },
  };
}
