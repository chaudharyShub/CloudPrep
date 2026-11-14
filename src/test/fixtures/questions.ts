import type { Question } from '@/domain/questions/types';

/** A valid single-answer question; override fields to build test cases. */
export function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: 'clf-d1-9001',
    revision: 1,
    type: 'single',
    stem: 'Fixture question?',
    options: [
      { id: 'a', text: 'Right', explanation: 'Because it is right.' },
      { id: 'b', text: 'Wrong one', explanation: 'Not this.' },
      { id: 'c', text: 'Wrong two', explanation: 'Not this either.' },
      { id: 'd', text: 'Wrong three', explanation: 'Nor this.' },
    ],
    correctOptionIds: ['a'],
    explanation: 'A is right.',
    domain: 'D1',
    taskStatement: '1.1',
    difficulty: 'easy',
    tags: [],
    references: [{ title: 'Docs', url: 'https://docs.aws.amazon.com/example.html' }],
    review: { status: 'checked', lastVerified: '2026-10-21' },
    ...overrides,
  };
}

/** A valid multiple-response question with two correct answers out of five. */
export function makeMultiQuestion(overrides: Partial<Question> = {}): Question {
  return makeQuestion({
    id: 'clf-d2-9002',
    type: 'multiple',
    domain: 'D2',
    taskStatement: '2.1',
    options: [
      { id: 'a', text: 'Right A', explanation: 'Yes.' },
      { id: 'b', text: 'Right B', explanation: 'Yes.' },
      { id: 'c', text: 'Wrong C', explanation: 'No.' },
      { id: 'd', text: 'Wrong D', explanation: 'No.' },
      { id: 'e', text: 'Wrong E', explanation: 'No.' },
    ],
    correctOptionIds: ['a', 'b'],
    ...overrides,
  });
}
