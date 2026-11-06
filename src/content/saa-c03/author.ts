import { questionAuthor, type QuestionSpec as Spec } from '../author';
import { REFS, type RefKey } from './refs';

export type { BatchMeta, Letter } from '../author';

/** An SAA-C03 question in compact form (see `../author.ts`). */
export type QuestionSpec = Spec<RefKey>;

/** Expands compact SAA-C03 specs into full questions (`saa-d<n>-<nnnn>`). */
export const defineQuestions = questionAuthor('saa', REFS);
