import { questionAuthor, type QuestionSpec as Spec } from '../author';
import { REFS, type RefKey } from './refs';

export type { BatchMeta, Letter } from '../author';

/** A CLF-C02 question in compact form (see `../author.ts`). */
export type QuestionSpec = Spec<RefKey>;

/** Expands compact CLF-C02 specs into full questions (`clf-d<n>-<nnnn>`). */
export const defineQuestions = questionAuthor('clf', REFS);
