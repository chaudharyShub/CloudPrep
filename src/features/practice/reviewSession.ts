import type { ProgressMap } from '@/domain/practice/progress';
import { dueQuestionIds } from '@/domain/practice/review';
import type { PracticeLength } from '@/storage/preferencesArea';
import type { SessionSetup } from './sessionSetup';

export const REVIEW_SESSION_LABEL = 'Review due';

/**
 * A "Review due" session (D-052): the most important due questions, up to the default
 * practice length. Returns `null` when nothing is due.
 */
export function reviewSessionSetup(
  progress: ProgressMap,
  availableIds: ReadonlySet<string>,
  now: number,
  length: PracticeLength,
): SessionSetup | null {
  const due = dueQuestionIds(progress, availableIds, now);
  if (due.length === 0) return null;
  // Pick the most important questions first; the session then shuffles them.
  const questionIds = length === 'all' ? due : due.slice(0, Number(length));
  return { label: REVIEW_SESSION_LABEL, questionIds, limit: null };
}

/** "today", "tomorrow", "in 3 days" for a local day number relative to `today`. */
export function describeDueDay(day: number, today: number): string {
  const days = day - today;
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

export function questionCount(count: number): string {
  return `${count} question${count === 1 ? '' : 's'}`;
}
