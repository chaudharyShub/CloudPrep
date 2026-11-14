/**
 * Page titles, shared by the app (useDocumentTitle) and the build, which writes the same
 * titles into each public page's HTML (D-068). Plain TypeScript, no React.
 */

export const APP_NAME = 'CloudPrep';

/** "Learning mode · SAA-C03 · CloudPrep": the page, the exam's code on exam pages, the app. */
export function formatDocumentTitle(title: string, examCode: string | null = null): string {
  const parts = [title, examCode, APP_NAME].filter((part): part is string => Boolean(part));
  return parts.join(' · ');
}
