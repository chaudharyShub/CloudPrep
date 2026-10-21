import { describe, expect, it } from 'vitest';
import { DOMAINS } from '@/domain/exam-guide/clf-c02';
import { bankCoverage } from '@/domain/questions/coverage';
import { validateBank } from '@/domain/questions/validate';
import { QUESTION_BANK } from './index';

// Guards the real question bank: a malformed question fails the test suite.
describe('question bank', () => {
  it('passes validation', () => {
    expect(validateBank(QUESTION_BANK)).toEqual([]);
  });

  it('covers every task statement in the exam guide', () => {
    expect(bankCoverage(QUESTION_BANK).uncoveredTaskStatements).toEqual([]);
  });

  it('has questions in every domain and includes multiple-response questions', () => {
    const coverage = bankCoverage(QUESTION_BANK);
    for (const domain of DOMAINS) expect(coverage.byDomain[domain.id]).toBeGreaterThan(0);
    expect(coverage.byType.multiple).toBeGreaterThan(0);
  });

  it('keeps option ids in a stable a, b, c… sequence', () => {
    for (const question of QUESTION_BANK) {
      const expected = question.options.map((_, i) => String.fromCharCode(97 + i));
      expect(
        question.options.map((o) => o.id),
        question.id,
      ).toEqual(expected);
    }
  });

  it('does not contain draft questions in a release', () => {
    expect(QUESTION_BANK.filter((q) => q.review.status === 'draft').map((q) => q.id)).toEqual([]);
  });
});
