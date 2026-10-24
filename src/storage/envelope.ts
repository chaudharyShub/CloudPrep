import { isQuotaError, type StorageDriver } from './driver';

export const APP_ID = 'cloudprep';
export const KEY_PREFIX = 'cloudprep:';
export const BACKUP_PREFIX = 'cloudprep:backup:';
/** Backups kept per key; older ones are pruned. */
export const MAX_BACKUPS_PER_KEY = 3;

/** Shape of every value CloudPrep writes to storage. */
export interface Envelope {
  app: typeof APP_ID;
  schemaVersion: number;
  savedAt: string;
  data: unknown;
}

export interface Parsed<T> {
  value: T;
  /** Number of invalid entries dropped while parsing (0 = fully valid). */
  dropped: number;
}

export interface AreaDefinition<T> {
  /** Storage key without prefix, e.g. "progress". */
  name: string;
  currentVersion: number;
  fallback: () => T;
  /** Upgrades data from an older schema version, one step at a time. */
  migrations: Readonly<Record<number, (data: unknown) => unknown>>;
  /** Validates data at `currentVersion`. Returns `null` if unusable as a whole. */
  parse: (data: unknown) => Parsed<T> | null;
}

export type ReadResult<T> =
  | { status: 'missing'; value: T }
  | { status: 'ok'; value: T }
  /** Data was unreadable or partly invalid; the raw value was backed up first. */
  | { status: 'recovered'; value: T; backupKey: string | null }
  /** Written by a newer app version; used if parseable, but never overwritten. */
  | { status: 'newer-version'; value: T; schemaVersion: number };

export function storageKey(name: string): string {
  return `${KEY_PREFIX}${name}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Copies a raw value to a timestamped backup key and prunes old backups. Never throws. */
export function backupRaw(
  driver: StorageDriver,
  name: string,
  raw: string,
  now: number,
): string | null {
  const prefix = `${BACKUP_PREFIX}${name}:`;
  const backupKey = `${prefix}${now}`;
  try {
    driver.setItem(backupKey, raw);
  } catch {
    return null;
  }
  try {
    const backups = driver
      .keys()
      .filter((key) => key.startsWith(prefix))
      .sort((a, b) => Number(b.slice(prefix.length)) - Number(a.slice(prefix.length)));
    for (const stale of backups.slice(MAX_BACKUPS_PER_KEY)) driver.removeItem(stale);
  } catch {
    // Pruning is best-effort.
  }
  return backupKey;
}

/**
 * Reads one storage area: parse JSON → check envelope → migrate → validate.
 * Never throws. Unusable data is backed up before defaults are returned.
 */
export function readArea<T>(
  driver: StorageDriver,
  area: AreaDefinition<T>,
  now: number,
): ReadResult<T> {
  let raw: string | null;
  try {
    raw = driver.getItem(storageKey(area.name));
  } catch {
    return { status: 'missing', value: area.fallback() };
  }
  if (raw === null) return { status: 'missing', value: area.fallback() };

  const recover = (): ReadResult<T> => ({
    status: 'recovered',
    value: area.fallback(),
    backupKey: backupRaw(driver, area.name, raw, now),
  });

  let envelope: unknown;
  try {
    envelope = JSON.parse(raw);
  } catch {
    return recover();
  }
  if (
    !isRecord(envelope) ||
    envelope['app'] !== APP_ID ||
    !Number.isInteger(envelope['schemaVersion']) ||
    (envelope['schemaVersion'] as number) < 0 ||
    !('data' in envelope)
  ) {
    return recover();
  }

  const decoded = decodeArea(area, envelope['schemaVersion'], envelope['data']);
  switch (decoded.status) {
    case 'newer': {
      // Best effort: a newer app may have kept the same shape. Never write back over it.
      const parsed = area.parse(envelope['data']);
      return {
        status: 'newer-version',
        value: parsed ? parsed.value : area.fallback(),
        schemaVersion: decoded.schemaVersion,
      };
    }
    case 'invalid':
      return recover();
    case 'ok':
      if (decoded.dropped > 0) {
        return {
          status: 'recovered',
          value: decoded.value,
          backupKey: backupRaw(driver, area.name, raw, now),
        };
      }
      return { status: 'ok', value: decoded.value };
  }
}

export type DecodeResult<T> =
  | { status: 'ok'; value: T; dropped: number }
  /** Written by a newer version of CloudPrep than this one. */
  | { status: 'newer'; schemaVersion: number }
  /** Unreadable, wrong shape, or from an older version with no migration path. */
  | { status: 'invalid' };

/**
 * Version check → step-by-step migrations → validation. Shared by browser storage and
 * imported files, so both go through exactly the same checks.
 */
export function decodeArea<T>(
  area: AreaDefinition<T>,
  schemaVersion: unknown,
  data: unknown,
): DecodeResult<T> {
  if (typeof schemaVersion !== 'number' || !Number.isInteger(schemaVersion) || schemaVersion < 0) {
    return { status: 'invalid' };
  }
  if (schemaVersion > area.currentVersion) return { status: 'newer', schemaVersion };
  let current = data;
  for (let from = schemaVersion; from < area.currentVersion; from++) {
    const migrate = area.migrations[from];
    if (!migrate) return { status: 'invalid' };
    try {
      current = migrate(current);
    } catch {
      return { status: 'invalid' };
    }
  }
  const parsed = area.parse(current);
  if (!parsed) return { status: 'invalid' };
  return { status: 'ok', value: parsed.value, dropped: parsed.dropped };
}

export type WriteResult = { ok: true } | { ok: false; reason: 'quota' | 'error' };

export function writeArea<T>(
  driver: StorageDriver,
  area: AreaDefinition<T>,
  value: T,
  now: number,
): WriteResult {
  const envelope: Envelope = {
    app: APP_ID,
    schemaVersion: area.currentVersion,
    savedAt: new Date(now).toISOString(),
    data: value,
  };
  try {
    driver.setItem(storageKey(area.name), JSON.stringify(envelope));
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: isQuotaError(error) ? 'quota' : 'error' };
  }
}

/**
 * Reads a small value saved under its own key (outside the store's areas) with the same
 * envelope, migrations and parser. Unusable values read as the fallback; they're
 * re-derivable bookkeeping (sync lists, flags), so no backup is kept.
 */
export function readKeyed<T>(driver: StorageDriver, key: string, area: AreaDefinition<T>): T {
  try {
    const raw = driver.getItem(key);
    if (raw === null) return area.fallback();
    const envelope: unknown = JSON.parse(raw);
    if (!isRecord(envelope) || envelope['app'] !== APP_ID) return area.fallback();
    const decoded = decodeArea(area, envelope['schemaVersion'], envelope['data']);
    return decoded.status === 'ok' ? decoded.value : area.fallback();
  } catch {
    return area.fallback();
  }
}

/** Saves a value under its own key in an envelope. Returns false if it couldn't be stored. */
export function writeKeyed<T>(
  driver: StorageDriver,
  key: string,
  area: AreaDefinition<T>,
  value: T,
): boolean {
  const envelope: Envelope = {
    app: APP_ID,
    schemaVersion: area.currentVersion,
    savedAt: new Date().toISOString(),
    data: value,
  };
  try {
    driver.setItem(key, JSON.stringify(envelope));
    return true;
  } catch {
    return false;
  }
}
