import type { ExamAttempt } from '@/domain/exam/attempt';
import type { ExamSession } from '@/domain/exam/session';
import type { QuestionProgress } from '@/domain/practice/progress';
import type { PracticeSessionSummary } from '@/domain/practice/session';
import { parseBookmarks, parseProgress, parseSessions } from './areas';
import { EXAM_ATTEMPTS_AREA } from './attemptsArea';
import type { StorageDriver } from './driver';
import { readKeyed, writeKeyed, type AreaDefinition } from './envelope';
import { parseExamSession } from './examAreas';
import { PREFERENCES_AREA, type PreferenceOverrides } from './preferencesArea';
import type { AppStore, LocalChange, StoredData } from './store';

/**
 * Keeps a signed-in user's local copy and their rows in Supabase in step (D-047).
 *
 * The store stays the working copy, so pages read and write synchronously. Each local change
 * marks the records it touched as pending; pending records are sent (debounced, retried with
 * back-off) and the list is saved in the browser, so changes made offline or just before the
 * tab closed are sent later. A pull replaces the local copy with the server's, but only when
 * nothing is pending, so unsent changes are never overwritten.
 */

/** Areas stored on the server. The question archive stays local (D-031, D-047). */
export const SYNCED_AREAS = [
  'progress',
  'bookmarks',
  'sessions',
  'attempts',
  'activeExam',
  'preferenceOverrides',
] as const;
export type SyncedArea = (typeof SYNCED_AREAS)[number];

export interface SyncItems {
  progress: { readonly questionId: string; readonly entry: QuestionProgress };
  bookmarks: { readonly questionId: string; readonly addedAt: number };
  sessions: PracticeSessionSummary;
  attempts: ExamAttempt;
  activeExam: ExamSession;
  preferenceOverrides: PreferenceOverrides;
}

export interface AreaChanges<T> {
  /** Delete every row of the area first (the local area was emptied). */
  readonly clear: boolean;
  readonly upsert: readonly T[];
  /** Keys of rows to delete: question ids, session or attempt ids. */
  readonly delete: readonly string[];
}

export type SyncChanges = { readonly [K in SyncedArea]?: AreaChanges<SyncItems[K]> };

/** The user's data as read from the server, in app shapes but not yet validated. */
export interface RemoteUserData {
  readonly progress: unknown;
  readonly bookmarks: unknown;
  readonly sessions: unknown;
  readonly attempts: unknown;
  readonly activeExam: unknown;
  readonly preferences: unknown;
}

/** The server side of sync. Implementations: Supabase (`src/backend/`) and a fake. */
export interface UserDataRemote {
  pull(): Promise<RemoteUserData>;
  /** Applies the changes; each area's clear and deletes before its upserts. Throws on failure. */
  push(changes: SyncChanges): Promise<void>;
}

/** Records of an area by key, so two versions can be compared. */
const ITEMS: { [K in SyncedArea]: (value: StoredData[K]) => Map<string, SyncItems[K]> } = {
  progress: (value) =>
    new Map(
      Object.entries(value).map(([questionId, entry]) => [questionId, { questionId, entry }]),
    ),
  bookmarks: (value) =>
    new Map(
      Object.entries(value).map(([questionId, { addedAt }]) => [
        questionId,
        { questionId, addedAt },
      ]),
    ),
  sessions: (value) => new Map(value.map((session) => [session.id, session])),
  attempts: (value) => new Map(value.map((attempt) => [attempt.id, attempt])),
  activeExam: (value) => new Map(value ? [[ONE, value]] : []),
  preferenceOverrides: (value) => new Map(Object.keys(value).length > 0 ? [[ONE, value]] : []),
};
/** Key of single-row areas (exam in progress, settings). */
const ONE = 'current';

/** Whether a record changed. Progress and bookmark entries are compared by value. */
function sameItem(area: SyncedArea, a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (area === 'progress' || area === 'bookmarks') return JSON.stringify(a) === JSON.stringify(b);
  return false;
}

/** Pending entries: `area` + record key, or `area` + CLEAR. */
const CLEAR = '*';
const SEP = '\u0000';
const entryKey = (area: SyncedArea, key: string) => `${area}${SEP}${key}`;
function splitEntry(entry: string): { area: SyncedArea; key: string } | null {
  const at = entry.indexOf(SEP);
  const area = entry.slice(0, at) as SyncedArea;
  if (at < 1 || !(SYNCED_AREAS as readonly string[]).includes(area)) return null;
  return { area, key: entry.slice(at + 1) };
}

