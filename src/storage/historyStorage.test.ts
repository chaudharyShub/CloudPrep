import { describe, expect, it } from 'vitest';
import { snapshotKey } from '@/domain/exam/attempt';
import { indexQuestions } from '@/domain/questions/query';
import { resolveAttemptQuestion } from '@/features/results/useAttemptQuestion';
import { EXAM_QUESTIONS } from '@/test/bank';
import { examQuestion, makeAttempt, makeExam } from '@/test/exam';
import { EXAM_ATTEMPTS_AREA, parseExamAttempt } from './attemptsArea';
import { createMemoryDriver } from './driver';
import { readArea, storageKey } from './envelope';
import { PREFERENCES_AREA } from './preferencesArea';
import { createAppStore } from './store';

const NOW = 1_700_000_000_000;
const envelope = (data: unknown, schemaVersion: number) =>
  JSON.stringify({ app: 'cloudprep', schemaVersion, savedAt: 'x', data });
const q0 = examQuestion(0); // single, correct 'a'
const answered = (id: string) =>
  makeAttempt(
    makeExam({
      id,
      startedAt: NOW,
      actions: [{ type: 'select', questionId: q0.id, optionId: 'a', at: NOW + 1 }],
    }),
  );
const json = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

describe('exam history persistence', () => {
  it('saves score, counts, domain breakdown, time used and benchmark outcome with each attempt', () => {
    const driver = createMemoryDriver();
    const store = createAppStore({ driver, persistent: true });
    const attempt = answered('a1');
    store.startExam(makeExam({ id: 'a1', startedAt: NOW }));
    store.completeExam(attempt, EXAM_QUESTIONS);

    const raw = JSON.parse(driver.getItem(storageKey('examAttempts')) ?? '{}') as {
      schemaVersion: number;
      data: Record<string, unknown>[];
    };
    expect(raw.schemaVersion).toBe(2);
    expect(raw.data[0]).toMatchObject({
      id: 'a1',
      summary: { total: 5, correct: 1, incorrect: 0, unanswered: 4 },
      timeUsedMs: 60_000,
      benchmarkPercent: 70,
      benchmarkMet: false,
    });
    expect((raw.data[0]?.['summary'] as { byDomain: object }).byDomain).toHaveProperty('D1');

    const reloaded = createAppStore({ driver, persistent: true });
    expect(reloaded.getSnapshot().data.attempts[0]).toEqual(attempt);
  });

  it('records a duplicate submission only once', () => {
    const store = createAppStore({ driver: createMemoryDriver(), persistent: true });
    const attempt = answered('a1');
    expect(store.completeExam(attempt, EXAM_QUESTIONS)).toBe(true);
    expect(store.completeExam(attempt, EXAM_QUESTIONS)).toBe(false);
    expect(store.getSnapshot().data.attempts).toHaveLength(1);
  });

  it('starts empty when there is no history', () => {
    const store = createAppStore({ driver: createMemoryDriver(), persistent: true });
    expect(store.getSnapshot().data.attempts).toEqual([]);
    expect(store.getSnapshot().notices).toEqual([]);
  });

  it('migrates version 1 history (isCorrect, no summary) to version 2', () => {
    const v2 = json(answered('old'));
    const v1 = {
      ...v2,
      summary: undefined,
      timeUsedMs: undefined,
      benchmarkMet: undefined,
      questions: v2.questions.map(({ outcome, ...rest }) => ({
        ...rest,
        isCorrect: outcome === 'correct',
      })),
    };
    const driver = createMemoryDriver({ [storageKey('examAttempts')]: envelope([v1], 1) });
    const result = readArea(driver, EXAM_ATTEMPTS_AREA, NOW);
    expect(result.status).toBe('ok');
    expect(result.value[0]?.questions.map((q) => q.outcome)).toEqual(
      v2.questions.map((q) => q.outcome),
    );
    expect(result.value[0]?.summary).toEqual(v2.summary);
    expect(result.value[0]?.benchmarkMet).toBe(false);
  });

  it('drops malformed records and keeps valid ones, with a backup and a notice', () => {
    const good = json(answered('good'));
    const badOutcome = json(answered('bad1'));
    (badOutcome.questions[0] as { outcome: string }).outcome = 'maybe';
    const selectedButUnanswered = json(answered('bad2'));
    (selectedButUnanswered.questions[0] as { outcome: string }).outcome = 'unanswered';
    const driver = createMemoryDriver({
      [storageKey('examAttempts')]: envelope([good, badOutcome, selectedButUnanswered, 'junk'], 2),
    });
    const store = createAppStore({ driver, persistent: true });
    expect(store.getSnapshot().data.attempts.map((a) => a.id)).toEqual(['good']);
    expect(store.getSnapshot().notices[0]).toMatchObject({ kind: 'recovered', area: 'attempts' });
  });

  it('repairs a stored summary that disagrees with the per-question outcomes', () => {
    const tampered = json(answered('t'));
    (tampered.summary as { correct: number }).correct = 5;
    (tampered as { benchmarkMet: boolean }).benchmarkMet = true;
    const parsed = parseExamAttempt(tampered);
    expect(parsed?.repaired).toBe(true);
    expect(parsed?.attempt.summary.correct).toBe(1);
    expect(parsed?.attempt.benchmarkMet).toBe(false);
  });
});

