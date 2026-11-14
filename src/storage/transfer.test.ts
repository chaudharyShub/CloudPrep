import { describe, expect, it } from 'vitest';
import { recordAnswer } from '@/domain/practice/progress';
import { EXAM_QUESTIONS } from '@/test/bank';
import { examQuestion, makeAttempt, makeExam } from '@/test/exam';
import { createMemoryDriver } from './driver';
import { decodeArea } from './envelope';
import { PREFERENCES_AREA } from './preferencesArea';
import { createAppStore } from './store';
import {
  buildExport,
  describeImportError,
  mergeData,
  parseImport,
  replaceData,
  type TransferData,
} from './transfer';

const NOW = 1_700_000_000_000;
const q0 = examQuestion(0);

function attemptFor(id: string, at = NOW) {
  return makeAttempt(
    makeExam({
      id,
      startedAt: at,
      actions: [{ type: 'select', questionId: q0.id, optionId: 'a', at: at + 1 }],
    }),
  );
}

function sampleData(): TransferData {
  const attempt = attemptFor('a1');
  let progress = recordAnswer({}, { questionId: q0.id, isCorrect: false, at: 5, sessionId: 's1' });
  progress = recordAnswer(progress, { questionId: q0.id, isCorrect: true, at: 6, sessionId: 's2' });
  const store = createAppStore({ driver: createMemoryDriver(), persistent: true });
  store.completeExam(attempt, EXAM_QUESTIONS);
  return {
    preferences: { benchmarkPercent: 80 },
    progress,
    bookmarks: { [q0.id]: { addedAt: 7 } },
    sessions: [],
    attempts: [attempt],
    questionArchive: store.getSnapshot().data.questionArchive,
  };
}

const text = (value: unknown) => JSON.stringify(value);

describe('export and import round trip', () => {
  it('exports every area with its schema version and imports it back unchanged', () => {
    const data = sampleData();
    const bundle = buildExport(data, NOW);
    expect(bundle).toMatchObject({ app: 'cloudprep', kind: 'export', format: 1 });
    expect(Object.keys(bundle.areas).sort()).toEqual(
      [
        'examAttempts',
        'bookmarks',
        'practiceSessions',
        'preferences',
        'progress',
        'questionArchive',
      ].sort(),
    );
    const result = parseImport(text(bundle));
    if (!result.ok) throw new Error(describeImportError(result.error));
    expect(result.data).toEqual(data);
    expect(result.preview).toMatchObject({
      attempts: 1,
      progressQuestions: 1,
      bookmarks: 1,
      settings: 1,
      skippedEntries: 0,
      missingAreas: [],
    });
  });

  it('never includes the exam in progress', () => {
    const store = createAppStore({ driver: createMemoryDriver(), persistent: true });
    store.startExam(makeExam());
    expect(JSON.stringify(store.exportData())).not.toContain('activeExam');
  });
});