/** Where the pending list is saved: outside the store's `cloudprep:` keys, so resets keep it. */
export const PENDING_KEY = 'sync:pending';

const PENDING_AREA: AreaDefinition<readonly string[]> = {
  name: PENDING_KEY,
  currentVersion: 1,
  fallback: () => [],
  migrations: {},
  parse: (data) => {
    if (!Array.isArray(data)) return null;
    const value = data.filter(
      (entry): entry is string => typeof entry === 'string' && splitEntry(entry) !== null,
    );
    return { value, dropped: data.length - value.length };
  },
};

/** Builds the changes for the given pending entries from the current local data. */
export function buildChanges(data: StoredData, entries: Iterable<string>): SyncChanges {
  const byArea = new Map<SyncedArea, { clear: boolean; keys: Set<string> }>();
  for (const entry of entries) {
    const split = splitEntry(entry);
    if (!split) continue;
    const group = byArea.get(split.area) ?? { clear: false, keys: new Set<string>() };
    if (split.key === CLEAR) group.clear = true;
    else group.keys.add(split.key);
    byArea.set(split.area, group);
  }
  const changes: Record<string, AreaChanges<unknown>> = {};
  for (const [area, { clear, keys }] of byArea) {
    const items = (ITEMS[area] as (value: unknown) => Map<string, unknown>)(data[area]);
    // After a clear, every record still present is sent again.
    const sendKeys = clear ? new Set([...keys, ...items.keys()]) : keys;
    const upsert: unknown[] = [];
    const remove: string[] = [];
    for (const key of sendKeys) {
      const item = items.get(key);
      if (item !== undefined) upsert.push(item);
      else if (!clear) remove.push(key);
    }
    changes[area] = { clear, upsert, delete: remove };
  }
  return changes;
}

/** Pending entries for one local change. */
export function changedEntries(change: LocalChange): string[] {
  if (!(SYNCED_AREAS as readonly string[]).includes(change.area)) return [];
  const area = change.area as SyncedArea;
  const toItems = ITEMS[area] as (value: unknown) => Map<string, unknown>;
  const before = toItems(change.previous);
  const after = toItems(change.next);
  if (after.size === 0 && before.size > 0 && area !== 'activeExam') {
    return [entryKey(area, CLEAR)];
  }
  const entries: string[] = [];
  for (const [key, item] of after) {
    if (!sameItem(area, before.get(key), item)) entries.push(entryKey(area, key));
  }
  for (const key of before.keys()) if (!after.has(key)) entries.push(entryKey(area, key));
  return entries;
}

/** Validates server data with the same parsers as browser storage. */
export function parseRemote(remote: RemoteUserData): Partial<StoredData> {
  const result: { -readonly [K in keyof StoredData]?: StoredData[K] } = {};
  const progress = parseProgress(remote.progress);
  if (progress) result.progress = progress.value;
  const bookmarks = parseBookmarks(remote.bookmarks);
  if (bookmarks) result.bookmarks = bookmarks.value;
  const sessions = parseSessions(remote.sessions);
  if (sessions) {
    result.sessions = [...sessions.value].sort((a, b) => b.finishedAt - a.finishedAt);
  }
  const attempts = EXAM_ATTEMPTS_AREA.parse(remote.attempts);
  if (attempts) {
    result.attempts = [...attempts.value].sort((a, b) => b.submittedAt - a.submittedAt);
  }
  result.activeExam = remote.activeExam === null ? null : parseExamSession(remote.activeExam);
  const preferences = PREFERENCES_AREA.parse(remote.preferences ?? {});
  if (preferences) result.preferenceOverrides = preferences.value;
  return result;
}

export type SyncState =
  /** Everything is on the server. */
  | 'synced'
  /** Sending or downloading. */
  | 'syncing'
  /** The last attempt failed; it will be retried. */
  | 'retrying';

export interface SyncStatus {
  readonly state: SyncState;
  /** Records not on the server yet. */
  readonly pending: number;
  /** Whether account data has been downloaded since the engine started. */
  readonly loaded: boolean;
  readonly lastError: string | null;
}

export interface SyncEngine {
  getStatus(): SyncStatus;
  subscribe(listener: () => void): () => void;
  /** Sends pending changes now. Resolves true when nothing is left pending. */
  flush(): Promise<boolean>;
  /** Sends pending changes, then downloads the account's data if nothing is left pending. */
  pull(): Promise<boolean>;
  /** Stops listening and cancels timers. Pending changes stay saved for next time. */
  dispose(): void;
}

