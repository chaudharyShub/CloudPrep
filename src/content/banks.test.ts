import { describe, expect, it } from 'vitest';
import { EXAMS, examForQuestionId } from '@/domain/exam-guide';
import { bankCoverage } from '@/domain/questions/coverage';
import { validateBank } from '@/domain/questions/validate';
import { BANKS } from './banks';

// Guards every exam's real question bank: a malformed question fails the test suite.
describe.each(EXAMS)('$code question bank', (exam) => {
  const bank = BANKS[exam.id];
  const questions = bank?.questions ?? [];

  it('AC-M.9 has a bank entry with a version', () => {
    expect(bank?.version).toMatch(/^\d{4}-\d{2}-\d{2}\.\d+$/);
  });

  it('passes validation', () => {
    expect(validateBank(questions)).toEqual([]);
  });

  it('AC-M.9 holds only its own exam’s questions (id prefix)', () => {
    expect(questions.filter((q) => examForQuestionId(q.id) !== exam).map((q) => q.id)).toEqual([]);
  });

  it('keeps option ids in a stable a, b, c… sequence', () => {
    for (const question of questions) {
      const expected = question.options.map((_, i) => String.fromCharCode(97 + i));
      expect(
        question.options.map((o) => o.id),
        question.id,
      ).toEqual(expected);
    }
  });

  it('does not contain draft questions in a release', () => {
    expect(questions.filter((q) => q.review.status === 'draft').map((q) => q.id)).toEqual([]);
  });

  // A launched exam must cover its whole guide; a bank still being written is checked once
  // it has questions in every domain.
  it.runIf(exam.launched)('covers every task statement in the exam guide', () => {
    expect(bankCoverage(questions, exam).uncoveredTaskStatements).toEqual([]);
  });

  it.runIf(exam.launched)(
    'has questions in every domain and includes multiple-response questions',
    () => {
      const coverage = bankCoverage(questions, exam);
      for (const domain of exam.domains) expect(coverage.byDomain[domain.id]).toBeGreaterThan(0);
      expect(coverage.byType.multiple).toBeGreaterThan(0);
    },
  );
});

describe('question ids', () => {
  it('are unique across every exam', () => {
    const ids = Object.values(BANKS).flatMap((bank) => bank.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
