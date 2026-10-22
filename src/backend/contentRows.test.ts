import { describe, expect, it } from 'vitest';
import { QUESTION_BANK } from '@/content/questions';
import { DOMAINS, EXAM_ID } from '@/domain/exam-guide/clf-c02';
import type { Question } from '@/domain/questions/types';
import { validateQuestion } from '@/domain/questions/validate';
import { clfExamRows, isPublishable, questionToRows, rowsToQuestion } from './contentRows';

const sample = QUESTION_BANK.find((q) => q.type === 'multiple' && isPublishable(q)) as Question;

describe('content rows', () => {
  it('AC-B.4 every publishable question survives the round trip to rows and back', () => {
    const publishable = QUESTION_BANK.filter(isPublishable);
    expect(publishable.length).toBeGreaterThan(0);
    for (const question of publishable) {
      const rows = questionToRows(question, EXAM_ID);
      const rebuilt = rowsToQuestion(rows.question, rows.key);
      expect(rebuilt).toEqual(question);
      expect(validateQuestion(rebuilt)).toEqual([]);
    }
  });

  it('AC-B.4 content rows hold no answers or explanations', () => {
    const { question } = questionToRows(sample, EXAM_ID);
    const json = JSON.stringify(question);
    expect(json).not.toContain(sample.explanation);
    for (const option of sample.options) expect(json).not.toContain(option.explanation);
    expect(question).not.toHaveProperty('correct_option_ids');
    expect(question.required_selections).toBe(sample.correctOptionIds.length);
  });

  it('AC-B.4 drafts are never published', () => {
    const draft: Question = { ...sample, review: { ...sample.review, status: 'draft' } };
    expect(isPublishable(draft)).toBe(false);
    expect(() => questionToRows(draft, EXAM_ID)).toThrow(/draft/i);
  });

  it('rejects a key from another question or revision, or a missing option explanation', () => {
    const rows = questionToRows(sample, EXAM_ID);
    expect(rowsToQuestion(rows.question, { ...rows.key, revision: rows.key.revision + 1 })).toBe(
      null,
    );
    expect(rowsToQuestion(rows.question, { ...rows.key, question_id: 'other' })).toBe(null);
    expect(rowsToQuestion(rows.question, { ...rows.key, option_explanations: {} })).toBe(null);
  });

  it('builds the CLF-C02 catalogue from the exam guide', () => {
    const { exam, domains, topics } = clfExamRows();
    expect(exam.id).toBe(EXAM_ID);
    expect(domains.map((d) => d.id)).toEqual(DOMAINS.map((d) => d.id));
    expect(domains.reduce((sum, d) => sum + d.weight_percent, 0)).toBe(100);
    expect(topics).toHaveLength(DOMAINS.flatMap((d) => d.taskStatements).length);
  });
});
