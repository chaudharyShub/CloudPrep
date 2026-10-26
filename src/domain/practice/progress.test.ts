import { describe, expect, it } from 'vitest';
import { makeMultiQuestion, makeQuestion } from '@/test/fixtures/questions';
import { mistakeIds, practiceStats, recordAnswer, type ProgressMap } from './progress';

const answer = (questionId: string, isCorrect: boolean, at: number, sessionId: string) => ({
  questionId,
  isCorrect,
  at,
  sessionId,
});

describe('recordAnswer', () => {
  it('creates an entry on the first answer', () => {
    const progress = recordAnswer({}, answer('q1', false, 100, 's1'));
    expect(progress['q1']).toEqual({
      attempts: 1,
      correct: 0,
      lastResult: 'incorrect',
      firstAnsweredAt: 100,
      lastAnsweredAt: 100,
      lastIncorrectAt: 100,
      lastSessionId: 's1',
      reviewLevel: 0,
    });
  });

  it('accumulates attempts across sessions and tracks the latest result', () => {
    let progress: ProgressMap = {};
    progress = recordAnswer(progress, answer('q1', false, 100, 's1'));
    progress = recordAnswer(progress, answer('q1', true, 200, 's2'));
    expect(progress['q1']).toMatchObject({
      attempts: 2,
      correct: 1,
      lastResult: 'correct',
      firstAnsweredAt: 100,
      lastAnsweredAt: 200,
      lastIncorrectAt: 100,
    });
  });

  it('counts a question at most once per session (idempotent)', () => {
    const once = recordAnswer({}, answer('q1', true, 100, 's1'));
    const twice = recordAnswer(once, answer('q1', true, 150, 's1'));
    expect(twice).toBe(once);
    expect(twice['q1']?.attempts).toBe(1);
  });

  it('does not mutate the input', () => {
    const input: ProgressMap = {};
    recordAnswer(input, answer('q1', true, 1, 's1'));
    expect(input).toEqual({});
  });
});

describe('mistakeIds', () => {
  it('lists questions whose latest answer is incorrect, most recent first', () => {
    let progress: ProgressMap = {};
    progress = recordAnswer(progress, answer('a', false, 100, 's1'));
    progress = recordAnswer(progress, answer('b', false, 300, 's1'));
    progress = recordAnswer(progress, answer('c', true, 200, 's1'));
    expect(mistakeIds(progress, new Set(['a', 'b', 'c']))).toEqual(['b', 'a']);
  });

  it('clears a mistake once it is answered correctly', () => {
    let progress = recordAnswer({}, answer('a', false, 100, 's1'));
    progress = recordAnswer(progress, answer('a', true, 200, 's2'));
    expect(mistakeIds(progress, new Set(['a']))).toEqual([]);
  });

  it('ignores questions that are no longer available', () => {
    const progress = recordAnswer({}, answer('gone', false, 100, 's1'));
    expect(mistakeIds(progress, new Set())).toEqual([]);
  });
});

describe('practiceStats', () => {
  const d1a = makeQuestion({ id: 'clf-d1-0001' });
  const d1b = makeQuestion({ id: 'clf-d1-0002' });
  const d2 = makeMultiQuestion({ id: 'clf-d2-0001' });
  const questions = [d1a, d1b, d2];

  it('has no accuracy before any answer', () => {
    const { overall, byDomain } = practiceStats({}, questions);
    expect(overall).toMatchObject({ answeredQuestions: 0, accuracy: null, availableQuestions: 3 });
    expect(byDomain.D3).toMatchObject({ availableQuestions: 0, accuracy: null });
  });

  it('uses unique questions and latest results, so retries do not inflate accuracy', () => {
    let progress: ProgressMap = {};
    // d1a: wrong three times, then right → counts once, as correct.
    progress = recordAnswer(progress, answer(d1a.id, false, 1, 's1'));
    progress = recordAnswer(progress, answer(d1a.id, false, 2, 's2'));
    progress = recordAnswer(progress, answer(d1a.id, false, 3, 's3'));
    progress = recordAnswer(progress, answer(d1a.id, true, 4, 's4'));
    // d1b: right, then wrong → counts once, as incorrect.
    progress = recordAnswer(progress, answer(d1b.id, true, 5, 's1'));
    progress = recordAnswer(progress, answer(d1b.id, false, 6, 's2'));

    const { byDomain, overall } = practiceStats(progress, questions);
    expect(byDomain.D1).toEqual({
      answeredQuestions: 2,
      correctQuestions: 1,
      attempts: 6,
      correctAttempts: 2,
      accuracy: 0.5,
      availableQuestions: 2,
    });
    expect(overall.answeredQuestions).toBe(2);
  });

  it('ignores progress for questions not in the given list', () => {
    const progress = recordAnswer({}, answer('clf-d4-0001', true, 1, 's1'));
    expect(practiceStats(progress, questions).overall.answeredQuestions).toBe(0);
  });
});
