import { snapshotKey } from '@/domain/exam/attempt';
import type { Question } from '@/domain/questions/types';
import { validateQuestion } from '@/domain/questions/validate';
import type { AreaDefinition, Parsed } from './envelope';
import { isRecord, isSafeKey } from './guards';

/**
 * Question content as it was when used in an exam, keyed by `id@revision`.
 *
 * Snapshot strategy (docs/DECISIONS.md D-031): each attempt stores only ids, revisions,
 * selections and outcomes. The wording, options, explanations and sources of each question
 * revision are stored once here and shared by every attempt that used it. Old attempts can
 * then be reviewed exactly as taken, even after the bank changes, without copying question
 * text into every attempt. Entries no attempt references are pruned.
 */
export type QuestionArchive = Readonly<Record<string, Question>>;

export function parseArchive(data: unknown): Parsed<QuestionArchive> | null {
  if (!isRecord(data)) return null;
  const value: Record<string, Question> = {};
  let dropped = 0;
  for (const [key, entry] of Object.entries(data)) {
    if (
      isSafeKey(key) &&
      validateQuestion(entry).length === 0 &&
      isRecord(entry) &&
      key === snapshotKey(entry['id'] as string, entry['revision'] as number)
    ) {
      value[key] = entry as unknown as Question;
    } else {
      dropped++;
    }
  }
  return { value, dropped };
}

export const QUESTION_ARCHIVE_AREA: AreaDefinition<QuestionArchive> = {
  name: 'questionArchive',
  currentVersion: 1,
  fallback: () => ({}),
  migrations: {},
  parse: parseArchive,
};
