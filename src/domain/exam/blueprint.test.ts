import { describe, expect, it } from 'vitest';
import { allocateByWeight, fitsAvailability, maxBalancedQuestionCount } from './blueprint';
import { FULL_EXAM, shortExamConfig } from './config';

const sum = (counts: Record<string, number>) => Object.values(counts).reduce((a, b) => a + b, 0);

describe('allocateByWeight', () => {
  it('splits the 65-question exam 16 / 19 / 22 / 8', () => {
    expect(allocateByWeight(65)).toEqual({ D1: 16, D2: 19, D3: 22, D4: 8 });
  });

  it('splits 50 scored questions 12 / 15 / 17 / 6', () => {
    expect(allocateByWeight(50)).toEqual({ D1: 12, D2: 15, D3: 17, D4: 6 });
  });

  it('always sums to the total and never goes negative (n = 0…200)', () => {
    for (let n = 0; n <= 200; n++) {
      const counts = allocateByWeight(n);
      expect(sum(counts), `n=${n}`).toBe(n);
      expect(Object.values(counts).every((c) => c >= 0)).toBe(true);
    }
  });

  it('breaks remainder ties deterministically (larger weight first)', () => {
    // n = 25: shares 6.0 / 7.5 / 8.5 / 3.0 → D2 and D3 tie at .5; D3 has the larger weight.
    expect(allocateByWeight(25)).toEqual({ D1: 6, D2: 7, D3: 9, D4: 3 });
  });

  it('rejects invalid totals', () => {
    expect(() => allocateByWeight(-1)).toThrow(RangeError);
    expect(() => allocateByWeight(1.5)).toThrow(RangeError);
  });
});

describe('fitsAvailability and maxBalancedQuestionCount', () => {
  it('detects whether every domain has enough questions', () => {
    const need = allocateByWeight(65);
    expect(fitsAvailability(need, { D1: 16, D2: 19, D3: 22, D4: 8 })).toBe(true);
    expect(fitsAvailability(need, { D1: 16, D2: 18, D3: 30, D4: 8 })).toBe(false);
  });

  it('finds the largest balanced exam the bank can supply', () => {
    // The current seed bank: 10 / 12 / 15 / 7.
    expect(maxBalancedQuestionCount({ D1: 10, D2: 12, D3: 15, D4: 7 }, 64)).toBe(41);
    expect(maxBalancedQuestionCount({ D1: 100, D2: 100, D3: 100, D4: 100 }, 65)).toBe(65);
    expect(maxBalancedQuestionCount({ D1: 0, D2: 0, D3: 0, D4: 0 }, 65)).toBe(0);
  });
});

describe('exam configs', () => {
  it('keeps the full exam at 65 questions and 90 minutes', () => {
    expect(FULL_EXAM).toEqual({ kind: 'full', questionCount: 65, durationMs: 90 * 60_000 });
  });

  it('scales shorter exams to the real pace, rounded up to whole minutes', () => {
    expect(shortExamConfig(41).durationMs).toBe(57 * 60_000); // 56.8 → 57
    expect(shortExamConfig(13).durationMs).toBe(18 * 60_000); // exactly 18
  });
});
