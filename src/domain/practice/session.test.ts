import { describe, expect, it } from 'vitest';
import { indexQuestions } from '@/domain/questions/query';
import { makeMultiQuestion, makeQuestion } from '@/test/fixtures/questions';
import {
  canCheck,
  createPracticeSession,
  practiceReducer,
  summarizeSession,
  type PracticeAction,
  type PracticeSession,
} from './session';

const single = makeQuestion({ id: 'clf-d1-0001' });
const multi = makeMultiQuestion({ id: 'clf-d2-0001' });
const QUESTIONS = [single, multi];

function newSession(overrides: Partial<Parameters<typeof createPracticeSession>[0]> = {}) {
  return createPracticeSession({
    id: 's1',
    label: 'Test',
    seed: 123,
    startedAt: 1000,
    questions: QUESTIONS,
    limit: null,
    shuffleQuestions: false,
    shuffleOptions: false,
    ...overrides,
  });
}

function run(session: PracticeSession, ...actions: PracticeAction[]) {
  return actions.reduce(practiceReducer, session);
}

describe('createPracticeSession', () => {
  it('keeps order without shuffling and applies the limit', () => {
    expect(newSession().questionIds).toEqual(['clf-d1-0001', 'clf-d2-0001']);
    expect(newSession({ limit: 1 }).questionIds).toEqual(['clf-d1-0001']);
  });

  it('shuffles questions and options deterministically for a seed', () => {
    const a = newSession({ shuffleQuestions: true, shuffleOptions: true, seed: 5 });
    const b = newSession({ shuffleQuestions: true, shuffleOptions: true, seed: 5 });
    expect(a.questionIds).toEqual(b.questionIds);
    expect(a.optionOrder).toEqual(b.optionOrder);
    expect([...(a.optionOrder['clf-d2-0001'] ?? [])].sort()).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('finishes immediately when there are no questions', () => {
    const empty = newSession({ questions: [] });
    expect(empty.status).toBe('finished');
    expect(empty.questionIds).toEqual([]);
  });
});

describe('practiceReducer', () => {
  it('replaces the selection for single-answer questions', () => {
    const s = run(
      newSession(),
      { type: 'select', question: single, optionId: 'b' },
      { type: 'select', question: single, optionId: 'a' },
    );
    expect(s.answers['clf-d1-0001']?.selected).toEqual(['a']);
  });

  it('toggles options for multiple response and caps at the required count', () => {
    let s = run(
      newSession(),
      { type: 'select', question: multi, optionId: 'a' },
      { type: 'select', question: multi, optionId: 'c' },
      { type: 'select', question: multi, optionId: 'd' }, // ignored: already 2 selected
    );
    expect(s.answers['clf-d2-0001']?.selected).toEqual(['a', 'c']);
    s = run(s, { type: 'select', question: multi, optionId: 'c' }); // deselect
    expect(s.answers['clf-d2-0001']?.selected).toEqual(['a']);
  });

  it('only allows checking once the required number is selected', () => {
    let s = run(newSession(), { type: 'select', question: multi, optionId: 'a' });
    expect(canCheck(s, multi)).toBe(false);
    expect(run(s, { type: 'check', question: multi })).toBe(s);
    s = run(s, { type: 'select', question: multi, optionId: 'b' });
    expect(canCheck(s, multi)).toBe(true);
  });

  it('records the result and locks the question after checking', () => {
    const checked = run(
      newSession(),
      { type: 'select', question: multi, optionId: 'a' },
      { type: 'select', question: multi, optionId: 'b' },
      { type: 'check', question: multi },
    );
    expect(checked.answers['clf-d2-0001']).toEqual({ selected: ['a', 'b'], result: 'correct' });
    expect(canCheck(checked, multi)).toBe(false);
    // Further changes and a second check are ignored.
    expect(run(checked, { type: 'select', question: multi, optionId: 'a' })).toBe(checked);
    expect(run(checked, { type: 'check', question: multi })).toBe(checked);
  });

  it('marks a wrong multiple-response answer incorrect', () => {
    const s = run(
      newSession(),
      { type: 'select', question: multi, optionId: 'a' },
      { type: 'select', question: multi, optionId: 'c' },
      { type: 'check', question: multi },
    );
    expect(s.answers['clf-d2-0001']?.result).toBe('incorrect');
  });

  it('ignores questions and options that are not part of the session', () => {
    const outsider = makeQuestion({ id: 'clf-d3-0001' });
    const s = newSession();
    expect(run(s, { type: 'select', question: outsider, optionId: 'a' })).toBe(s);
    expect(run(s, { type: 'select', question: single, optionId: 'zzz' })).toBe(s);
  });

  it('navigates within bounds only', () => {
    const s = newSession();
    expect(run(s, { type: 'goTo', index: 1 }).currentIndex).toBe(1);
    expect(run(s, { type: 'goTo', index: 2 })).toBe(s);
    expect(run(s, { type: 'goTo', index: -1 })).toBe(s);
    expect(run(s, { type: 'goTo', index: 0.5 })).toBe(s);
  });

  it('ignores every action after finishing', () => {
    const finished = run(newSession(), { type: 'finish', at: 2000 });
    expect(finished.status).toBe('finished');
    expect(finished.finishedAt).toBe(2000);
    expect(run(finished, { type: 'select', question: single, optionId: 'a' })).toBe(finished);
    expect(run(finished, { type: 'finish', at: 3000 })).toBe(finished);
  });
});

describe('summarizeSession', () => {
  it('counts checked answers by domain and lists incorrect ones', () => {
    const s = run(
      newSession(),
      { type: 'select', question: single, optionId: 'b' },
      { type: 'check', question: single },
      { type: 'select', question: multi, optionId: 'a' },
      { type: 'select', question: multi, optionId: 'b' },
      { type: 'check', question: multi },
      { type: 'finish', at: 5000 },
    );
    const summary = summarizeSession(s, indexQuestions(QUESTIONS), 9999);
    expect(summary).toMatchObject({
      id: 's1',
      total: 2,
      answered: 2,
      correct: 1,
      finishedAt: 5000,
      incorrectQuestionIds: ['clf-d1-0001'],
      byDomain: { D1: { answered: 1, correct: 0 }, D2: { answered: 1, correct: 1 } },
    });
  });

  it('skips unanswered questions and questions missing from the bank', () => {
    const s = run(
      newSession(),
      { type: 'select', question: single, optionId: 'a' },
      { type: 'check', question: single },
    );
    const summary = summarizeSession(s, indexQuestions([multi]), 9999);
    expect(summary.answered).toBe(0);
    expect(summary.total).toBe(2);
  });
});
