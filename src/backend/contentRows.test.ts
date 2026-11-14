import { describe, expect, it } from 'vitest';
import { QUESTION_BANK } from '@/sample-content/clf-c02';
import { CLF_C02, EXAMS } from '@/domain/exam-guide';
import type { Question } from '@/domain/questions/types';
import { validateQuestion } from '@/domain/questions/validate';
import { examRows, isPublishable, questionToRows, rowsToQuestion } from './contentRows';

const sample = QUESTION_BANK.find((q) => q.type === 'multiple' && isPublishable(q)) as Question;

describe('content rows', () => {
  it('AC-B.4 every publishable question survives the round trip to rows and back', () => {
    const publishable = QUESTION_BANK.filter(isPublishable);
    expect(publishable.length).toBeGreaterThan(0);
    for (const question of publishable) {
      const rows = questionToRows(question, CLF_C02.id);
      const rebuilt = rowsToQuestion(rows.question, rows.key);
      expect(rebuilt).toEqual(question);
      expect(validateQuestion(rebuilt)).toEqual([]);
    }
  });

  it('AC-B.4 content rows hold no answers or explanations', () => {
    const { question } = questionToRows(sample, CLF_C02.id);
    const json = JSON.stringify(question);
    expect(json).not.toContain(sample.explanation);
    for (const option of sample.options) expect(json).not.toContain(option.explanation);
    expect(question).not.toHaveProperty('correct_option_ids');
    expect(question.required_selections).toBe(sample.correctOptionIds.length);
  });

  it('AC-B.4 drafts are never published', () => {
    const draft: Question = { ...sample, review: { ...sample.review, status: 'draft' } };
    expect(isPublishable(draft)).toBe(false);
    expect(() => questionToRows(draft, CLF_C02.id)).toThrow(/draft/i);
  });

  it('rejects a key from another question or revision, or a missing option explanation', () => {
    const rows = questionToRows(sample, CLF_C02.id);
    expect(rowsToQuestion(rows.question, { ...rows.key, revision: rows.key.revision + 1 })).toBe(
      null,
    );
    expect(rowsToQuestion(rows.question, { ...rows.key, question_id: 'other' })).toBe(null);
    expect(rowsToQuestion(rows.question, { ...rows.key, option_explanations: {} })).toBe(null);
  });

  it.each(EXAMS)('AC-M.9 builds the $code catalogue from its exam guide', (guide) => {
    const { exam, domains, topics } = examRows(guide, true);
    expect(exam).toMatchObject({
      id: guide.id,
      code: guide.code,
      question_count: guide.questionCount,
      duration_minutes: guide.durationMinutes,
      is_published: true,
    });
    expect(domains.map((d) => d.id)).toEqual(guide.domains.map((d) => d.id));
    expect(domains.every((d) => d.exam_id === guide.id)).toBe(true);
    expect(domains.reduce((sum, d) => sum + d.weight_percent, 0)).toBe(100);
    expect(topics).toHaveLength(guide.domains.flatMap((d) => d.taskStatements).length);
  });

  it('AC-M.9 publishes an exam without questions as unpublished', () => {
    expect(examRows(CLF_C02, false).exam.is_published).toBe(false);
  });
});
