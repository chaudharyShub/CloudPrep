import { createContext, use, useEffect } from 'react';

export const APP_NAME = 'CloudPrep';

/**
 * The exam code added to titles of pages that belong to one exam (D-066), e.g. "SAA-C03".
 * Provided by the exam routes; null on shared pages.
 */
export const TitleExamContext = createContext<string | null>(null);

export function formatDocumentTitle(title: string, examCode: string | null = null): string {
  const parts = [title, examCode, APP_NAME].filter((part): part is string => Boolean(part));
  return parts.join(' · ');
}

/** Sets the browser tab title for the current page, with the exam's code on exam pages. */
export function useDocumentTitle(title: string): void {
  const examCode = use(TitleExamContext);
  useEffect(() => {
    document.title = formatDocumentTitle(title, examCode);
  }, [title, examCode]);
}
