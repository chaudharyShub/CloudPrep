import { DVA_C03, SAA_C03 } from '@/domain/exam-guide';
import type { Question } from '@/domain/questions/types';
import * as clf from './clf-c02';
import { placeholderQuestions } from './generate';

/**
 * The public sample bank (D-072). The real questions live in a private repo checked out at
 * `src/content/`; this bank stands in for them in tests, E2E builds and local development
 * without that checkout. It is never published.
 */
export interface AuthoredBank {
  readonly version: string;
  readonly questions: readonly Question[];
}

export const SAMPLE_BANKS: Readonly<Record<string, AuthoredBank>> = {
  'clf-c02': { version: clf.BANK_VERSION, questions: clf.QUESTION_BANK },
  'saa-c03': {
    version: '2026-11-14.1',
    questions: placeholderQuestions(SAA_C03, { D1: 25, D2: 22, D3: 20, D4: 16 }),
  },
  'dva-c03': {
    version: '2026-11-14.1',
    questions: placeholderQuestions(DVA_C03, { D1: 25, D2: 22, D3: 18, D4: 18 }),
  },
};
