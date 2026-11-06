import { examPath } from '@/app/paths';

/**
 * The page to open in another exam (D-066): the same section (Learning mode, Mock exam, …),
 * or the history for a result, since results and sessions belong to one exam. Null on shared
 * pages.
 */
export function switchExamPath(pathname: string, fromId: string, toId: string): string | null {
  const prefix = `/${fromId}`;
  if (pathname !== prefix && !pathname.startsWith(`${prefix}/`)) return null;
  const section = pathname.slice(prefix.length).split('/').filter(Boolean)[0] ?? '';
  return examPath(toId, section === 'results' ? 'history' : section);
}
