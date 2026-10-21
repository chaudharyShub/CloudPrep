import { snapshotKey, type AttemptQuestion } from '@/domain/exam/attempt';
import type { Question } from '@/domain/questions/types';
import { EXAM_QUESTIONS_BY_ID } from '@/state/examQuestions';
import { useUserData } from '@/state/hooks';

export type QuestionSource =
  /** The exact revision answered in the exam, from the archive. */
  | 'snapshot'
  /** The current bank question, which is the same revision. */
  | 'bank'
  /** Only a newer revision exists; shown with a note. */
  | 'bank-newer'
  | 'missing';

/**
 * Resolves the question content for a past answer, preferring the archived revision
 * so old results are reviewed exactly as they were taken (D-031).
 */
export function resolveAttemptQuestion(
  record: Pick<AttemptQuestion, 'questionId' | 'revision'>,
  archive: Readonly<Record<string, Question>>,
  bank: ReadonlyMap<string, Question> = EXAM_QUESTIONS_BY_ID,
): { question: Question | null; source: QuestionSource } {
  const archived = archive[snapshotKey(record.questionId, record.revision)];
  if (archived) return { question: archived, source: 'snapshot' };
  const current = bank.get(record.questionId);
  if (!current) return { question: null, source: 'missing' };
  return {
    question: current,
    source: current.revision === record.revision ? 'bank' : 'bank-newer',
  };
}

export function useAttemptQuestion(record: Pick<AttemptQuestion, 'questionId' | 'revision'>) {
  const { questionArchive } = useUserData();
  return resolveAttemptQuestion(record, questionArchive);
}
