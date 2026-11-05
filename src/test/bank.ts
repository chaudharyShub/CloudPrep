import { BANK_VERSION, QUESTION_BANK } from '@/content/questions';
import { CLF_C02, DVA_C03, SAA_C03 } from '@/domain/exam-guide';
import { buildQuestionBank } from '@/state/questionBank';
import { makeBank } from './fixtures/bank';

/**
 * The repo's question bank as the app would load it. Tests that `vi.mock` the bank
 * (e.g. FullExam.test.tsx) get their mocked questions here too.
 */
export const TEST_BANK = buildQuestionBank(QUESTION_BANK, BANK_VERSION, CLF_C02);
export const EXAM_QUESTIONS = TEST_BANK.examQuestions.questions;
export const EXAM_QUESTIONS_BY_ID = TEST_BANK.examQuestions.byId;

/**
 * Synthetic SAA-C03 and DVA-C03 banks (D-066), large enough for a full 65-question exam,
 * until those exams have real questions.
 */
export const SAA_TEST_BANK = buildQuestionBank(
  makeBank({ D1: 25, D2: 22, D3: 20, D4: 16 }, SAA_C03),
  'saa-test',
  SAA_C03,
);
export const DVA_TEST_BANK = buildQuestionBank(
  makeBank({ D1: 25, D2: 22, D3: 18, D4: 18 }, DVA_C03),
  'dva-test',
  DVA_C03,
);
