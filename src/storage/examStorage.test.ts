import { describe, expect, it } from 'vitest';
import { examReducer } from '@/domain/exam/session';
import { examQuestion, makeAttempt, makeExam } from '@/test/exam';
import { EXAM_QUESTIONS } from '@/test/bank';
import { createMemoryDriver } from './driver';
import { BACKUP_PREFIX, readArea, storageKey, writeArea } from './envelope';
import { EXAM_ATTEMPTS_AREA } from './attemptsArea';
import { ACTIVE_EXAM_AREA, parseExamSession } from './examAreas';
import { createAppStore } from './store';

const NOW = 1_700_000_000_000;
const q0 = examQuestion(0).id;

function stored(session: unknown) {
  return JSON.stringify({ app: 'cloudprep', schemaVersion: 1, savedAt: 'x', data: session });
}

describe('active exam storage', () => {
  it('round-trips a valid session exactly', () => {
    const session = makeExam({
      startedAt: NOW,
      actions: [
        { type: 'select', questionId: q0, optionId: 'a', at: NOW + 1 },
        { type: 'toggleFlag', questionId: q0, at: NOW + 1 },
        { type: 'goTo', index: 3 },
      ],
    });
    const driver = createMemoryDriver();
    writeArea(driver, ACTIVE_EXAM_AREA, session, NOW);
    expect(readArea(driver, ACTIVE_EXAM_AREA, NOW)).toEqual({ status: 'ok', value: session });
  });

  it('stores "no exam" as null', () => {
    const driver = createMemoryDriver();
    writeArea(driver, ACTIVE_EXAM_AREA, null, NOW);
    expect(readArea(driver, ACTIVE_EXAM_AREA, NOW)).toEqual({ status: 'ok', value: null });
  });

  it('restores a session saved mid-confirmation as in progress', () => {
    const confirming = examReducer(makeExam({ startedAt: NOW }), { type: 'requestFinish' });
    expect(parseExamSession(JSON.parse(JSON.stringify(confirming)))?.status).toBe('in_progress');
  });

  const valid = () =>
    JSON.parse(JSON.stringify(makeExam({ startedAt: NOW }))) as Record<string, unknown>;
  it.each<[string, (s: Record<string, unknown>) => void]>([
    ['an answer to a question not in the exam', (s) => (s['answers'] = { other: ['a'] })],
    ['an unknown option', (s) => (s['answers'] = { [q0]: ['zzz'] })],
    ['more selections than required', (s) => (s['answers'] = { [q0]: ['a', 'b'] })],
    ['duplicate selections', (s) => (s['answers'] = { [q0]: ['a', 'a'] })],
    ['a flag on an unknown question', (s) => (s['flagged'] = ['other'])],
    ['an out-of-range current question', (s) => (s['currentIndex'] = 99)],
    [
      'an end time that disagrees with the duration',
      (s) => (s['endsAt'] = (s['endsAt'] as number) + 1),
    ],
    ['an unknown status', (s) => (s['status'] = 'paused')],
    ['a submission time on an unsubmitted exam', (s) => (s['submittedAt'] = NOW)],
    ['duplicate question ids', (s) => (s['questionIds'] = [q0, q0])],
    ['a missing option order', (s) => (s['optionOrder'] = {})],
  ])('rejects %s, backing up the data and telling the user', (_label, corrupt) => {
    const session = valid();
    corrupt(session);
    const driver = createMemoryDriver({ [storageKey('activeExam')]: stored(session) });
    const store = createAppStore({ driver, persistent: true, now: () => NOW });
    expect(store.getSnapshot().data.activeExam).toBeNull();
    expect(store.getSnapshot().notices).toEqual([
      expect.objectContaining({ kind: 'recovered', area: 'activeExam' }),
    ]);
    expect(driver.keys().some((key) => key.startsWith(`${BACKUP_PREFIX}activeExam:`))).toBe(true);
  });

  it('drops invalid attempts from history but keeps valid ones', () => {
    const good = makeAttempt(makeExam({ startedAt: NOW, id: 'good' }));
    const bad = { ...makeAttempt(makeExam({ startedAt: NOW, id: 'bad' })), benchmarkPercent: 500 };
    const parsed = EXAM_ATTEMPTS_AREA.parse(JSON.parse(JSON.stringify([good, bad, good])));
    expect(parsed?.value.map((a: { id: string }) => a.id)).toEqual(['good']);
    expect(parsed?.dropped).toBe(2);
  });
});

