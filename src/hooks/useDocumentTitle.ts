import { useEffect } from 'react';

export const APP_NAME = 'CloudPrep';

export function formatDocumentTitle(title: string): string {
  return title ? `${title} · ${APP_NAME}` : APP_NAME;
}

/** Sets the browser tab title for the current page. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = formatDocumentTitle(title);
  }, [title]);
}
