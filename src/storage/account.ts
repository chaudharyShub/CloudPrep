import { createScopedDriver, type StorageDriver } from './driver';
import { readArea, readKeyed, writeKeyed, type AreaDefinition } from './envelope';
import { isNonEmptyString, isRecord } from './guards';
import { PREFERENCES_AREA, type PreferenceOverrides } from './preferencesArea';
import type { UserData } from './store';

/**
 * Guest data and the signed-in account's local copy share one localStorage (D-047). Guest
 * data keeps the original `cloudprep:` keys; the account copy lives under this prefix and
 * belongs to one user at a time.
 */
export const ACCOUNT_PREFIX = 'cloudprep-account:';
const OWNER_KEY = 'owner';
/** Users who were already asked about adding this browser's guest data (base driver). */
export const IMPORT_ASKED_KEY = 'cloudprep-import-asked';

/** Whose copy this is, and whether they're still signed in on this browser. */
interface Owner {
  readonly userId: string;
  readonly signedIn: boolean;
}

const OWNER_AREA: AreaDefinition<Owner | null> = {
  name: OWNER_KEY,
  currentVersion: 1,
  fallback: () => null,
  migrations: {},
  parse: (data) =>
    isRecord(data) && isNonEmptyString(data['userId']) && typeof data['signedIn'] === 'boolean'
      ? { value: { userId: data['userId'], signedIn: data['signedIn'] }, dropped: 0 }
      : null,
};

function readOwner(base: StorageDriver): Owner | null {
  return readKeyed(createScopedDriver(base, ACCOUNT_PREFIX), OWNER_KEY, OWNER_AREA);
}

const ASKED_AREA: AreaDefinition<readonly string[]> = {
  name: IMPORT_ASKED_KEY,
  currentVersion: 1,
  fallback: () => [],
  migrations: {},
  parse: (data) => {
    if (!Array.isArray(data)) return null;
    const value = data.filter(isNonEmptyString);
    return { value, dropped: data.length - value.length };
  },
};

/** The user whose copy is in this browser, if any (signed in or not). */
export function accountOwner(base: StorageDriver): string | null {
  return readOwner(base)?.userId ?? null;
}

/**
 * The user whose copy is in this browser and who hasn't signed out. Used while sign-in
 * loads; a copy kept after signing out (unsent changes) is never shown early.
 */
export function signedInOwner(base: StorageDriver): string | null {
  const owner = readOwner(base);
  return owner?.signedIn ? owner.userId : null;
}

/**
 * After `userId` signs out: removes their copy, or, if `keep` (changes not on the server
 * yet), keeps it but marks them signed out. Does nothing if the copy is someone else's.
 */
export function closeAccountCopy(base: StorageDriver, userId: string, keep: boolean): void {
  if (accountOwner(base) !== userId) return;
  if (keep) {
    writeKeyed(createScopedDriver(base, ACCOUNT_PREFIX), OWNER_KEY, OWNER_AREA, {
      userId,
      signedIn: false,
    });
  } else {
    clearAccountCopy(base);
  }
}

/** Removes the account copy from this browser (it's on the server). */
export function clearAccountCopy(base: StorageDriver): void {
  const scoped = createScopedDriver(base, ACCOUNT_PREFIX);
  try {
    for (const key of scoped.keys()) scoped.removeItem(key);
  } catch {
    // Best effort.
  }
}

/**
 * The driver for `userId`'s local copy. Another user's copy is removed first, so one
 * browser never shows one person's data to another.
 */
export function openAccountDriver(base: StorageDriver, userId: string): StorageDriver {
  const scoped = createScopedDriver(base, ACCOUNT_PREFIX);
  const owner = readOwner(base);
  if (owner?.userId !== userId) clearAccountCopy(base);
  if (owner?.userId !== userId || !owner.signedIn) {
    writeKeyed(scoped, OWNER_KEY, OWNER_AREA, { userId, signedIn: true });
  }
  return scoped;
}

export function wasAskedToImport(base: StorageDriver, userId: string): boolean {
  return readKeyed(base, IMPORT_ASKED_KEY, ASKED_AREA).includes(userId);
}

export function markAskedToImport(base: StorageDriver, userId: string): void {
  const asked = readKeyed(base, IMPORT_ASKED_KEY, ASKED_AREA);
  if (!asked.includes(userId)) writeKeyed(base, IMPORT_ASKED_KEY, ASKED_AREA, [...asked, userId]);
}

/** Whether guest data has anything worth adding to an account. */
export function hasGuestData(data: UserData): boolean {
  return (
    Object.keys(data.progress).length > 0 ||
    Object.keys(data.bookmarks).length > 0 ||
    data.sessions.length > 0 ||
    data.attempts.length > 0
  );
}

/** Saved settings of the account copy in this browser (for the theme before first render). */
export function accountPreferences(base: StorageDriver): PreferenceOverrides | null {
  if (signedInOwner(base) === null) return null;
  return readArea(createScopedDriver(base, ACCOUNT_PREFIX), PREFERENCES_AREA, Date.now()).value;
}
