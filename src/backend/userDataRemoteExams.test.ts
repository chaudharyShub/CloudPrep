import { describe, expect, it } from 'vitest';
import type { ExamAttempt } from '@/domain/exam/attempt';
import type { ExamSession } from '@/domain/exam/session';
import type { QuestionProgress } from '@/domain/practice/progress';
import type { PracticeSessionSummary } from '@/domain/practice/session';
import { EXAM_ATTEMPTS_AREA } from '@/storage/attemptsArea';
import { parseSessions } from '@/storage/areas';
import { parseExamSession } from '@/storage/examAreas';
import { makeAttempt, makeExam } from '@/test/exam';
import { createFakeUserTables } from './fakeUserTables';
import { createUserDataRemote } from './userDataRemote';

const USER = '00000000-0000-4000-8000-0000000000b1';
const T0 = Date.UTC(2026, 10, 5, 9, 0, 0);

const entry: QuestionProgress = {
  attempts: 1,
  correct: 1,
  lastResult: 'correct',
  firstAnsweredAt: T0,
  lastAnsweredAt: T0,
  lastIncorrectAt: null,
  lastSessionId: 's-1',
  reviewLevel: 1,
};

const summary = (id: string, examId: string): PracticeSessionSummary => ({
  id,
  examId,
  label: id,
  startedAt: T0,
  finishedAt: T0 + 1000,
  total: 1,
  answered: 1,
  correct: 1,
  byDomain: { D1: { answered: 1, correct: 1 } },
  incorrectQuestionIds: [],
});

const asExam = <T extends ExamSession | ExamAttempt>(value: T, examId: string): T => ({
  ...value,
  examId,
});

describe('sync with several exams (D-066)', () => {
  it('AC-M.8 writes each item with its own exam and reads every exam back', async () => {
    const tables = createFakeUserTables();
    const remote = createUserDataRemote(tables, USER);
    const clfAttempt = makeAttempt(makeExam({ id: 'a-clf', count: 1 }));
    // An attempt tagged SAA-C03 (its questions keep CLF-C02 topics, which is fine for rows).
    const saaAttempt = asExam(makeAttempt(makeExam({ id: 'a-saa', count: 1 })), 'saa-c03');

    await remote.push({
      progress: {
        clear: false,
        delete: [],
        upsert: [
          { questionId: 'clf-d1-0001', entry },
          { questionId: 'saa-d1-0001', entry },
        ],
      },
      bookmarks: {
        clear: false,
        delete: [],
        upsert: [{ questionId: 'dva-d2-0001', addedAt: T0 }],
      },
      sessions: {
        clear: false,
        delete: [],
        upsert: [summary('s-clf', 'clf-c02'), summary('s-dva', 'dva-c03')],
      },
      attempts: { clear: false, delete: [], upsert: [clfAttempt, saaAttempt] },
    });

    const examOf = (table: Parameters<typeof tables.rows>[0], key: string, value: string) =>
      tables.rows(table).find((row) => row[key] === value)?.['exam_id'];
    expect(examOf('question_progress', 'question_id', 'clf-d1-0001')).toBe('clf-c02');
    expect(examOf('question_progress', 'question_id', 'saa-d1-0001')).toBe('saa-c03');
    expect(examOf('bookmarks', 'question_id', 'dva-d2-0001')).toBe('dva-c03');
    expect(examOf('practice_sessions', 'id', 's-dva')).toBe('dva-c03');
    expect(examOf('exam_attempts', 'id', 'a-saa')).toBe('saa-c03');
    expect(examOf('exam_attempts', 'id', 'a-clf')).toBe('clf-c02');

    const pulled = await remote.pull();
    expect(Object.keys(pulled.progress as object).sort()).toEqual(['clf-d1-0001', 'saa-d1-0001']);
    expect(Object.keys(pulled.bookmarks as object)).toEqual(['dva-d2-0001']);
    const sessions = parseSessions(pulled.sessions)?.value ?? [];
    expect(sessions.map((s) => [s.id, s.examId]).sort()).toEqual([
      ['s-clf', 'clf-c02'],
      ['s-dva', 'dva-c03'],
    ]);
    const attempts = EXAM_ATTEMPTS_AREA.parse(pulled.attempts)?.value ?? [];
    expect(attempts.map((a) => [a.id, a.examId]).sort()).toEqual([
      ['a-clf', 'clf-c02'],
      ['a-saa', 'saa-c03'],
    ]);
  });

  it('AC-M.6 AC-M.8 reads server rows saved before D-066 with their row’s exam', async () => {
    // An active exam saved by the old app: the session JSON has no examId.
    const oldSession: Record<string, unknown> = { ...makeExam({ id: 'old' }) };
    Reflect.deleteProperty(oldSession, 'examId');
    const tables = createFakeUserTables({
      active_exams: {
        x: { user_id: USER, exam_id: 'clf-c02', session: oldSession },
      },
    });
    const pulled = await createUserDataRemote(tables, USER).pull();
    expect(parseExamSession(pulled.activeExam)?.examId).toBe('clf-c02');
  });

  it('AC-M.7 AC-M.8 keeps one active exam on the server when another exam starts', async () => {
    const tables = createFakeUserTables();
    const remote = createUserDataRemote(tables, USER);
    const clf = makeExam({ id: 'e-clf', startedAt: T0 });
    await remote.push({ activeExam: { clear: false, delete: [], upsert: [clf] } });
    expect(tables.rows('active_exams').map((row) => row['exam_id'])).toEqual(['clf-c02']);

    // The CLF-C02 exam was finished; an SAA-C03 exam replaced it in the same change.
    const saa = asExam(makeExam({ id: 'e-saa', startedAt: T0 + 1000 }), 'saa-c03');
    await remote.push({ activeExam: { clear: false, delete: ['one'], upsert: [saa] } });
    expect(tables.rows('active_exams').map((row) => row['exam_id'])).toEqual(['saa-c03']);
    expect(parseExamSession((await remote.pull()).activeExam)?.id).toBe('e-saa');

    await remote.push({ activeExam: { clear: true, delete: [], upsert: [] } });
    expect(tables.rows('active_exams')).toEqual([]);
  });

  it('AC-M.8 picks the newest active exam if the server holds more than one', async () => {
    const older = makeExam({ id: 'older', startedAt: T0 });
    const newer = asExam(makeExam({ id: 'newer', startedAt: T0 + 5000 }), 'dva-c03');
    const tables = createFakeUserTables({
      active_exams: {
        a: { user_id: USER, exam_id: 'clf-c02', session: older },
        b: { user_id: USER, exam_id: 'dva-c03', session: newer },
      },
    });
    const pulled = await createUserDataRemote(tables, USER).pull();
    expect(parseExamSession(pulled.activeExam)?.id).toBe('newer');
  });
});
