import { DEFAULT_PREFERENCES } from '@/storage/preferencesArea';
import { describe, expect, it } from 'vitest';
import { recordAnswer } from '@/domain/practice/progress';
import type { PracticeSessionSummary } from '@/domain/practice/session';
import { BOOKMARKS_AREA, MAX_SESSION_SUMMARIES, PROGRESS_AREA, SESSIONS_AREA } from './areas';
import { createMemoryDriver, type StorageDriver } from './driver';
import {
  BACKUP_PREFIX,
  readArea,
  storageKey,
  writeArea,
  type AreaDefinition,
  type Parsed,
} from './envelope';
import { createAppStore } from './store';

const NOW = 1_700_000_000_000;
const envelope = (data: unknown, schemaVersion = 1) =>
  JSON.stringify({ app: 'cloudprep', schemaVersion, savedAt: '2026-10-21T00:00:00Z', data });

const validProgress = recordAnswer(
  {},
  { questionId: 'clf-d1-0001', isCorrect: false, at: 100, sessionId: 's1' },
);

function backups(driver: StorageDriver, name: string) {
  return driver.keys().filter((key) => key.startsWith(`${BACKUP_PREFIX}${name}:`));
}

describe('readArea', () => {
  it('returns the fallback when nothing is stored', () => {
    expect(readArea(createMemoryDriver(), PROGRESS_AREA, NOW)).toEqual({
      status: 'missing',
      value: {},
    });
  });

  it('round-trips a written value', () => {
    const driver = createMemoryDriver();
    expect(writeArea(driver, PROGRESS_AREA, validProgress, NOW)).toEqual({ ok: true });
    expect(readArea(driver, PROGRESS_AREA, NOW)).toEqual({ status: 'ok', value: validProgress });
  });

  it.each([
    ['malformed JSON', '{not json'],
    ['a non-object', '42'],
    ["another app's data", JSON.stringify({ app: 'other', schemaVersion: 1, data: {} })],
    ['a missing schema version', JSON.stringify({ app: 'cloudprep', data: {} })],
    ['a negative schema version', envelope({}, -1)],
    ['data of the wrong shape', envelope(['not', 'a', 'map'])],
  ])('recovers from %s by backing up the raw value and using defaults', (_label, raw) => {
    const driver = createMemoryDriver({ [storageKey('progress')]: raw });
    const result = readArea(driver, PROGRESS_AREA, NOW);
    expect(result).toMatchObject({ status: 'recovered', value: {} });
    const [backupKey] = backups(driver, 'progress');
    expect(backupKey).toBeDefined();
    expect(driver.getItem(backupKey ?? '')).toBe(raw);
  });

  it('keeps valid entries and drops invalid ones, with a backup of the original', () => {
    const raw = envelope({
      ...validProgress,
      'clf-d1-0002': { attempts: -1 },
      'clf-d1-0003': { ...validProgress['clf-d1-0001'], correct: 5 }, // correct > attempts
      'clf-d1-0004': { ...validProgress['clf-d1-0001'], lastResult: 'maybe' },
    });
    const driver = createMemoryDriver({ [storageKey('progress')]: raw });
    const result = readArea(driver, PROGRESS_AREA, NOW);
    expect(result.status).toBe('recovered');
    expect(Object.keys(result.value)).toEqual(['clf-d1-0001']);
    expect(backups(driver, 'progress')).toHaveLength(1);
  });

  it('reads but flags data from a newer schema version', () => {
    const driver = createMemoryDriver({ [storageKey('progress')]: envelope(validProgress, 2) });
    expect(readArea(driver, PROGRESS_AREA, NOW)).toEqual({
      status: 'newer-version',
      value: validProgress,
      schemaVersion: 2,
    });
  });

  it('runs migrations step by step from older versions', () => {
    const area: AreaDefinition<{ count: number }> = {
      name: 'demo',
      currentVersion: 2,
      fallback: () => ({ count: 0 }),
      migrations: {
        0: (data) => ({ total: (data as { n: number }).n }),
        1: (data) => ({ count: (data as { total: number }).total }),
      },
      parse: (data): Parsed<{ count: number }> | null =>
        typeof (data as { count?: unknown }).count === 'number'
          ? { value: { count: (data as { count: number }).count }, dropped: 0 }
          : null,
    };
    const driver = createMemoryDriver({ [storageKey('demo')]: envelope({ n: 7 }, 0) });
    expect(readArea(driver, area, NOW)).toEqual({ status: 'ok', value: { count: 7 } });
  });

  it('recovers when a migration step is missing', () => {
    const area = { ...PROGRESS_AREA, currentVersion: 3 };
    const driver = createMemoryDriver({ [storageKey('progress')]: envelope({}, 1) });
    expect(readArea(driver, area, NOW).status).toBe('recovered');
  });

  it('keeps only the newest three backups per area', () => {
    const driver = createMemoryDriver();
    for (let i = 0; i < 5; i++) {
      driver.setItem(storageKey('progress'), `broken ${i}`);
      readArea(driver, PROGRESS_AREA, NOW + i);
    }
    expect(backups(driver, 'progress').sort()).toEqual([
      `${BACKUP_PREFIX}progress:${NOW + 2}`,
      `${BACKUP_PREFIX}progress:${NOW + 3}`,
      `${BACKUP_PREFIX}progress:${NOW + 4}`,
    ]);
  });

  it('treats a throwing driver as missing data', () => {
    const driver: StorageDriver = {
      ...createMemoryDriver(),
      getItem: () => {
        throw new Error('denied');
      },
    };
    expect(readArea(driver, PROGRESS_AREA, NOW).status).toBe('missing');
  });
});

