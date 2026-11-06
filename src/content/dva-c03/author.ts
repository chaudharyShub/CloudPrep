import { questionAuthor, type QuestionSpec as Spec } from '../author';
import { REFS, type RefKey } from './refs';

export type { BatchMeta, Letter } from '../author';

/** A DVA-C03 question in compact form (see `../author.ts`). */
export type QuestionSpec = Spec<RefKey>;

/** Expands compact DVA-C03 specs into full questions (`dva-d<n>-<nnnn>`). */
export const defineQuestions = questionAuthor('dva', REFS);
