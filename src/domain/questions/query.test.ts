import { describe, expect, it } from 'vitest';
import { makeMultiQuestion, makeQuestion } from '@/test/fixtures/questions';
import { bankCoverage } from './coverage';
import { filterQuestions, indexQuestions, practiceableQuestions } from './query';

const q1 = makeQuestion({
  id: 'clf-d1-0001',
  domain: 'D1',
  taskStatement: '1.1',
  difficulty: 'easy',
});
const q2 = makeQuestion({
  id: 'clf-d1-0002',
  domain: 'D1',
  taskStatement: '1.2',
  difficulty: 'hard',
});
const q3 = makeMultiQuestion({
  id: 'clf-d2-0001',
  domain: 'D2',
  taskStatement: '2.1',
  difficulty: 'medium',
});
const draft = makeQuestion({
  id: 'clf-d1-0003',
  review: { status: 'draft', lastVerified: '2026-10-21' },
});
const retired = makeQuestion({
  id: 'clf-d1-0004',
  review: { status: 'retired', lastVerified: '2026-10-21' },
});
const approved = makeQuestion({
  id: 'clf-d1-0005',
  review: { status: 'approved', lastVerified: '2026-10-21' },
});
const ALL = [q1, q2, q3];
const ids = (questions: readonly { id: string }[]) => questions.map((q) => q.id);

describe('practiceableQuestions', () => {
  it('keeps checked and approved questions and drops drafts and retired ones', () => {
    expect(ids(practiceableQuestions([q1, draft, retired, approved]))).toEqual([
      'clf-d1-0001',
      'clf-d1-0005',
    ]);
  });

  it('keeps unverified questions (D-041)', () => {
    const unverified = makeQuestion({
      id: 'clf-d1-0006',
      review: { status: 'unverified', lastVerified: '2026-10-21' },
    });
    expect(ids(practiceableQuestions([unverified, draft]))).toEqual(['clf-d1-0006']);
  });
});

describe('filterQuestions', () => {
  it('returns everything for an empty filter', () => {
    expect(ids(filterQuestions(ALL, {}))).toEqual(ids(ALL));
    expect(
      ids(filterQuestions(ALL, { domains: [], taskStatements: [], difficulties: [] })),
    ).toEqual(ids(ALL));
  });

  it('filters by domain', () => {
    expect(ids(filterQuestions(ALL, { domains: ['D1'] }))).toEqual(['clf-d1-0001', 'clf-d1-0002']);
    expect(ids(filterQuestions(ALL, { domains: ['D4'] }))).toEqual([]);
  });

  it('filters by task statement and difficulty together', () => {
    expect(ids(filterQuestions(ALL, { domains: ['D1'], taskStatements: ['1.2'] }))).toEqual([
      'clf-d1-0002',
    ]);
    expect(ids(filterQuestions(ALL, { domains: ['D1'], difficulties: ['easy'] }))).toEqual([
      'clf-d1-0001',
    ]);
  });

  it('restricts to and excludes specific ids', () => {
    expect(ids(filterQuestions(ALL, { ids: ['clf-d2-0001', 'missing'] }))).toEqual(['clf-d2-0001']);
    expect(ids(filterQuestions(ALL, { ids: [] }))).toEqual([]);
    expect(ids(filterQuestions(ALL, { excludeIds: ['clf-d1-0001'] }))).toEqual([
      'clf-d1-0002',
      'clf-d2-0001',
    ]);
  });
});

describe('indexQuestions and bankCoverage', () => {
  it('indexes by id', () => {
    expect(indexQuestions(ALL).get('clf-d2-0001')).toBe(q3);
  });

  it('counts coverage and lists uncovered task statements', () => {
    const coverage = bankCoverage(ALL);
    expect(coverage.total).toBe(3);
    expect(coverage.byDomain).toEqual({ D1: 2, D2: 1, D3: 0, D4: 0 });
    expect(coverage.byType).toEqual({ single: 2, multiple: 1 });
    expect(coverage.uncoveredTaskStatements).toContain('3.1');
    expect(coverage.uncoveredTaskStatements).not.toContain('1.1');
  });
});
