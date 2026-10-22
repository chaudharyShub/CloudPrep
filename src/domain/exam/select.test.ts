import { describe, expect, it } from 'vitest';
import { makeQuestion } from '@/test/fixtures/questions';
import { FULL_BANK, makeBank } from '@/test/fixtures/bank';
import { countByDomain, examEligibleQuestions, selectExamQuestions } from './select';

const byId = new Map(FULL_BANK.map((q) => [q.id, q]));

describe('selectExamQuestions', () => {
  it('returns 65 unique questions in the 16 / 19 / 22 / 8 split', () => {
    const result = selectExamQuestions({ questions: FULL_BANK, questionCount: 65, seed: 1 });
    if (!result.ok) throw new Error('expected success');
    expect(result.questionIds).toHaveLength(65);
    expect(new Set(result.questionIds).size).toBe(65);
    const chosen = result.questionIds.map((id) => byId.get(id)).filter((q) => q !== undefined);
    expect(countByDomain(chosen)).toEqual({ D1: 16, D2: 19, D3: 22, D4: 8 });
  });

  it('is reproducible for a seed and varies across seeds', () => {
    const a = selectExamQuestions({ questions: FULL_BANK, questionCount: 65, seed: 42 });
    const b = selectExamQuestions({ questions: FULL_BANK, questionCount: 65, seed: 42 });
    const c = selectExamQuestions({ questions: FULL_BANK, questionCount: 65, seed: 43 });
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  it('randomises the order rather than grouping by domain', () => {
    const result = selectExamQuestions({ questions: FULL_BANK, questionCount: 65, seed: 7 });
    if (!result.ok) throw new Error('expected success');
    const domains = result.questionIds.map((id) => byId.get(id)?.domain);
    const grouped = [...domains].sort();
    expect(domains).not.toEqual(grouped);
  });

  it('spreads each domain across its task statements', () => {
    const result = selectExamQuestions({ questions: FULL_BANK, questionCount: 65, seed: 3 });
    if (!result.ok) throw new Error('expected success');
    const d3Tasks = new Set(
      result.questionIds
        .map((id) => byId.get(id))
        .filter((q) => q?.domain === 'D3')
        .map((q) => q?.taskStatement),
    );
    expect(d3Tasks.size).toBe(8); // all eight Domain 3 task statements represented
  });

  it('prefers questions not seen in earlier exams', () => {
    const bank = makeBank({ D1: 4, D2: 4, D3: 4, D4: 4 });
    // One seen question per domain; 8 questions need at most 3 per domain, so 3 unseen suffice.
    const seen = new Set(bank.filter((_, i) => i % 4 === 0).map((q) => q.id));
    const result = selectExamQuestions({
      questions: bank,
      questionCount: 8,
      seed: 5,
      seenIds: seen,
    });
    if (!result.ok) throw new Error('expected success');
    expect(result.questionIds.every((id) => !seen.has(id))).toBe(true);
  });

  it('reports shortfalls instead of duplicating questions or starting a partial exam', () => {
    const bank = makeBank({ D1: 10, D2: 12, D3: 15, D4: 7 });
    const result = selectExamQuestions({ questions: bank, questionCount: 65, seed: 1 });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.shortfalls).toEqual([
      { domain: 'D1', required: 16, available: 10 },
      { domain: 'D2', required: 19, available: 12 },
      { domain: 'D3', required: 22, available: 15 },
      { domain: 'D4', required: 8, available: 7 },
    ]);
  });

  it('treats duplicate entries in the input as one question', () => {
    const bank = makeBank({ D1: 3, D2: 3, D3: 3, D4: 2 });
    const doubled = [...bank, ...bank];
    const result = selectExamQuestions({ questions: doubled, questionCount: 11, seed: 1 });
    // 11 needs 3 / 3 / 4 / 1 and D3 has only 3 unique questions.
    expect(result.ok).toBe(false);
  });
});

describe('examEligibleQuestions', () => {
  it('excludes drafts and retired questions, and includes unverified ones (D-041)', () => {
    const questions = [
      makeQuestion({ id: 'clf-d1-0001' }),
      makeQuestion({
        id: 'clf-d1-0005',
        review: { status: 'unverified', lastVerified: '2026-10-21' },
      }),
      makeQuestion({ id: 'clf-d1-0002', review: { status: 'draft', lastVerified: '2026-10-21' } }),
      makeQuestion({
        id: 'clf-d1-0003',
        review: { status: 'retired', lastVerified: '2026-10-21' },
      }),
      makeQuestion({
        id: 'clf-d1-0004',
        review: { status: 'approved', lastVerified: '2026-10-21' },
      }),
    ];
    expect(examEligibleQuestions(questions).map((q) => q.id)).toEqual([
      'clf-d1-0001',
      'clf-d1-0005',
      'clf-d1-0004',
    ]);
  });
});
