import { useLocation } from 'react-router';
import { EXAMS, findExam, type ExamGuide } from '@/domain/exam-guide';

/**
 * Exams a build offers (D-066): every exam in development and tests, launched ones only in
 * production builds, so the live site never offers an exam without questions.
 */
export function examsForMode(mode: string): readonly ExamGuide[] {
  return mode === 'production' ? EXAMS.filter((exam) => exam.launched) : EXAMS;
}

export const AVAILABLE_EXAMS: readonly ExamGuide[] = examsForMode(import.meta.env.MODE);

/** The available exam with this id, or undefined. */
export function findAvailableExam(id: string | undefined | null): ExamGuide | undefined {
  const exam = findExam(id);
  return exam && AVAILABLE_EXAMS.includes(exam) ? exam : undefined;
}

/** The exam an address belongs to: its first segment, if that is an available exam's id. */
export function examOfPath(pathname: string): ExamGuide | undefined {
  return findAvailableExam(pathname.split('/')[1]);
}

/**
 * The exam in the address (`/saa-c03/...`), or null on shared pages (settings, privacy).
 * Read from the location, so layouts above the exam's routes (the sidebar) see it too.
 * Most code wants `useCurrentExam()` from `state/hooks`, which falls back to the exam used last.
 */
export function useAddressExam(): ExamGuide | null {
  return examOfPath(useLocation().pathname) ?? null;
}
