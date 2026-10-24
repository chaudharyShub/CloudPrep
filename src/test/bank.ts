import { BANK_VERSION, QUESTION_BANK } from '@/content/questions';
import { buildQuestionBank } from '@/state/questionBank';

/**
 * The repo's question bank as the app would load it. Tests that `vi.mock` the bank
 * (e.g. FullExam.test.tsx) get their mocked questions here too.
 */
export const TEST_BANK = buildQuestionBank(QUESTION_BANK, BANK_VERSION);
export const EXAM_QUESTIONS = TEST_BANK.exam.questions;
export const EXAM_QUESTIONS_BY_ID = TEST_BANK.exam.byId;