describe('store exam operations', () => {
  it('starts an exam, saves every change immediately, and restores it after a reload', () => {
    const driver = createMemoryDriver();
    const store = createAppStore({ driver, persistent: true, now: () => NOW });
    expect(store.startExam(makeExam({ startedAt: NOW }))).toBe(true);
    store.dispatchExam({ type: 'select', questionId: q0, optionId: 'b', at: NOW + 1 });
    store.dispatchExam({ type: 'goTo', index: 2 });

    const reloaded = createAppStore({ driver, persistent: true, now: () => NOW });
    expect(reloaded.getSnapshot().data.activeExam).toMatchObject({
      answers: { [q0]: ['b'] },
      currentIndex: 2,
      status: 'in_progress',
    });
  });

  it('refuses to start a second exam while one is in progress', () => {
    const store = createAppStore({ driver: createMemoryDriver(), persistent: true });
    expect(store.startExam(makeExam({ id: 'one' }))).toBe(true);
    expect(store.startExam(makeExam({ id: 'two' }))).toBe(false);
    expect(store.getSnapshot().data.activeExam?.id).toBe('one');
  });

  it('records a completed exam once, updates practice progress for answered questions, and clears the active exam', () => {
    const driver = createMemoryDriver();
    const store = createAppStore({ driver, persistent: true });
    const session = makeExam({
      startedAt: NOW,
      actions: [{ type: 'select', questionId: q0, optionId: 'a', at: NOW + 1 }],
    });
    store.startExam(session);
    const attempt = makeAttempt(session);

    expect(store.completeExam(attempt, EXAM_QUESTIONS)).toBe(true);
    expect(store.completeExam(attempt, EXAM_QUESTIONS)).toBe(false); // duplicate submission ignored
    const data = store.getSnapshot().data;
    expect(data.attempts.map((a) => a.id)).toEqual([attempt.id]);
    expect(data.activeExam).toBeNull();
    expect(Object.keys(data.progress)).toEqual([q0]); // unanswered questions aren't recorded
    expect(data.progress[q0]?.attempts).toBe(1);

    const reloaded = createAppStore({ driver, persistent: true });
    expect(reloaded.getSnapshot().data.attempts).toHaveLength(1);
    expect(reloaded.getSnapshot().data.activeExam).toBeNull();
  });

  it('clears a leftover active exam whose attempt was already recorded', () => {
    const store = createAppStore({ driver: createMemoryDriver(), persistent: true });
    const session = makeExam();
    store.startExam(session);
    const attempt = makeAttempt(session);
    store.completeExam(attempt, EXAM_QUESTIONS);
    store.startExam(session); // simulate the leftover after an interrupted save
    expect(store.completeExam(attempt, EXAM_QUESTIONS)).toBe(false);
    expect(store.getSnapshot().data.activeExam).toBeNull();
  });

  it('ignores exam actions when there is no exam, and discards on request', () => {
    const store = createAppStore({ driver: createMemoryDriver(), persistent: true });
    expect(store.dispatchExam({ type: 'goTo', index: 1 })).toBeNull();
    store.startExam(makeExam());
    store.abandonExam();
    expect(store.getSnapshot().data.activeExam).toBeNull();
    expect(store.getSnapshot().data.attempts).toEqual([]);
  });
});
