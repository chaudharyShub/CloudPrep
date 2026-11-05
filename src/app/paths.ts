import { useCallback } from 'react';
import { useCurrentExam } from '@/state/hooks';

/**
 * Addresses of pages that belong to one exam (D-066): `/<exam id>/<page>`, e.g.
 * `/saa-c03/practice`. An empty page is the exam's landing page (`/saa-c03`).
 */
export function examPath(examId: string, page = ''): string {
  const rest = page.replace(/^\/+/, '');
  return rest ? `/${examId}/${rest}` : `/${examId}`;
}

/**
 * Pages that moved under an exam id; their old addresses (before D-066, when CLF-C02 was
 * the only exam) redirect to the CLF-C02 ones.
 */
export const EXAM_PAGES = [
  'dashboard',
  'practice',
  'practice/session',
  'bookmarks',
  'exam',
  'exam/check-in',
  'exam/session',
  'exam/review',
  'progress',
  'history',
] as const;

/** `examPath` for the current exam. */
export function useExamPath(): (page?: string) => string {
  const { id } = useCurrentExam();
  return useCallback((page = '') => examPath(id, page), [id]);
}
