import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFakeUserTables, type FakeUserTables } from '@/backend/fakeUserTables';
import { createUserDataRemote } from '@/backend/userDataRemote';
import { EXAM_ID } from '@/domain/exam-guide/clf-c02';
import type { PracticeSessionSummary } from '@/domain/practice/session';
import { EXAM_QUESTIONS } from '@/test/bank';
import { examQuestion, makeAttempt, makeExam } from '@/test/exam';
import { createMemoryDriver, type StorageDriver } from './driver';
import { createAppStore, type AppStore } from './store';
import { createSyncEngine, PENDING_KEY, type SyncEngine } from './sync';

const USER = '00000000-0000-4000-8000-0000000000a1';
const T0 = Date.UTC(2026, 9, 1, 9, 0, 0);

const session = (id: string, finishedAt: number): PracticeSessionSummary => ({
  id,
  label: 'Domain 1',
  startedAt: finishedAt - 60_000,
  finishedAt,
  total: 2,
  answered: 2,
  correct: 1,
  byDomain: { D1: { answered: 2, correct: 1 } },
  incorrectQuestionIds: ['q-2'],
});

interface Device {
  driver: StorageDriver;
  store: AppStore;
  sync: SyncEngine;
}

const engines: SyncEngine[] = [];
afterEach(() => {
  for (const engine of engines.splice(0)) engine.dispose();
  vi.useRealTimers();
});

/** One browser: its own storage and store, syncing with `tables` (the server). */
function device(tables: FakeUserTables, driver: StorageDriver = createMemoryDriver()): Device {
  const store = createAppStore({ driver, persistent: true, now: () => T0 });
  const sync = createSyncEngine({
    store,
    remote: createUserDataRemote(tables, USER, EXAM_ID),
    driver,
    debounceMs: 50,
    retryMs: [1_000],
  });
  engines.push(sync);
  return { driver, store, sync };
}

/** Everything sync covers (the question archive stays local). */
function synced(store: AppStore) {
  const { progress, bookmarks, sessions, attempts, activeExam, preferenceOverrides } =
    store.getSnapshot().data;
  return { progress, bookmarks, sessions, attempts, activeExam, preferenceOverrides };
}

