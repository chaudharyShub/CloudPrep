import { describe, expect, it } from 'vitest';
import type { ExamAttempt } from '@/domain/exam/attempt';
import type { PracticeSessionSummary } from '@/domain/practice/session';
import { makeAttempt, makeExam } from '@/test/exam';
import { EXAM_ATTEMPTS_AREA, MAX_EXAM_ATTEMPTS } from './attemptsArea';
import { MAX_SESSION_SUMMARIES, SESSIONS_AREA } from './areas';
import { createMemoryDriver } from './driver';
import { parseExamSession } from './examAreas';
import { parsePreferenceOverrides } from './preferencesArea';
import { createAppStore } from './store';

/** A plain copy, as it would come back from JSON (storage, import file or server). */
const envelope = (schemaVersion: number, data: unknown) => ({
  app: 'cloudprep',
  schemaVersion,
  savedAt: '2026-10-01T00:00:00.000Z',
  data,
});

const json = (value: unknown): Record<string, unknown> =>
  JSON.parse(JSON.stringify(value)) as Record<string, unknown>;

function withoutExamId(value: object): Record<string, unknown> {
  const copy = json(value);
  Reflect.deleteProperty(copy, 'examId');
  return copy;
}

const summary = (id: string, examId?: string): Record<string, unknown> => ({
  id,
  ...(examId === undefined ? {} : { examId }),
  label: id,
  startedAt: 1,
  finishedAt: 2,
  total: 1,
  answered: 1,
  correct: 1,
  byDomain: { D1: { answered: 1, correct: 1 } },
  incorrectQuestionIds: [],
});

/** An SAA-C03 attempt whose questions use SAA-C03 task statements (4.4 is SAA-only). */
function saaAttempt(id: string): Record<string, unknown> {
  const attempt = json(makeAttempt(makeExam({ id, count: 2 })));
  const questions = (attempt['questions'] as Record<string, unknown>[]).map((q, i) => ({
    ...q,
    questionId: `saa-d4-000${String(i + 1)}`,
    domain: 'D4',
    taskStatement: '4.4',
  }));
  return { ...attempt, examId: 'saa-c03', questions };
}

describe('saved data and exams (D-066)', () => {
  it('AC-M.6 reads attempts, sessions and the active exam without an exam id as CLF-C02', () => {
    const attempt = makeAttempt(makeExam({ id: 'a1' }));
    const parsed = EXAM_ATTEMPTS_AREA.parse([withoutExamId(attempt)]);
    expect(parsed?.value.map((a) => a.examId)).toEqual(['clf-c02']);
    expect(parsed?.dropped).toBe(0);

    const sessions = SESSIONS_AREA.parse([summary('s1')]);
    expect(sessions?.value.map((s) => s.examId)).toEqual(['clf-c02']);

    expect(parseExamSession(withoutExamId(makeExam()))?.examId).toBe('clf-c02');
  });

  it('AC-M.6 keeps items of other exams and drops items of unknown exams', () => {
    const attempts = EXAM_ATTEMPTS_AREA.parse([
      saaAttempt('a1'),
      { ...saaAttempt('a2'), examId: 'nope' },
    ]);
    expect(attempts?.value.map((a) => [a.id, a.examId])).toEqual([['a1', 'saa-c03']]);
    expect(attempts?.dropped).toBe(1);

    const sessions = SESSIONS_AREA.parse([summary('s1', 'dva-c03'), summary('s2', 'dva-c02')]);
    expect(sessions?.value.map((s) => s.examId)).toEqual(['dva-c03']);

    expect(parseExamSession({ ...json(makeExam()), examId: 'saa-c03' })?.examId).toBe('saa-c03');
    expect(parseExamSession({ ...json(makeExam()), examId: 'nope' })).toBeNull();
  });

  it('AC-M.6 checks attempt topics against the attempt’s own exam guide', () => {
    // Task 4.4 exists in SAA-C03 only.
    const asClf = { ...saaAttempt('a1'), examId: 'clf-c02' };
    expect(EXAM_ATTEMPTS_AREA.parse([asClf])?.value).toEqual([]);
    expect(EXAM_ATTEMPTS_AREA.parse([saaAttempt('a1')])?.value).toHaveLength(1);
  });

  it('AC-M.6 limits history per exam, so one exam never pushes out another', () => {
    const clf = Array.from({ length: MAX_EXAM_ATTEMPTS + 1 }, (_, i) =>
      json(makeAttempt(makeExam({ id: `c${String(i)}`, count: 1 }))),
    );
    const parsed = EXAM_ATTEMPTS_AREA.parse([...clf, saaAttempt('s1')]);
    const byExam = (examId: string) => parsed?.value.filter((a) => a.examId === examId).length;
    expect(byExam('clf-c02')).toBe(MAX_EXAM_ATTEMPTS);
    expect(byExam('saa-c03')).toBe(1);

    const summaries = [
      ...Array.from({ length: MAX_SESSION_SUMMARIES + 2 }, (_, i) => summary(`c${String(i)}`)),
      summary('d1', 'dva-c03'),
    ];
    const sessions = SESSIONS_AREA.parse(summaries)?.value ?? [];
    expect(sessions.filter((s) => s.examId === 'clf-c02')).toHaveLength(MAX_SESSION_SUMMARIES);
    expect(sessions.filter((s) => s.examId === 'dva-c03')).toHaveLength(1);
  });

  it('AC-M.3 saves the exam used last as a setting; an unknown exam is dropped', () => {
    expect(parsePreferenceOverrides({ exam: 'saa-c03' })).toEqual({
      value: { exam: 'saa-c03' },
      dropped: 0,
    });
    expect(parsePreferenceOverrides({ exam: 'sap-c02' })).toEqual({ value: {}, dropped: 1 });
  });

  it('AC-M.6 keeps old browser data readable after the update', () => {
    // A store written before D-066: attempts and sessions without an exam id.
    const attempt = withoutExamId(makeAttempt(makeExam({ id: 'old' })));
    const driver = createMemoryDriver({
      'cloudprep:examAttempts': JSON.stringify(envelope(2, [attempt])),
      'cloudprep:practiceSessions': JSON.stringify(envelope(1, [summary('s1')])),
    });
    const { data, notices } = createAppStore({ driver, persistent: true }).getSnapshot();
    expect(data.attempts.map((a: ExamAttempt) => [a.id, a.examId])).toEqual([['old', 'clf-c02']]);
    expect(data.sessions.map((s: PracticeSessionSummary) => s.examId)).toEqual(['clf-c02']);
    expect(notices).toEqual([]);
  });
});
