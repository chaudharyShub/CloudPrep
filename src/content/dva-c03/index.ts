import type { Question } from '@/domain/questions/types';

/** Bump when questions are added, removed, or revised. */
export const BANK_VERSION = '2026-11-05.1';

/** Every file in ./batches/ exports a default array of questions (see ../author.ts). */
const batchModules = import.meta.glob<readonly Question[]>('./batches/*.ts', {
  eager: true,
  import: 'default',
});

/** Every authored DVA-C03 question (`dva-d<n>-<nnnn>`), including drafts. */
export const QUESTION_BANK: readonly Question[] = Object.keys(batchModules)
  .sort()
  .flatMap((path) => batchModules[path] ?? []);
