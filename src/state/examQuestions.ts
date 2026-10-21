import { QUESTION_BANK } from '@/content/questions';
import { DOMAINS } from '@/domain/exam-guide/clf-c02';
import { allocateByWeight, maxBalancedQuestionCount } from '@/domain/exam/blueprint';
import {
  FULL_EXAM,
  MIN_SHORT_EXAM_QUESTIONS,
  shortExamConfig,
  type ExamConfig,
} from '@/domain/exam/config';
import { countByDomain, examEligibleQuestions } from '@/domain/exam/select';
import { indexQuestions } from '@/domain/questions/query';

/**
 * Exam-eligible questions, computed once. Exam pages use these; Learning Mode uses
 * `usePracticeQuestions` (the eligibility rules may differ, see docs/DECISIONS.md D-016).
 */
export const EXAM_QUESTIONS = examEligibleQuestions(QUESTION_BANK);
export const EXAM_QUESTIONS_BY_ID = indexQuestions(EXAM_QUESTIONS);
export const EXAM_AVAILABILITY = countByDomain(EXAM_QUESTIONS);

/** Questions per domain the full exam needs. */
export const FULL_EXAM_ALLOCATION = allocateByWeight(FULL_EXAM.questionCount);

/** Whether the bank can supply a full 65-question exam. */
export const FULL_EXAM_AVAILABLE = DOMAINS.every(
  (d) => EXAM_AVAILABILITY[d.id] >= FULL_EXAM_ALLOCATION[d.id],
);

/** The largest balanced shorter exam the bank can supply, or null if it's too small. */
export const SHORT_EXAM_CONFIG: ExamConfig | null = (() => {
  const count = maxBalancedQuestionCount(EXAM_AVAILABILITY, FULL_EXAM.questionCount - 1);
  return count >= MIN_SHORT_EXAM_QUESTIONS ? shortExamConfig(count) : null;
})();
