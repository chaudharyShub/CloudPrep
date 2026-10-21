/** Small type guards shared by the storage parsers. */

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
