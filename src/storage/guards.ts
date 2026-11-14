/** Small type guards shared by the storage parsers. */

import { DEFAULT_EXAM, isExamId } from '@/domain/exam-guide';

/**
 * The exam a saved item belongs to (D-066). Items saved before more exams existed have no
 * `examId` and belong to CLF-C02; an unknown exam id makes the item invalid (`null`).
 */
export function parseExamId(value: unknown): string | null {
  if (value === undefined) return DEFAULT_EXAM.id;
  return isExamId(value) ? value : null;
}

/** Keeps at most `max` items per exam, in their original order. */
export function capPerExam<T extends { readonly examId: string }>(
  items: readonly T[],
  max: number,
): T[] {
  const counts = new Map<string, number>();
  return items.filter((item) => {
    const count = counts.get(item.examId) ?? 0;
    counts.set(item.examId, count + 1);
    return count < max;
  });
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

export const isTimestamp = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

/** An array of non-empty strings with no duplicates. */
export function isUniqueStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every(isNonEmptyString) && new Set(value).size === value.length
  );
}

/**
 * Keys that could affect object prototypes if copied from untrusted data. Record parsers
 * skip them, so imported JSON can never pollute objects.
 */
const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function isSafeKey(key: string): boolean {
  return key.length > 0 && !UNSAFE_KEYS.has(key);
}
