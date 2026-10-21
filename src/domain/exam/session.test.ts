import { describe, expect, it } from 'vitest';
import { makeMultiQuestion, makeQuestion } from '@/test/fixtures/questions';
import { FULL_EXAM, shortExamConfig } from './config';
import {
  answerState,
  createExamSession,
  examCounts,
  examReducer,
  type ExamAction,
  type ExamSession,
} from './session';

const single = makeQuestion({ id: 'clf-d1-0001' });
const multi = makeMultiQuestion({ id: 'clf-d2-0001' });
const third = makeQuestion({ id: 'clf-d3-0001', domain: 'D3', taskStatement: '3.1' });
const START = 1_000_000;

function newSession(overrides: Partial<Parameters<typeof createExamSession>[0]> = {}) {
  return createExamSession({
    id: 'exam-1',
    config: shortExamConfig(3),
    bankVersion: 'v1',
    seed: 99,
    startedAt: START,
    questions: [single, multi, third],
    shuffleOptions: false,
    ...overrides,
  });
}

const run = (s: ExamSession, ...actions: ExamAction[]) => actions.reduce(examReducer, s);
const AT = START + 1000;

describe('createExamSession', () => {
  it('sets absolute start and end times from the configured duration', () => {
    const session = createExamSession({
      id: 'x',
      config: FULL_EXAM,
      bankVersion: 'v1',
      seed: 1,
      startedAt: START,
      questions: [single],
      shuffleOptions: false,
    });
    expect(session.endsAt - session.startedAt).toBe(90 * 60_000);
    expect(session.durationMs).toBe(90 * 60_000);
    expect(session.status).toBe('in_progress');
    expect(session.submittedAt).toBeNull();
  });

  it('stores order, option order and required selection counts, but no correct answers', () => {
    const session = newSession();
    expect(session.questionIds).toEqual(['clf-d1-0001', 'clf-d2-0001', 'clf-d3-0001']);
    expect(session.requiredSelections).toEqual({
      'clf-d1-0001': 1,
      'clf-d2-0001': 2,
      'clf-d3-0001': 1,
    });
    expect(session.answers).toEqual({});
    expect(JSON.stringify(session)).not.toContain('correctOptionIds');
    expect(JSON.stringify(session)).not.toContain('explanation');
  });

  it('shuffles options deterministically when asked', () => {
    const a = newSession({ shuffleOptions: true });
    const b = newSession({ shuffleOptions: true });
    expect(a.optionOrder).toEqual(b.optionOrder);
    expect([...(a.optionOrder['clf-d2-0001'] ?? [])].sort()).toEqual(['a', 'b', 'c', 'd', 'e']);
  });
});

describe('examReducer: answers', () => {
  it('replaces the selection for single-answer questions', () => {
    const s = run(
      newSession(),
      { type: 'select', questionId: 'clf-d1-0001', optionId: 'b', at: AT },
      { type: 'select', questionId: 'clf-d1-0001', optionId: 'c', at: AT },
    );
    expect(s.answers['clf-d1-0001']).toEqual(['c']);
  });

  it('toggles multiple-response options and caps at the required count', () => {
    let s = run(
      newSession(),
      { type: 'select', questionId: 'clf-d2-0001', optionId: 'a', at: AT },
      { type: 'select', questionId: 'clf-d2-0001', optionId: 'c', at: AT },
    );
    expect(answerState(s, 'clf-d2-0001')).toBe('answered');
    const capped = run(s, { type: 'select', questionId: 'clf-d2-0001', optionId: 'd', at: AT });
    expect(capped).toBe(s);
    s = run(s, { type: 'select', questionId: 'clf-d2-0001', optionId: 'a', at: AT });
    expect(s.answers['clf-d2-0001']).toEqual(['c']);
    expect(answerState(s, 'clf-d2-0001')).toBe('incomplete');
  });

  it('ignores unknown questions and options', () => {
    const s = newSession();
    expect(run(s, { type: 'select', questionId: 'nope', optionId: 'a', at: AT })).toBe(s);
    expect(run(s, { type: 'select', questionId: 'clf-d1-0001', optionId: 'z', at: AT })).toBe(s);
  });

  it('refuses edits at or after the end time', () => {
    const s = newSession();
    expect(run(s, { type: 'select', questionId: 'clf-d1-0001', optionId: 'a', at: s.endsAt })).toBe(
      s,
    );
    expect(run(s, { type: 'toggleFlag', questionId: 'clf-d1-0001', at: s.endsAt + 1 })).toBe(s);
  });
});