export interface SyncEngineOptions {
  store: AppStore;
  remote: UserDataRemote;
  /** The store's driver; the pending list is saved here. */
  driver: StorageDriver;
  /** Wait after a change before sending, so bursts go together. */
  debounceMs?: number;
  /** Waits between retries after failures (the last one repeats). */
  retryMs?: readonly number[];
}

export function createSyncEngine({
  store,
  remote,
  driver,
  debounceMs = 800,
  retryMs = [2_000, 5_000, 15_000, 30_000, 60_000],
}: SyncEngineOptions): SyncEngine {
  /** Pending entry → generation of its latest change, so entries changed mid-push stay. */
  const pending = new Map<string, number>(
    readKeyed(driver, PENDING_KEY, PENDING_AREA).map((entry) => [entry, 0]),
  );
  let generation = 0;
  let status: SyncStatus = {
    state: pending.size > 0 ? 'retrying' : 'synced',
    pending: pending.size,
    loaded: false,
    lastError: null,
  };
  const listeners = new Set<() => void>();
  let timer: ReturnType<typeof setTimeout> | null = null;
  let failures = 0;
  let pushing: Promise<boolean> | null = null;
  let disposed = false;

  function setStatus(patch: Partial<SyncStatus>) {
    status = { ...status, pending: pending.size, ...patch };
    for (const listener of listeners) listener();
  }

  function savePending() {
    // If saving fails, the list is still kept in memory and sent while the tab is open.
    if (pending.size > 0) writeKeyed(driver, PENDING_KEY, PENDING_AREA, [...pending.keys()]);
    else {
      try {
        driver.removeItem(PENDING_KEY);
      } catch {
        // Best effort.
      }
    }
  }

  function schedule(delay: number) {
    if (disposed) return;
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      void flush();
    }, delay);
  }

  const unsubscribe = store.onLocalChange((change) => {
    const entries = changedEntries(change);
    if (entries.length === 0) return;
    generation++;
    if (entries.some((entry) => entry.endsWith(SEP + CLEAR))) {
      // A clear replaces the area's pending records.
      const area = entries[0]?.split(SEP)[0] ?? '';
      for (const entry of [...pending.keys()]) {
        if (entry.startsWith(area + SEP)) pending.delete(entry);
      }
    }
    for (const entry of entries) pending.set(entry, generation);
    savePending();
    setStatus({});
    if (failures === 0) schedule(debounceMs);
  });

  async function pushOnce(): Promise<boolean> {
    if (pending.size === 0) {
      setStatus({ state: 'synced', lastError: null });
      return true;
    }
    const sent = new Map(pending);
    setStatus({ state: 'syncing' });
    try {
      await remote.push(buildChanges(store.getSnapshot().data, sent.keys()));
    } catch (error) {
      failures++;
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatus({ state: 'retrying', lastError: message });
      schedule(retryMs[Math.min(failures, retryMs.length) - 1] ?? 60_000);
      return false;
    }
    failures = 0;
    for (const [entry, gen] of sent) {
      if (pending.get(entry) === gen) pending.delete(entry);
    }
    savePending();
    setStatus({ state: pending.size > 0 ? 'syncing' : 'synced', lastError: null });
    return pending.size === 0;
  }

  async function flush(): Promise<boolean> {
    if (disposed) return pending.size === 0;
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    // One push at a time; changes made meanwhile go in the next one.
    while (pushing) await pushing;
    pushing = pushOnce();
    try {
      const done = await pushing;
      if (!done && failures === 0 && pending.size > 0) schedule(debounceMs);
      return done;
    } finally {
      pushing = null;
    }
  }

  async function pull(): Promise<boolean> {
    if (!(await flush())) return false;
    const before = generation;
    setStatus({ state: 'syncing' });
    let data: Partial<StoredData>;
    try {
      data = parseRemote(await remote.pull());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatus({ state: pending.size > 0 ? 'retrying' : 'synced', lastError: message });
      return false;
    }
    if (disposed) return false;
    // A change made while downloading wins; the next pull picks up the rest.
    if (generation !== before) {
      setStatus({ state: 'syncing' });
      schedule(debounceMs);
      return false;
    }
    store.applyRemote(data);
    setStatus({ state: 'synced', loaded: true, lastError: null });
    return true;
  }

  return {
    getStatus: () => status,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    flush,
    pull,
    dispose() {
      disposed = true;
      unsubscribe();
      if (timer !== null) clearTimeout(timer);
      timer = null;
      listeners.clear();
    },
  };
}
