import { createContext, use, useEffect } from 'react';
import { formatDocumentTitle } from '@/lib/documentTitle';

export { APP_NAME, formatDocumentTitle } from '@/lib/documentTitle';

/**
 * The exam code added to titles of pages that belong to one exam (D-066), e.g. "SAA-C03".
 * Provided by the exam routes; null on shared pages.
 */
export const TitleExamContext = createContext<string | null>(null);

/** Sets the browser tab title for the current page, with the exam's code on exam pages. */
export function useDocumentTitle(title: string): void {
  const examCode = use(TitleExamContext);
  useEffect(() => {
    document.title = formatDocumentTitle(title, examCode);
  }, [title, examCode]);
}