describe('import validation', () => {
  const valid = () => buildExport(sampleData(), NOW);

  it.each<[string, string, string]>([
    ['malformed JSON', '{oops', 'not-json'],
    ['another app', text({ app: 'other', kind: 'export', format: 1, areas: {} }), 'not-cloudprep'],
    ['a missing kind', text({ app: 'cloudprep', format: 1, areas: {} }), 'not-cloudprep'],
    [
      'a non-numeric format',
      text({ app: 'cloudprep', kind: 'export', format: '1', areas: {} }),
      'not-cloudprep',
    ],
    [
      'a newer format',
      text({ app: 'cloudprep', kind: 'export', format: 99, areas: {} }),
      'newer-format',
    ],
    ['no areas', text({ app: 'cloudprep', kind: 'export', format: 1, areas: {} }), 'empty'],
    ['an oversized file', ' '.repeat(5 * 1024 * 1024 + 1), 'too-large'],
  ])('rejects %s', (_label, input, code) => {
    const result = parseImport(input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe(code);
  });

  it('rejects an area written by a newer version', () => {
    const bundle = valid();
    bundle.areas['progress'] = { schemaVersion: 99, data: {} };
    const result = parseImport(text(bundle));
    expect(result.ok ? null : result.error).toEqual({ code: 'newer-area', area: 'progress' });
  });

  it('rejects the whole file if an included area is unusable, so imports never half-apply', () => {
    const bundle = valid();
    bundle.areas['examAttempts'] = { schemaVersion: 2, data: 'not a list' };
    const result = parseImport(text(bundle));
    expect(result.ok ? null : result.error).toEqual({ code: 'invalid-area', area: 'attempts' });
    expect(describeImportError({ code: 'invalid-area', area: 'attempts' })).toMatch(
      /nothing was imported/,
    );
  });

  it('skips invalid entries inside an area and counts them in the preview', () => {
    const bundle = valid();
    bundle.areas['bookmarks'] = {
      schemaVersion: 1,
      data: { good: { addedAt: 1 }, bad: { addedAt: 'x' } },
    };
    const result = parseImport(text(bundle));
    if (!result.ok) throw new Error('expected ok');
    expect(result.data.bookmarks).toEqual({ good: { addedAt: 1 } });
    expect(result.preview.skippedEntries).toBe(1);
  });

  it('ignores prototype-polluting keys from untrusted files', () => {
    const raw = `{"app":"cloudprep","kind":"export","format":1,"areas":{"bookmarks":{"schemaVersion":1,"data":{"__proto__":{"addedAt":1},"constructor":{"addedAt":1},"ok":{"addedAt":2}}}}}`;
    const result = parseImport(raw);
    if (!result.ok) throw new Error('expected ok');
    expect(Object.keys(result.data.bookmarks ?? {})).toEqual(['ok']);
    expect(({} as Record<string, unknown>)['addedAt']).toBeUndefined();
  });

  it('migrates older areas inside an import file', () => {
    const bundle = valid();
    bundle.areas['preferences'] = {
      schemaVersion: 1,
      data: {
        theme: 'light',
        benchmarkPercent: 70,
        shuffleOptions: true,
        practiceSessionLength: '10',
      },
    };
    const result = parseImport(text(bundle));
    if (!result.ok) throw new Error('expected ok');
    // v1 stored the full object; only the non-default choice survives as an override.
    expect(result.data.preferences).toEqual({ theme: 'light' });
  });

  it('lists areas the file does not contain', () => {
    const bundle = valid();
    delete bundle.areas['bookmarks'];
    const result = parseImport(text(bundle));
    expect(result.ok && result.preview.missingAreas).toEqual(['bookmarks']);
  });
});

describe('merge and replace', () => {
  it('merges by union, keeps current settings, and is idempotent', () => {
    const current = sampleData();
    const incoming: Partial<TransferData> = {
      preferences: { benchmarkPercent: 50 },
      attempts: [attemptFor('a2', NOW + 10_000), ...current.attempts],
      bookmarks: { [q0.id]: { addedAt: 1 }, other: { addedAt: 3 } },
    };
    const once = mergeData(current, incoming);
    expect(once.attempts.map((a) => a.id)).toEqual(['a2', 'a1']);
    expect(once.preferences).toEqual({ benchmarkPercent: 80 });
    expect(once.bookmarks).toEqual({ [q0.id]: { addedAt: 1 }, other: { addedAt: 3 } });
    expect(mergeData(once, incoming)).toEqual(once);
  });

  it('keeps the progress record with more answers instead of adding counts together', () => {
    const current = sampleData(); // q0: 2 attempts
    const fewer = recordAnswer({}, { questionId: q0.id, isCorrect: true, at: 99, sessionId: 'x' });
    expect(mergeData(current, { progress: fewer }).progress[q0.id]?.attempts).toBe(2);
    let more = fewer;
    for (const s of ['y', 'z'])
      more = recordAnswer(more, { questionId: q0.id, isCorrect: false, at: 100, sessionId: s });
    expect(mergeData(current, { progress: more }).progress[q0.id]?.attempts).toBe(3);
  });

  it('replaces only the areas present in the file and prunes unused saved questions', () => {
    const current = sampleData();
    const replaced = replaceData(current, { attempts: [], bookmarks: {} });
    expect(replaced.attempts).toEqual([]);
    expect(replaced.bookmarks).toEqual({});
    expect(replaced.progress).toEqual(current.progress); // not in the file: unchanged
    expect(replaced.questionArchive).toEqual({});
  });
});

describe('store import, backups and clear actions', () => {
  it('backs up current data before importing, and the backup can be restored', () => {
    const driver = createMemoryDriver();
    const store = createAppStore({ driver, persistent: true, now: () => NOW });
    store.toggleBookmark('keep-me', 1);
    const backupKey = store.createBackup();
    expect(backupKey).toMatch(/^cloudprep:backup:snapshot:/);
    store.importData({ bookmarks: {} }, 'replace');
    expect(store.getSnapshot().data.bookmarks).toEqual({});

    const backup = store.readBackup(backupKey ?? '');
    const restored = parseImport(backup ?? '');
    if (!restored.ok) throw new Error('backup should be importable');
    store.importData(restored.data, 'replace');
    expect(store.getSnapshot().data.bookmarks).toEqual({ 'keep-me': { addedAt: 1 } });
    expect(store.listBackups()[0]).toMatchObject({ source: 'snapshot', createdAt: NOW });
  });

  it('reports a failed backup instead of pretending it worked', () => {
    const driver = createMemoryDriver();
    const store = createAppStore({ driver, persistent: true });
    driver.setItem = () => {
      throw new DOMException('full', 'QuotaExceededError');
    };
    expect(store.createBackup()).toBeNull();
  });

  it('refuses to read or delete keys outside the backup namespace', () => {
    const driver = createMemoryDriver({ 'cloudprep:progress': 'x' });
    const store = createAppStore({ driver, persistent: true });
    expect(store.readBackup('cloudprep:progress')).toBeNull();
    store.deleteBackup('cloudprep:progress');
    expect(driver.getItem('cloudprep:progress')).toBe('x');
  });

  it('clears each kind of data separately', () => {
    const store = createAppStore({ driver: createMemoryDriver(), persistent: true });
    store.recordAnswer({ questionId: q0.id, isCorrect: false, at: 1, sessionId: 's' });
    store.toggleBookmark(q0.id, 1);
    store.completeExam(attemptFor('a1'), EXAM_QUESTIONS);
    store.setPreferences({ benchmarkPercent: 80 });

    store.clearExamHistory();
    let data = store.getSnapshot().data;
    expect(data.attempts).toEqual([]);
    expect(data.questionArchive).toEqual({});
    expect(Object.keys(data.progress)).toEqual([q0.id]); // learning progress kept

    store.clearLearningProgress();
    data = store.getSnapshot().data;
    expect(data.progress).toEqual({});
    expect(data.bookmarks).toHaveProperty(q0.id); // bookmarks kept
    expect(data.preferences.benchmarkPercent).toBe(80); // settings kept
  });

  it('reset all removes every CloudPrep key, including backups, but nothing else', () => {
    const driver = createMemoryDriver({ 'someone-else': 'keep' });
    const store = createAppStore({ driver, persistent: true });
    store.toggleBookmark('x', 1);
    store.createBackup();
    store.resetAll();
    expect(driver.keys()).toEqual(['someone-else']);
    expect(store.getSnapshot().data.bookmarks).toEqual({});
  });
});

describe('settings storage', () => {
  it('saves only explicit choices and merges defaults when reading', () => {
    const driver = createMemoryDriver();
    const store = createAppStore({ driver, persistent: true });
    store.setPreferences({ theme: 'system', examTimeWarnings: false });
    const saved = JSON.parse(driver.getItem('cloudprep:preferences') ?? '{}') as { data: unknown };
    expect(saved.data).toEqual({ theme: 'system', examTimeWarnings: false });
    const reloaded = createAppStore({ driver, persistent: true }).getSnapshot().data.preferences;
    expect(reloaded).toMatchObject({
      theme: 'system',
      examTimeWarnings: false,
      benchmarkPercent: 70,
    });
  });

  it('restores defaults by clearing saved choices', () => {
    const store = createAppStore({ driver: createMemoryDriver(), persistent: true });
    store.setPreferences({ benchmarkPercent: 90 });
    store.resetPreferences();
    expect(store.getSnapshot().data.preferenceOverrides).toEqual({});
    expect(store.getSnapshot().data.preferences.benchmarkPercent).toBe(70);
  });

  it('migrates v1 settings (full object) to v2 overrides', () => {
    const v1 = {
      theme: 'dark',
      benchmarkPercent: 80,
      shuffleOptions: true,
      practiceSessionLength: '10',
    };
    expect(decodeArea(PREFERENCES_AREA, 1, v1)).toEqual({
      status: 'ok',
      value: { benchmarkPercent: 80 },
      dropped: 0,
    });
  });

  it('handles unexpected types and unknown fields without losing valid ones', () => {
    expect(
      decodeArea(PREFERENCES_AREA, 2, { theme: 42, reducedMotion: 'reduce', extra: true }),
    ).toEqual({
      status: 'ok',
      value: { reducedMotion: 'reduce' },
      dropped: 2,
    });
    expect(decodeArea(PREFERENCES_AREA, 2, 'nope').status).toBe('invalid');
    expect(decodeArea(PREFERENCES_AREA, 3, {}).status).toBe('newer');
    expect(decodeArea(PREFERENCES_AREA, 'x', {}).status).toBe('invalid');
  });
});
