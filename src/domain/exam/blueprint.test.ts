import { describe, expect, it } from 'vitest';
import { allocateByWeight, fitsAvailability, maxBalancedQuestionCount } from './blueprint';
import { CLF_C02, DVA_C03, SAA_C03 } from '@/domain/exam-guide';
import { fullExamConfig, shortExamConfig } from './config';

const D = CLF_C02.domains;

const sum = (counts: Record<string, number>) => Object.values(counts).reduce((a, b) => a + b, 0);

describe('allocateByWeight', () => {
  it('splits the 65-question exam 16 / 19 / 22 / 8', () => {
    expect(allocateByWeight(65, D)).toEqual({ D1: 16, D2: 19, D3: 22, D4: 8 });
  });

  it('splits 50 scored questions 12 / 15 / 17 / 6', () => {
    expect(allocateByWeight(50, D)).toEqual({ D1: 12, D2: 15, D3: 17, D4: 6 });
  });

  it('always sums to the total and never goes negative (n = 0…200)', () => {
    for (let n = 0; n <= 200; n++) {
      const counts = allocateByWeight(n, D);
      expect(sum(counts), `n=${n}`).toBe(n);
      expect(Object.values(counts).every((c) => c >= 0)).toBe(true);
    }
  });

  it('breaks remainder ties deterministically (larger weight first)', () => {
    // n = 25: shares 6.0 / 7.5 / 8.5 / 3.0 → D2 and D3 tie at .5; D3 has the larger weight.
    expect(allocateByWeight(25, D)).toEqual({ D1: 6, D2: 7, D3: 9, D4: 3 });
  });

  it('AC-M.4 splits 65 SAA-C03 questions 19 / 17 / 16 / 13 and DVA-C03 20 / 17 / 14 / 14', () => {
    // SAA-C03 30 / 26 / 24 / 20%: 19.5 / 16.9 / 15.6 / 13.0; the 2 left go to D2 (.9), D3 (.6).
    expect(allocateByWeight(65, SAA_C03.domains)).toEqual({ D1: 19, D2: 17, D3: 16, D4: 13 });
    // DVA-C03 30 / 26 / 22 / 22%: 19.5 / 16.9 / 14.3 / 14.3; the 2 left go to D2 (.9), D1 (.5).
    expect(allocateByWeight(65, DVA_C03.domains)).toEqual({ D1: 20, D2: 17, D3: 14, D4: 14 });
  });

  it('rejects invalid totals', () => {
    expect(() => allocateByWeight(-1, D)).toThrow(RangeError);
    expect(() => allocateByWeight(1.5, D)).toThrow(RangeError);
  });
});

describe('fitsAvailability and maxBalancedQuestionCount', () => {
  it('detects whether every domain has enough questions', () => {
    const need = allocateByWeight(65, D);
    expect(fitsAvailability(need, { D1: 16, D2: 19, D3: 22, D4: 8 })).toBe(true);
    expect(fitsAvailability(need, { D1: 16, D2: 18, D3: 30, D4: 8 })).toBe(false);
  });

  it('finds the largest balanced exam the bank can supply', () => {
    // The current seed bank: 10 / 12 / 15 / 7.
    expect(maxBalancedQuestionCount({ D1: 10, D2: 12, D3: 15, D4: 7 }, 64, D)).toBe(41);
    expect(maxBalancedQuestionCount({ D1: 100, D2: 100, D3: 100, D4: 100 }, 65, D)).toBe(65);
    expect(maxBalancedQuestionCount({ D1: 0, D2: 0, D3: 0, D4: 0 }, 65, D)).toBe(0);
  });
});

describe('exam configs', () => {
  it('keeps the full exam at 65 questions and 90 minutes', () => {
    expect(fullExamConfig(CLF_C02)).toEqual({
      examId: 'clf-c02',
      kind: 'full',
      questionCount: 65,
      durationMs: 90 * 60_000,
    });
  });

  it('AC-M.4 uses each exam’s own length and time', () => {
    expect(fullExamConfig(SAA_C03)).toEqual({
      examId: 'saa-c03',
      kind: 'full',
      questionCount: 65,
      durationMs: 130 * 60_000,
    });
    expect(fullExamConfig(DVA_C03).durationMs).toBe(130 * 60_000);
  });

  it('scales shorter exams to the real pace, rounded up to whole minutes', () => {
    expect(shortExamConfig(CLF_C02, 41).durationMs).toBe(57 * 60_000); // 56.8 → 57
    expect(shortExamConfig(CLF_C02, 13).durationMs).toBe(18 * 60_000); // exactly 18
  });

  it('AC-M.4 keeps the associate exams’ pace in shorter exams', () => {
    // 130 minutes for 65 questions: 2 minutes a question.
    expect(shortExamConfig(SAA_C03, 13)).toEqual({
      examId: 'saa-c03',
      kind: 'short',
      questionCount: 13,
      durationMs: 26 * 60_000,
    });
    expect(shortExamConfig(DVA_C03, 41).durationMs).toBe(82 * 60_000);
  });
});
