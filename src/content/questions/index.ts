import type { Question } from '@/domain/questions/types';
import { D1_QUESTIONS } from './d1-cloud-concepts';
import { D2_QUESTIONS } from './d2-security-compliance';
import { D3_QUESTIONS } from './d3-technology-services';
import { D4_QUESTIONS } from './d4-billing-support';

/** Bump when questions are added, removed, or revised. */
export const BANK_VERSION = '2026-10-25.1';

/** Every file in ./batches/ exports a default array of questions (see author.ts). */
const batchModules = import.meta.glob<readonly Question[]>('./batches/*.ts', {
  eager: true,
  import: 'default',
});
const BATCH_QUESTIONS = Object.keys(batchModules)
  .sort()
  .flatMap((path) => batchModules[path] ?? []);

/** Every authored question, including drafts. Use `practiceableQuestions()` for what learners see. */
export const QUESTION_BANK: readonly Question[] = [
  ...D1_QUESTIONS,
  ...D2_QUESTIONS,
  ...D3_QUESTIONS,
  ...D4_QUESTIONS,
  ...BATCH_QUESTIONS,
];