describe('area parsers', () => {
  it('drops malformed bookmarks', () => {
    const parsed = BOOKMARKS_AREA.parse({ a: { addedAt: 1 }, b: { addedAt: 'x' }, c: null });
    expect(parsed).toEqual({ value: { a: { addedAt: 1 } }, dropped: 2 });
  });

  it('drops malformed and duplicate session summaries and caps the list', () => {
    const summary = (id: string): PracticeSessionSummary => ({
      id,
      label: 'x',
      startedAt: 1,
      finishedAt: 2,
      total: 2,
      answered: 1,
      correct: 1,
      byDomain: { D1: { answered: 1, correct: 1 } },
      incorrectQuestionIds: [],
    });
    const parsed = SESSIONS_AREA.parse([
      summary('a'),
      summary('a'),
      { ...summary('b'), correct: 5 },
      { ...summary('c'), byDomain: { D9: { answered: 1, correct: 0 } } },
      summary('d'),
    ]);
    expect(parsed?.value.map((s) => s.id)).toEqual(['a', 'd']);
    expect(parsed?.dropped).toBe(3);

    const many = Array.from({ length: MAX_SESSION_SUMMARIES + 5 }, (_, i) => summary(`s${i}`));
    expect(SESSIONS_AREA.parse(many)?.value).toHaveLength(MAX_SESSION_SUMMARIES);
  });
});

