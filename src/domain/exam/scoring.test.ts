import { describe, expect, it } from 'vitest';
import { isValidBenchmark, meetsBenchmark, scoreQuestion, summarizeOutcomes } from './scoring';

describe('scoreQuestion', () => {
  it('single answer: correct only when the one selection is the correct option', () => {
    expect(scoreQuestion(['a'], ['a'])).toBe('correct');
    expect(scoreQuestion(['a'], ['b'])).toBe('incorrect');
    expect(scoreQuestion(['a'], ['a', 'b'])).toBe('incorrect');
  });

  it('multiple response: only the exact set is correct (no partial credit)', () => {
    expect(scoreQuestion(['a', 'b'], ['b', 'a'])).toBe('correct');
    expect(scoreQuestion(['a', 'b'], ['a'])).toBe('incorrect');
    expect(scoreQuestion(['a', 'b'], ['a', 'b', 'c'])).toBe('incorrect');
    expect(scoreQuestion(['a', 'b'], ['a', 'c'])).toBe('incorrect');
  });

  it('treats no selection as unanswered', () => {
    expect(scoreQuestion(['a'], [])).toBe('unanswered');
    expect(scoreQuestion(['a', 'b'], [])).toBe('unanswered');
  });

  it('ignores duplicate ids in the selection', () => {
    expect(scoreQuestion(['a', 'b'], ['a', 'a', 'b'])).toBe('correct');
  });
});

describe('summarizeOutcomes', () => {
  it('counts correct, incorrect and unanswered overall and per domain', () => {
    const summary = summarizeOutcomes([
      { domain: 'D1', outcome: 'correct' },
      { domain: 'D1', outcome: 'incorrect' },
      { domain: 'D1', outcome: 'unanswered' },
      { domain: 'D2', outcome: 'correct' },
    ]);
    expect(summary).toMatchObject({
      total: 4,
      correct: 2,
      incorrect: 1,
      unanswered: 1,
      attempted: 3,
      ratio: 0.5,
      percent: 50,
    });
    expect(summary.byDomain.D1).toEqual({
      total: 3,
      attempted: 2,
      correct: 1,
      incorrect: 1,
      unanswered: 1,
      score: 1 / 3,
      accuracy: 0.5,
      smallSample: true,
    });
    expect(summary.byDomain.D3).toMatchObject({ total: 0, score: null, accuracy: null });
  });

  it('distinguishes score from accuracy and flags small samples (2 of 2 is not mastery)', () => {
    const summary = summarizeOutcomes([
      { domain: 'D4', outcome: 'correct' },
      { domain: 'D4', outcome: 'correct' },
    ]);
    expect(summary.byDomain.D4).toMatchObject({ score: 1, accuracy: 1, smallSample: true });
  });

  it('separates accuracy (of answered) from score (of all) when questions are skipped', () => {
    const records = [
      ...Array.from({ length: 4 }, () => ({ domain: 'D2' as const, outcome: 'correct' as const })),
      ...Array.from({ length: 6 }, () => ({
        domain: 'D2' as const,
        outcome: 'unanswered' as const,
      })),
    ];
    expect(summarizeOutcomes(records).byDomain.D2).toMatchObject({
      score: 0.4,
      accuracy: 1,
      smallSample: false,
    });
  });

  it('rounds the percentage to one decimal place and handles an empty exam', () => {
    const records = [
      { domain: 'D1' as const, outcome: 'correct' as const },
      { domain: 'D1' as const, outcome: 'incorrect' as const },
      { domain: 'D1' as const, outcome: 'incorrect' as const },
    ];
    expect(summarizeOutcomes(records).percent).toBe(33.3);
    expect(summarizeOutcomes([])).toMatchObject({ total: 0, ratio: 0, percent: 0 });
  });
});

describe('practice benchmark', () => {
  it('is met at exactly the benchmark using integer arithmetic', () => {
    expect(meetsBenchmark({ correct: 7, total: 10 }, 70)).toBe(true);
    expect(meetsBenchmark({ correct: 45, total: 65 }, 70)).toBe(false); // 69.2%
    expect(meetsBenchmark({ correct: 46, total: 65 }, 70)).toBe(true); // 70.8%
    expect(meetsBenchmark({ correct: 0, total: 0 }, 50)).toBe(false);
  });

  it('accepts benchmarks from 50 to 90 in steps of 5', () => {
    expect([50, 70, 90].every(isValidBenchmark)).toBe(true);
    expect([45, 95, 72, 70.5, '70', null].some(isValidBenchmark)).toBe(false);
  });
});
