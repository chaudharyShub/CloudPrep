import type { Question } from '@/domain/questions/types';
import { D1_QUESTIONS } from './d1-cloud-concepts';
import { D2_QUESTIONS } from './d2-security-compliance';
import { D3_QUESTIONS } from './d3-technology-services';
import { D4_QUESTIONS } from './d4-billing-support';

/** Bump when questions are added, removed, or revised. */
export const BANK_VERSION = '2026-10-21.1';

/** Every authored question, including drafts. Use `practiceableQuestions()` for what learners see. */
export const QUESTION_BANK: readonly Question[] = [
  ...D1_QUESTIONS,
  ...D2_QUESTIONS,
  ...D3_QUESTIONS,
  ...D4_QUESTIONS,
];
