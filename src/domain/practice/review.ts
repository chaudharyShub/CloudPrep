/**
 * Review schedule (spaced repetition, D-052).
 *
 * Every answered question has a review level from 0 to MAX_REVIEW_LEVEL. The level sets how
 * many days after its latest answer a question is due again. A wrong answer resets it to 0; a
 * correct answer moves it up one level, but only when the question was due, so answering it
 * again early (a retry in the same sitting) doesn't skip ahead.
 *
 * Days are local calendar days: a question answered wrong at 22:00 is due the next morning.
 */

/** Days until a question is due again, indexed by review level. */
export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 21, 60] as const;
export const MAX_REVIEW_LEVEL = REVIEW_INTERVAL_DAYS.length - 1;

/** The fields of a question's progress the schedule needs. */
export interface ReviewState {
  readonly lastResult: 'correct' | 'incorrect';
  readonly lastAnsweredAt: number;
  readonly reviewLevel: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Day number of a timestamp's local calendar date (days since 1970-01-01). */
export function localDay(at: number): number {
  const date = new Date(at);
  return Math.round(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS);
}

export function isReviewLevel(value: unknown): value is number {
  return (
    typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= MAX_REVIEW_LEVEL
  );
}

/** Local day on which the question is due again. */
export function dueDay(state: ReviewState): number {
  const level = Math.min(Math.max(state.reviewLevel, 0), MAX_REVIEW_LEVEL);
  return localDay(state.lastAnsweredAt) + (REVIEW_INTERVAL_DAYS[level] ?? 1);
}

export function isDue(state: ReviewState, now: number): boolean {
  return localDay(now) >= dueDay(state);
}

/** Review level after an answer. `previous` is the state before it, if answered before. */
export function nextReviewLevel(
  previous: ReviewState | undefined,
  isCorrect: boolean,
  at: number,
): number {
  if (!isCorrect) return 0;
  if (!previous) return 1;
  if (!isDue(previous, at)) return previous.reviewLevel;
  return Math.min(previous.reviewLevel + 1, MAX_REVIEW_LEVEL);
}

/**
 * Level for progress saved before review levels existed. The history isn't stored, so this
 * is an estimate: 0 if the latest answer was wrong; one level per correct answer if the
 * question was never answered wrong; otherwise 1.
 */
export function legacyReviewLevel(entry: {
  readonly lastResult: 'correct' | 'incorrect';
  readonly lastIncorrectAt: number | null;
  readonly correct: number;
}): number {
  if (entry.lastResult === 'incorrect') return 0;
  if (entry.lastIncorrectAt === null) return Math.min(Math.max(entry.correct, 1), MAX_REVIEW_LEVEL);
  return 1;
}

/**
 * Questions due for review, most important first: lowest level (latest answer wrong) first,
 * then the longest overdue. Only ids in `availableIds` are returned.
 */
export function dueQuestionIds(
  progress: Readonly<Record<string, ReviewState>>,
  availableIds: ReadonlySet<string>,
  now: number,
): string[] {
  return Object.entries(progress)
    .filter(([id, state]) => availableIds.has(id) && isDue(state, now))
    .sort(
      ([, a], [, b]) =>
        a.reviewLevel - b.reviewLevel ||
        dueDay(a) - dueDay(b) ||
        a.lastAnsweredAt - b.lastAnsweredAt,
    )
    .map(([id]) => id);
}

export interface ReviewOverview {
  /** Questions due today (or overdue). */
  readonly due: number;
  /** Answered questions not due yet. */
  readonly later: number;
  /** Local day of the earliest question not due yet, or `null` if none. */
  readonly nextDueDay: number | null;
}

export function reviewOverview(
  progress: Readonly<Record<string, ReviewState>>,
  availableIds: ReadonlySet<string>,
  now: number,
): ReviewOverview {
  const today = localDay(now);
  let due = 0;
  let later = 0;
  let nextDueDay: number | null = null;
  for (const [id, state] of Object.entries(progress)) {
    if (!availableIds.has(id)) continue;
    const day = dueDay(state);
    if (day <= today) {
      due++;
    } else {
      later++;
      if (nextDueDay === null || day < nextDueDay) nextDueDay = day;
    }
  }
  return { due, later, nextDueDay };
}
