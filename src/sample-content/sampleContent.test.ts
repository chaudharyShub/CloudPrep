import { describe, expect, it } from 'vitest';
import { EXAMS, examForQuestionId } from '@/domain/exam-guide';
import { validateBank } from '@/domain/questions/validate';
import { buildQuestionBank } from '@/state/questionBank';
import { SAMPLE_BANKS } from '.';

describe.each(EXAMS)('$code sample bank (D-072)', (exam) => {
  const bank = SAMPLE_BANKS[exam.id];
  const questions = bank?.questions ?? [];

  it('AC-P.1 is valid and holds only this exam’s questions', () => {
    expect(bank?.version).toMatch(/^\d{4}-\d{2}-\d{2}\.\d+$/);
    expect(validateBank(questions)).toEqual([]);
    expect(questions.filter((q) => examForQuestionId(q.id) !== exam)).toEqual([]);
  });

  it('AC-P.2 has enough questions for a full exam in every domain', () => {
    const loaded = buildQuestionBank(questions, bank?.version ?? '', exam);
    for (const domain of exam.domains) {
      const needed = Math.ceil((exam.questionCount * domain.weightPercent) / 100);
      expect(
        loaded.examQuestions.questions.filter((q) => q.domain === domain.id).length,
        domain.id,
      ).toBeGreaterThanOrEqual(needed);
    }
  });
});