describe('sync engine', () => {
  it('AC-B.18 saves every kind of user data to the account and restores it on another device', async () => {
    const tables = createFakeUserTables();
    const laptop = device(tables);
    const { store } = laptop;

    store.recordAnswer({ questionId: 'q-1', isCorrect: true, at: T0, sessionId: 's-1' });
    store.recordAnswer({ questionId: 'q-2', isCorrect: false, at: T0 + 1, sessionId: 's-1' });
    store.toggleBookmark('q-3', T0 + 2);
    store.addSessionSummary(session('s-1', T0 + 3));
    store.setPreferences({ theme: 'light', benchmarkPercent: 80 });
    // One finished exam (with an integrity log) and one in progress.
    const first = examQuestion(0);
    const done = makeExam({
      id: 'exam-1',
      startedAt: T0,
      actions: [
        { type: 'select', questionId: first.id, optionId: first.correctOptionIds[0] ?? '', at: T0 },
        { type: 'toggleFlag', questionId: examQuestion(1).id, at: T0 },
      ],
    });
    store.startExam(done);
    store.completeExam(makeAttempt(done), EXAM_QUESTIONS);
    store.startExam(
      makeExam({
        id: 'exam-2',
        startedAt: T0 + 10_000,
        actions: [{ type: 'goTo', index: 2 }],
      }),
    );

    expect(await laptop.sync.flush()).toBe(true);
    expect(laptop.sync.getStatus()).toMatchObject({ state: 'synced', pending: 0 });

    const phone = device(tables);
    expect(await phone.sync.pull()).toBe(true);
    expect(synced(phone.store)).toEqual(synced(store));
    expect(phone.sync.getStatus().loaded).toBe(true);
    // The attempt's questions are stored one row each, in exam order.
    expect(tables.rows('exam_attempt_questions')).toHaveLength(5);
  });

  it('AC-B.18 sends a burst of changes together after a short wait', async () => {
    vi.useFakeTimers();
    const tables = createFakeUserTables();
    const { store, sync } = device(tables);
    for (let i = 0; i < 5; i++) {
      store.recordAnswer({ questionId: `q-${i}`, isCorrect: true, at: T0 + i, sessionId: 's' });
    }
    expect(sync.getStatus().pending).toBe(5);
    expect(tables.rows('question_progress')).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(60);
    expect(tables.rows('question_progress')).toHaveLength(5);
    expect(tables.writes).toBe(1);
    expect(sync.getStatus()).toMatchObject({ state: 'synced', pending: 0 });
  });

  it('AC-B.19 keeps changes made offline, also across a reload, and sends them later', async () => {
    vi.useFakeTimers();
    const tables = createFakeUserTables();
    const driver = createMemoryDriver();
    const before = device(tables, driver);
    tables.failWith = 'Failed to fetch';

    before.store.toggleBookmark('q-1', T0);
    expect(await before.sync.flush()).toBe(false);
    expect(before.sync.getStatus()).toMatchObject({
      state: 'retrying',
      pending: 1,
      lastError: 'Failed to fetch',
    });
    expect(driver.getItem(PENDING_KEY)).not.toBeNull();

    // Reload: the pending list comes back from browser storage.
    before.sync.dispose();
    const after = device(tables, driver);
    expect(after.sync.getStatus().pending).toBe(1);

    // Still offline: retried after the back-off, then sent once the server is reachable.
    await vi.advanceTimersByTimeAsync(0);
    expect(await after.sync.flush()).toBe(false);
    tables.failWith = null;
    await vi.advanceTimersByTimeAsync(1_000);
    expect(tables.rows('bookmarks').map((row) => row['question_id'])).toEqual(['q-1']);
    expect(after.sync.getStatus()).toMatchObject({ state: 'synced', pending: 0, lastError: null });
    expect(driver.getItem(PENDING_KEY)).toBeNull();
  });

  it('AC-B.19 a download never overwrites changes that are not on the server yet', async () => {
    const tables = createFakeUserTables();
    const other = device(tables);
    other.store.toggleBookmark('from-other-device', T0);
    await other.sync.flush();

    const { store, sync } = device(tables);
    tables.failWith = 'offline';
    store.toggleBookmark('local-only', T0 + 1);
    expect(await sync.pull()).toBe(false);
    expect(Object.keys(store.getSnapshot().data.bookmarks)).toEqual(['local-only']);

    tables.failWith = null;
    expect(await sync.pull()).toBe(true);
    expect(Object.keys(store.getSnapshot().data.bookmarks).sort()).toEqual([
      'from-other-device',
      'local-only',
    ]);
  });

  it('AC-B.22 clearing and resetting delete the rows on the server', async () => {
    const tables = createFakeUserTables();
    const { store, sync } = device(tables);
    store.recordAnswer({ questionId: 'q-1', isCorrect: true, at: T0, sessionId: 's-1' });
    store.addSessionSummary(session('s-1', T0));
    store.toggleBookmark('q-1', T0);
    const exam = makeExam({ id: 'exam-1', startedAt: T0 });
    store.startExam(exam);
    store.completeExam(makeAttempt(exam), EXAM_QUESTIONS);
    store.setPreferences({ theme: 'light' });
    await sync.flush();

    store.clearLearningProgress();
    await sync.flush();
    expect(tables.rows('question_progress')).toEqual([]);
    expect(tables.rows('practice_sessions')).toEqual([]);
    expect(tables.rows('exam_attempts')).toHaveLength(1);

    store.resetAll();
    await sync.flush();
    for (const table of [
      'bookmarks',
      'exam_attempts',
      'exam_attempt_questions',
      'active_exams',
      'user_preferences',
    ] as const) {
      expect(tables.rows(table)).toEqual([]);
    }
  });

  it('AC-B.24 saves the exam in progress and removes it from the server once submitted', async () => {
    const tables = createFakeUserTables();
    const { store, sync } = device(tables);
    const exam = makeExam({ id: 'exam-1', startedAt: T0 });
    store.startExam(exam);
    store.dispatchExam({ type: 'toggleFlag', questionId: examQuestion(0).id, at: T0 });
    await sync.flush();
    const [row] = tables.rows('active_exams');
    expect(row?.['session']).toMatchObject({ id: 'exam-1', flagged: [examQuestion(0).id] });

    const active = store.getSnapshot().data.activeExam;
    if (!active) throw new Error('no active exam');
    store.completeExam(makeAttempt(active), EXAM_QUESTIONS);
    await sync.flush();
    expect(tables.rows('active_exams')).toEqual([]);
    expect(tables.rows('exam_attempts')).toHaveLength(1);
  });

  it('AC-B.23 leaves out invalid rows read from the server', async () => {
    const tables = createFakeUserTables();
    const writer = device(tables);
    writer.store.recordAnswer({ questionId: 'good', isCorrect: true, at: T0, sessionId: 's' });
    await writer.sync.flush();
    await tables.upsert(
      'question_progress',
      [
        {
          user_id: USER,
          exam_id: EXAM_ID,
          question_id: 'bad',
          attempts: 1,
          correct: 5, // more correct than attempts
          last_result: 'correct',
          first_answered_at: new Date(T0).toISOString(),
          last_answered_at: new Date(T0).toISOString(),
          last_incorrect_at: null,
          last_session_id: 's',
        },
      ],
      'user_id,question_id',
    );
    await tables.upsert(
      'active_exams',
      [{ user_id: USER, exam_id: EXAM_ID, session: { id: 'broken' } }],
      'user_id,exam_id',
    );

    const reader = device(tables);
    await reader.sync.pull();
    expect(Object.keys(reader.store.getSnapshot().data.progress)).toEqual(['good']);
    expect(reader.store.getSnapshot().data.activeExam).toBeNull();
  });

  it('keeps a change made while a send is under way for the next send', async () => {
    const tables = createFakeUserTables();
    const { store, sync } = device(tables);
    let release: () => void = () => undefined;
    const upsert = tables.upsert.bind(tables);
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    tables.upsert = async (...args) => {
      await gate;
      return upsert(...args);
    };

    store.toggleBookmark('q-1', T0);
    const first = sync.flush();
    store.toggleBookmark('q-2', T0 + 1);
    release();
    await first;
    expect(sync.getStatus().pending).toBe(1);
    expect(await sync.flush()).toBe(true);
    expect(
      tables
        .rows('bookmarks')
        .map((row) => row['question_id'])
        .sort(),
    ).toEqual(['q-1', 'q-2']);
  });
});
