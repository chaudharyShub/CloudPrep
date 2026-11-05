import type { Question } from '@/domain/questions/types';
import * as dva from './dva-c03';
import * as clf from './questions';
import * as saa from './saa-c03';

export interface AuthoredBank {
  /** `BANK_VERSION` of the exam's questions; published as `exams.bank_version`. */
  readonly version: string;
  readonly questions: readonly Question[];
}

/** The authored question bank of every exam, by exam id (D-066). */
export const BANKS: Readonly<Record<string, AuthoredBank>> = {
  'clf-c02': { version: clf.BANK_VERSION, questions: clf.QUESTION_BANK },
  'saa-c03': { version: saa.BANK_VERSION, questions: saa.QUESTION_BANK },
  'dva-c03': { version: dva.BANK_VERSION, questions: dva.QUESTION_BANK },
};
