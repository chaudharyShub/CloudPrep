import { describe, expect, it } from 'vitest';
import { makeMultiQuestion, makeQuestion } from '@/test/fixtures/questions';
import { evaluateAnswer, requiredSelectionCount } from './evaluate';

describe('evaluateAnswer: single answer', () => {
  const question = makeQuestion();

  it('is correct only for the correct option', () => {
    expect(evaluateAnswer(question, ['a']).isCorrect).toBe(true);
    expect(evaluateAnswer(question, ['b']).isCorrect).toBe(false);
  });

  it('treats no selection as incorrect', () => {
    const result = evaluateAnswer(question, []);
    expect(result.isCorrect).toBe(false);
    expect(result.outcomes['a']).toBe('correct-missed');
  });

  it('reports an outcome for every option', () => {
    expect(evaluateAnswer(question, ['b']).outcomes).toEqual({
      a: 'correct-missed',
      b: 'incorrect-selected',
      c: 'incorrect-unselected',
      d: 'incorrect-unselected',
    });
  });

  it('rejects unknown option ids even alongside the right one', () => {
    expect(evaluateAnswer(question, ['a', 'zzz']).isCorrect).toBe(false);
  });
});

describe('evaluateAnswer: multiple response', () => {
  const question = makeMultiQuestion();

  it('requires the exact set of correct options, in any order', () => {
    expect(evaluateAnswer(question, ['a', 'b']).isCorrect).toBe(true);
    expect(evaluateAnswer(question, ['b', 'a']).isCorrect).toBe(true);
  });

  it('gives no partial credit for a subset', () => {
    const result = evaluateAnswer(question, ['a']);
    expect(result.isCorrect).toBe(false);
    expect(result.outcomes['b']).toBe('correct-missed');
  });

  it('is incorrect for a superset', () => {
    const result = evaluateAnswer(question, ['a', 'b', 'c']);
    expect(result.isCorrect).toBe(false);
    expect(result.outcomes['c']).toBe('incorrect-selected');
  });

  it('is incorrect when one right and one wrong are chosen', () => {
    expect(evaluateAnswer(question, ['a', 'c']).isCorrect).toBe(false);
  });

  it('ignores duplicate ids in the selection', () => {
    expect(evaluateAnswer(question, ['a', 'a', 'b']).isCorrect).toBe(true);
  });
});

describe('requiredSelectionCount', () => {
  it('is 1 for single-answer and the number of correct answers otherwise', () => {
    expect(requiredSelectionCount(makeQuestion())).toBe(1);
    expect(requiredSelectionCount(makeMultiQuestion())).toBe(2);
    expect(requiredSelectionCount(makeMultiQuestion({ correctOptionIds: ['a', 'b', 'c'] }))).toBe(
      3,
    );
  });
});