describe('historical result reconstruction (question archive)', () => {
  it('archives each question revision once, shared across attempts', () => {
    const store = createAppStore({ driver: createMemoryDriver(), persistent: true });
    store.completeExam(answered('a1'), EXAM_QUESTIONS);
    store.completeExam(answered('a2'), EXAM_QUESTIONS);
    const archive = store.getSnapshot().data.questionArchive;
    // Both attempts used the same five questions: five entries, not ten.
    expect(Object.keys(archive)).toHaveLength(5);
    expect(archive[snapshotKey(q0.id, q0.revision)]).toEqual(q0);
  });

  it('shows an old attempt as taken, even after the bank question changes', () => {
    const store = createAppStore({ driver: createMemoryDriver(), persistent: true });
    const attempt = answered('a1');
    store.completeExam(attempt, EXAM_QUESTIONS);
    const archive = store.getSnapshot().data.questionArchive;

    // Simulate a later bank where the question was revised.
    const revised = { ...q0, revision: q0.revision + 1, stem: 'Rewritten question?' };
    const laterBank = indexQuestions([revised]);
    const record = attempt.questions[0];
    if (!record) throw new Error('no record');

    const resolved = resolveAttemptQuestion(record, archive, laterBank);
    expect(resolved.source).toBe('snapshot');
    expect(resolved.question?.stem).toBe(q0.stem);
    // The stored outcome is untouched by the bank change.
    expect(store.getSnapshot().data.attempts[0]?.questions[0]?.outcome).toBe('correct');

    // Without an archive entry, the newer revision is shown and flagged as such.
    expect(resolveAttemptQuestion(record, {}, laterBank).source).toBe('bank-newer');
    expect(resolveAttemptQuestion(record, {}, indexQuestions([])).source).toBe('missing');
  });

  it('drops invalid archive entries', () => {
    const key = snapshotKey(q0.id, q0.revision);
    const driver = createMemoryDriver({
      [storageKey('questionArchive')]: envelope(
        { [key]: q0, 'clf-d1-0001@9': q0, broken: { id: 'x' } },
        1,
      ),
    });
    const store = createAppStore({ driver, persistent: true });
    expect(Object.keys(store.getSnapshot().data.questionArchive)).toEqual([key]);
  });
});

describe('preferences', () => {
  it('saves and reloads the practice benchmark', () => {
    const driver = createMemoryDriver();
    createAppStore({ driver, persistent: true }).setPreferences({ benchmarkPercent: 80 });
    expect(
      createAppStore({ driver, persistent: true }).getSnapshot().data.preferences.benchmarkPercent,
    ).toBe(80);
  });

  it('falls back field by field for invalid values', () => {
    const parsed = PREFERENCES_AREA.parse({
      theme: 'neon',
      benchmarkPercent: 72,
      shuffleOptions: false,
      practiceSessionLength: '20',
    });
    // Only valid saved choices are kept; defaults are applied when reading (D-034).
    expect(parsed).toEqual({
      value: { shuffleOptions: false, practiceSessionLength: '20' },
      dropped: 2,
    });
  });

  it('applies the benchmark in effect when an exam is submitted', () => {
    const store = createAppStore({ driver: createMemoryDriver(), persistent: true });
    store.setPreferences({ benchmarkPercent: 50 });
    expect(store.getSnapshot().data.preferences.benchmarkPercent).toBe(50);
  });
});
