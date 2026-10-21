import { describe, expect, it } from 'vitest';
import { makeMultiQuestion, makeQuestion } from '@/test/fixtures/questions';
import { validateBank, validateQuestion, type ValidationCode } from './validate';

function codes(input: unknown): ValidationCode[] {
  return validateQuestion(input).map((issue) => issue.code);
}

describe('validateQuestion', () => {
  it('accepts valid single-answer and multiple-response questions', () => {
    expect(validateQuestion(makeQuestion())).toEqual([]);
    expect(validateQuestion(makeMultiQuestion())).toEqual([]);
  });

  it('rejects values that are not objects', () => {
    expect(codes(null)).toEqual(['NOT_AN_OBJECT']);
    expect(codes('question')).toEqual(['NOT_AN_OBJECT']);
    expect(codes([])).toEqual(['NOT_AN_OBJECT']);
  });

  it.each<[string, Record<string, unknown>, ValidationCode]>([
    ['malformed id', { id: 'q1' }, 'INVALID_ID'],
    ['id prefix for another domain', { id: 'clf-d3-0001' }, 'ID_DOMAIN_MISMATCH'],
    ['zero revision', { revision: 0 }, 'INVALID_REVISION'],
    ['unknown type', { type: 'essay' }, 'INVALID_TYPE'],
    ['blank stem', { stem: '   ' }, 'EMPTY_STEM'],
    ['missing options', { options: [] }, 'MISSING_OPTIONS'],
    ['options not an array', { options: 'abc' }, 'MISSING_OPTIONS'],
    ['blank explanation', { explanation: '' }, 'EMPTY_EXPLANATION'],
    ['unknown domain', { domain: 'D9' }, 'INVALID_DOMAIN'],
    ['task from another domain', { taskStatement: '3.1' }, 'INVALID_TASK_STATEMENT'],
    ['unknown difficulty', { difficulty: 'extreme' }, 'INVALID_DIFFICULTY'],
    ['tags not strings', { tags: [1] }, 'INVALID_TAGS'],
    ['no references', { references: [] }, 'MISSING_REFERENCE'],
    [
      'http reference',
      { references: [{ title: 'x', url: 'http://docs.aws.amazon.com/x' }] },
      'INVALID_REFERENCE',
    ],
    [
      'non-AWS reference',
      { references: [{ title: 'x', url: 'https://example.com/x' }] },
      'INVALID_REFERENCE',
    ],
    [
      'unknown review status',
      { review: { status: 'done', lastVerified: '2026-10-21' } },
      'INVALID_REVIEW',
    ],
    [
      'impossible review date',
      { review: { status: 'checked', lastVerified: '2026-02-30' } },
      'INVALID_REVIEW',
    ],
    [
      '"all of the above" stem',
      { stem: 'Pick one. All of the above?' },
      'ALL_OR_NONE_OF_THE_ABOVE',
    ],
  ])('rejects %s', (_label, override, code) => {
    expect(codes({ ...makeQuestion(), ...override })).toContain(code);
  });

  describe('options', () => {
    const base = makeQuestion();

    it('rejects duplicate option ids', () => {
      const options = [...base.options.slice(0, 3), { ...base.options[3], id: 'a' }];
      expect(codes({ ...base, options })).toContain('DUPLICATE_OPTION_ID');
    });

    it('rejects duplicate option text (case-insensitive)', () => {
      const options = [...base.options.slice(0, 3), { id: 'd', text: 'RIGHT', explanation: 'x' }];
      expect(codes({ ...base, options })).toContain('DUPLICATE_OPTION_TEXT');
    });

    it('rejects an option without an id, text or explanation', () => {
      expect(codes({ ...base, options: [...base.options.slice(0, 3), { text: 'x' }] })).toContain(
        'INVALID_OPTION',
      );
      expect(
        codes({
          ...base,
          options: [...base.options.slice(0, 3), { id: 'd', text: '', explanation: 'x' }],
        }),
      ).toContain('EMPTY_OPTION_TEXT');
      expect(
        codes({
          ...base,
          options: [...base.options.slice(0, 3), { id: 'd', text: 'x', explanation: ' ' }],
        }),
      ).toContain('MISSING_OPTION_EXPLANATION');
    });

    it('rejects "none of the above" options', () => {
      const options = [
        ...base.options.slice(0, 3),
        { id: 'd', text: 'None of the above', explanation: 'x' },
      ];
      expect(codes({ ...base, options })).toContain('ALL_OR_NONE_OF_THE_ABOVE');
    });

    it('requires exactly four options for single-answer questions', () => {
      expect(codes({ ...base, options: base.options.slice(0, 3) })).toContain('OPTION_COUNT');
    });

    it('requires at least five options for multiple-response questions', () => {
      const multi = makeMultiQuestion();
      expect(codes({ ...multi, options: multi.options.slice(0, 4) })).toContain('OPTION_COUNT');
    });
  });

  describe('correct answers', () => {
    it('requires at least one correct answer', () => {
      expect(codes({ ...makeQuestion(), correctOptionIds: [] })).toContain(
        'MISSING_CORRECT_ANSWER',
      );
      expect(codes({ ...makeQuestion(), correctOptionIds: undefined })).toContain(
        'MISSING_CORRECT_ANSWER',
      );
    });

    it('rejects correct answers that are not option ids', () => {
      expect(codes({ ...makeQuestion(), correctOptionIds: ['z'] })).toContain('UNKNOWN_CORRECT_ID');
      expect(codes({ ...makeQuestion(), correctOptionIds: [1] })).toContain('UNKNOWN_CORRECT_ID');
    });

    it('rejects duplicate correct answers', () => {
      expect(codes({ ...makeMultiQuestion(), correctOptionIds: ['a', 'a', 'b'] })).toContain(
        'DUPLICATE_CORRECT_ID',
      );
    });

    it('rejects more than one correct answer on a single-answer question', () => {
      expect(codes({ ...makeQuestion(), correctOptionIds: ['a', 'b'] })).toContain(
        'SINGLE_NEEDS_ONE_CORRECT',
      );
    });

    it('rejects fewer than two correct answers on a multiple-response question', () => {
      expect(codes({ ...makeMultiQuestion(), correctOptionIds: ['a'] })).toContain(
        'MULTIPLE_NEEDS_TWO_CORRECT',
      );
    });

    it('rejects a multiple-response question where every option is correct', () => {
      expect(
        codes({ ...makeMultiQuestion(), correctOptionIds: ['a', 'b', 'c', 'd', 'e'] }),
      ).toContain('MULTIPLE_ALL_CORRECT');
    });
  });

  it('reports every problem in one pass, not just the first', () => {
    const result = codes({ ...makeQuestion(), stem: '', explanation: '', difficulty: 'x' });
    expect(result).toEqual(
      expect.arrayContaining(['EMPTY_STEM', 'EMPTY_EXPLANATION', 'INVALID_DIFFICULTY']),
    );
  });
});

describe('validateBank', () => {
  it('rejects duplicate question ids across the bank', () => {
    const issues = validateBank([makeQuestion(), makeQuestion()]);
    expect(issues.map((issue) => issue.code)).toEqual(['DUPLICATE_QUESTION_ID']);
    expect(issues[0]?.questionId).toBe('clf-d1-9001');
  });

  it('labels unreadable entries by index', () => {
    const issues = validateBank([makeQuestion(), 42]);
    expect(issues[0]).toMatchObject({ questionId: '#1', code: 'NOT_AN_OBJECT' });
  });

  it('rejects a bank that is not an array', () => {
    expect(validateBank({})[0]?.code).toBe('NOT_AN_OBJECT');
  });
});
