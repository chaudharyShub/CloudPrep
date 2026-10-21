import { describe, expect, it } from 'vitest';
import { indexQuestions } from '@/domain/questions/query';
import { makeMultiQuestion, makeQuestion } from '@/test/fixtures/questions';
import { buildAttempt, snapshotKey, timeUsed } from './attempt';
import { shortExamConfig } from './config';
import { createExamSession, examReducer, type ExamAction } from './session';

const q1 = makeQuestion({ id: 'clf-d1-0001' }); // correct: a
const q2 = makeMultiQuestion({ id: 'clf-d2-0001' }); // correct: a + b
const q3 = makeQuestion({ id: 'clf-d1-0002' });
const q4 = makeQuestion({ id: 'clf-d4-0001', domain: 'D4', taskStatement: '4.1' });
const QUESTIONS = [q1, q2, q3, q4];
const START = 1_000;

function submittedSession(actions: ExamAction[], submitAt = START + 60_000) {
  const session = createExamSession({
    id: 'exam-1',
    config: shortExamConfig(4),
    bankVersion: 'v1',
    seed: 1,
    startedAt: START,
    questions: QUESTIONS,
    shuffleOptions: false,
  });
  return [...actions, { type: 'submit', at: submitAt, reason: 'manual' } as const].reduce(
    examReducer,
    session,
  );
}

const sel = (questionId: string, optionId: string): ExamAction => ({
  type: 'select',
  questionId,
  optionId,
  at: START + 1,
});

describe('buildAttempt', () => {
  it('stores an outcome per question; partly answered and unanswered never count as correct', () => {
    const session = submittedSession([
      sel('clf-d1-0001', 'a'), // correct
      sel('clf-d2-0001', 'a'), // partly answered → incorrect
      sel('clf-d1-0002', 'b'), // wrong
      // clf-d4-0001 unanswered
    ]);
    const attempt = buildAttempt(session, indexQuestions(QUESTIONS), 70);
    expect(attempt.questions.map((q) => q.outcome)).toEqual([
      'correct',
      'incorrect',
      'incorrect',
      'unanswered',
    ]);
    expect(attempt.summary).toMatchObject({
      total: 4,
      correct: 1,
      incorrect: 2,
      unanswered: 1,
      attempted: 3,
      percent: 25,
    });
    expect(attempt.benchmarkMet).toBe(false);
    expect(attempt.timeUsedMs).toBe(60_000);
  });

  it('saves the benchmark in effect, so later setting changes do not rewrite history', () => {
    const session = submittedSession([sel('clf-d1-0001', 'a'), sel('clf-d1-0002', 'a')]); // 2/4
    expect(buildAttempt(session, indexQuestions(QUESTIONS), 50)).toMatchObject({
      benchmarkPercent: 50,
      benchmarkMet: true,
    });
    expect(buildAttempt(session, indexQuestions(QUESTIONS), 55).benchmarkMet).toBe(false);
  });

  it('does not let flags affect scoring', () => {
    const flag: ExamAction = { type: 'toggleFlag', questionId: 'clf-d1-0001', at: START + 1 };
    const a = buildAttempt(
      submittedSession([sel('clf-d1-0001', 'a')]),
      indexQuestions(QUESTIONS),
      70,
    );
    const b = buildAttempt(
      submittedSession([sel('clf-d1-0001', 'a'), flag]),
      indexQuestions(QUESTIONS),
      70,
    );
    expect(a.summary).toEqual(b.summary);
    expect(b.questions[0]?.flagged).toBe(true);
  });

  it('skips questions missing from the bank and lists them', () => {
    const attempt = buildAttempt(submittedSession([]), indexQuestions([q1, q2, q3]), 70);
    expect(attempt.questions).toHaveLength(3);
    expect(attempt.unavailableQuestionIds).toEqual(['clf-d4-0001']);
    expect(attempt.summary.total).toBe(3);
  });

  it('refuses to build an attempt from an unsubmitted session', () => {
    const session = createExamSession({
      id: 'x',
      config: shortExamConfig(1),
      bankVersion: 'v1',
      seed: 1,
      startedAt: 0,
      questions: [q1],
      shuffleOptions: false,
    });
    expect(() => buildAttempt(session, indexQuestions(QUESTIONS), 70)).toThrow();
  });
});

describe('timeUsed and snapshotKey', () => {
  it('caps time used at the allowed duration and never goes negative', () => {
    expect(timeUsed(1000, 5000, 3000)).toBe(2000);
    expect(timeUsed(1000, 5000, 99_000)).toBe(4000);
    expect(timeUsed(1000, 5000, 500)).toBe(0);
  });

  it('keys archived questions by id and revision', () => {
    expect(snapshotKey('clf-d1-0001', 3)).toBe('clf-d1-0001@3');
  });
});