describe('examReducer: flags and navigation', () => {
  it('flags and unflags without affecting answers', () => {
    let s = run(newSession(), { type: 'toggleFlag', questionId: 'clf-d3-0001', at: AT });
    expect(s.flagged).toEqual(['clf-d3-0001']);
    expect(s.answers).toEqual({});
    s = run(s, { type: 'toggleFlag', questionId: 'clf-d3-0001', at: AT });
    expect(s.flagged).toEqual([]);
  });

  it('moves between questions within bounds', () => {
    const s = newSession();
    expect(run(s, { type: 'goTo', index: 2 }).currentIndex).toBe(2);
    expect(run(s, { type: 'goTo', index: 3 })).toBe(s);
    expect(run(s, { type: 'goTo', index: -1 })).toBe(s);
  });

  it('counts answered, partly answered, unanswered and flagged questions', () => {
    const s = run(
      newSession(),
      { type: 'select', questionId: 'clf-d1-0001', optionId: 'a', at: AT },
      { type: 'select', questionId: 'clf-d2-0001', optionId: 'a', at: AT },
      { type: 'toggleFlag', questionId: 'clf-d1-0001', at: AT },
    );
    expect(examCounts(s)).toEqual({
      total: 3,
      answered: 1,
      incomplete: 1,
      unanswered: 1,
      flagged: 1,
    });
  });
});

describe('examReducer: lifecycle', () => {
  it('goes in_progress → confirming → in_progress when the learner returns', () => {
    let s = run(newSession(), { type: 'requestFinish' });
    expect(s.status).toBe('confirming');
    // Answers can't change while the confirmation is open.
    expect(run(s, { type: 'select', questionId: 'clf-d1-0001', optionId: 'a', at: AT })).toBe(s);
    s = run(s, { type: 'cancelFinish' });
    expect(s.status).toBe('in_progress');
  });

  it('ignores cancelFinish when not confirming and requestFinish when already confirming', () => {
    const s = newSession();
    expect(run(s, { type: 'cancelFinish' })).toBe(s);
    const confirming = run(s, { type: 'requestFinish' });
    expect(run(confirming, { type: 'requestFinish' })).toBe(confirming);
  });

  it('submits from in_progress or confirming and records when and why', () => {
    const direct = run(newSession(), { type: 'submit', at: AT, reason: 'time_expired' });
    expect(direct).toMatchObject({
      status: 'submitted',
      submittedAt: AT,
      submitReason: 'time_expired',
    });
    const confirmed = run(
      newSession(),
      { type: 'requestFinish' },
      { type: 'submit', at: AT, reason: 'manual' },
    );
    expect(confirmed.status).toBe('submitted');
  });

  it('is terminal after submission: no second submission and no answer changes', () => {
    const submitted = run(newSession(), { type: 'submit', at: AT, reason: 'manual' });
    expect(run(submitted, { type: 'submit', at: AT + 5, reason: 'time_expired' })).toBe(submitted);
    expect(
      run(submitted, { type: 'select', questionId: 'clf-d1-0001', optionId: 'a', at: AT }),
    ).toBe(submitted);
    expect(run(submitted, { type: 'toggleFlag', questionId: 'clf-d1-0001', at: AT })).toBe(
      submitted,
    );
    expect(run(submitted, { type: 'goTo', index: 1 })).toBe(submitted);
    expect(run(submitted, { type: 'cancelFinish' })).toBe(submitted);
  });
});