describe('createAppStore', () => {
  const record = (questionId: string, isCorrect: boolean, sessionId = 's1') => ({
    questionId,
    isCorrect,
    at: NOW,
    sessionId,
  });

  it('persists answers and reloads them in a new store', () => {
    const driver = createMemoryDriver();
    const store = createAppStore({ driver, persistent: true, now: () => NOW });
    store.recordAnswer(record('q1', true));
    const reloaded = createAppStore({ driver, persistent: true, now: () => NOW });
    expect(reloaded.getSnapshot().data.progress['q1']?.attempts).toBe(1);
  });

  it('does not double-count the same question in the same session', () => {
    const store = createAppStore({ driver: createMemoryDriver(), persistent: true });
    store.recordAnswer(record('q1', true));
    const snapshot = store.getSnapshot();
    store.recordAnswer(record('q1', true));
    expect(store.getSnapshot()).toBe(snapshot);
    expect(store.getSnapshot().data.progress['q1']?.attempts).toBe(1);
  });

  it('toggles bookmarks and persists them', () => {
    const driver = createMemoryDriver();
    const store = createAppStore({ driver, persistent: true });
    expect(store.toggleBookmark('q1', 5)).toBe(true);
    expect(createAppStore({ driver, persistent: true }).getSnapshot().data.bookmarks).toEqual({
      q1: { addedAt: 5 },
    });
    expect(store.toggleBookmark('q1', 6)).toBe(false);
    expect(createAppStore({ driver, persistent: true }).getSnapshot().data.bookmarks).toEqual({});
  });

  it('adds each session summary once, newest first', () => {
    const store = createAppStore({ driver: createMemoryDriver(), persistent: true });
    const summary = (id: string): PracticeSessionSummary => ({
      id,
      label: id,
      startedAt: 1,
      finishedAt: 2,
      total: 1,
      answered: 1,
      correct: 1,
      byDomain: {},
      incorrectQuestionIds: [],
    });
    store.addSessionSummary(summary('a'));
    store.addSessionSummary(summary('b'));
    store.addSessionSummary(summary('a'));
    expect(store.getSnapshot().data.sessions.map((s) => s.id)).toEqual(['b', 'a']);
  });

  it('notifies subscribers and stops after unsubscribe', () => {
    const store = createAppStore({ driver: createMemoryDriver(), persistent: true });
    let calls = 0;
    const unsubscribe = store.subscribe(() => {
      calls++;
    });
    store.toggleBookmark('q1', 1);
    unsubscribe();
    store.toggleBookmark('q2', 1);
    expect(calls).toBe(1);
  });

  it('shows a notice and keeps working in memory when storage is unavailable', () => {
    const store = createAppStore({ driver: createMemoryDriver(), persistent: false });
    expect(store.persistent).toBe(false);
    expect(store.getSnapshot().notices.map((n) => n.kind)).toEqual(['unavailable']);
    store.recordAnswer(record('q1', true));
    expect(store.getSnapshot().data.progress['q1']).toBeDefined();
  });

  it('reports recovered data on load and lets the notice be dismissed', () => {
    const driver = createMemoryDriver({ [storageKey('bookmarks')]: 'garbage' });
    const store = createAppStore({ driver, persistent: true });
    const [notice] = store.getSnapshot().notices;
    expect(notice).toMatchObject({ kind: 'recovered', area: 'bookmarks' });
    store.dismissNotice(notice?.id ?? '');
    expect(store.getSnapshot().notices).toEqual([]);
  });

  it('never overwrites data written by a newer schema version', () => {
    const raw = envelope({ q9: { addedAt: 1 } }, 99);
    const driver = createMemoryDriver({ [storageKey('bookmarks')]: raw });
    const store = createAppStore({ driver, persistent: true });
    expect(store.getSnapshot().notices[0]).toMatchObject({
      kind: 'newer-version',
      area: 'bookmarks',
    });
    store.toggleBookmark('q1', 2);
    expect(store.getSnapshot().data.bookmarks).toHaveProperty('q1'); // works in memory
    expect(driver.getItem(storageKey('bookmarks'))).toBe(raw); // storage untouched
  });

  it('keeps the previous stored value and warns when a write fails (quota)', () => {
    const driver = createMemoryDriver();
    const store = createAppStore({ driver, persistent: true });
    store.toggleBookmark('q1', 1);
    const before = driver.getItem(storageKey('bookmarks'));
    driver.setItem = () => {
      throw new DOMException('full', 'QuotaExceededError');
    };
    store.toggleBookmark('q2', 2);
    expect(driver.getItem(storageKey('bookmarks'))).toBe(before);
    expect(store.getSnapshot().data.bookmarks).toHaveProperty('q2');
    expect(store.getSnapshot().notices[0]).toMatchObject({ kind: 'write-failed', reason: 'quota' });
  });

  it('reloads an area changed by another tab', () => {
    const driver = createMemoryDriver();
    const store = createAppStore({ driver, persistent: true });
    const otherTab = createAppStore({ driver, persistent: true });
    otherTab.toggleBookmark('q1', 1);
    expect(store.getSnapshot().data.bookmarks).toEqual({});
    store.handleExternalChange(storageKey('bookmarks'));
    expect(store.getSnapshot().data.bookmarks).toEqual({ q1: { addedAt: 1 } });
    // Unrelated keys don't trigger an update.
    const snapshot = store.getSnapshot();
    store.handleExternalChange('someone-else:key');
    expect(store.getSnapshot()).toBe(snapshot);
  });

  it('resets all areas in memory and in storage', () => {
    const driver = createMemoryDriver();
    const store = createAppStore({ driver, persistent: true });
    store.recordAnswer(record('q1', false));
    store.toggleBookmark('q1', 1);
    store.resetAll();
    expect(store.getSnapshot().data).toEqual({
      progress: {},
      bookmarks: {},
      sessions: [],
      activeExam: null,
      attempts: [],
      questionArchive: {},
      preferenceOverrides: {},
      preferences: DEFAULT_PREFERENCES,
    });
    expect(driver.getItem(storageKey('progress'))).toBeNull();
    expect(driver.getItem(storageKey('bookmarks'))).toBeNull();
  });
});
