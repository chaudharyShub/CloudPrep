import type { DomainId, ExamGuide } from '@/domain/exam-guide/types';
import type { Difficulty, Question } from '@/domain/questions/types';

const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'];

/**
 * Placeholder questions for one exam, `perDomain[d]` per domain, spread over its task
 * statements (every fourth, from the third, is multiple response). They only fill the sample bank (D-072) so
 * the app has enough questions to run a full exam; they teach nothing.
 */
export function placeholderQuestions(
  exam: ExamGuide,
  perDomain: Readonly<Record<DomainId, number>>,
): Question[] {
  const questions: Question[] = [];
  for (const domain of exam.domains) {
    for (let i = 0; i < perDomain[domain.id]; i++) {
      const task = domain.taskStatements[i % domain.taskStatements.length];
      if (!task) continue;
      const id = `${exam.questionPrefix}-d${domain.number}-${String(i + 1).padStart(4, '0')}`;
      const multiple = i % 4 === 2;
      const stem = `Sample question for task ${task.id} (${task.title}). Which ${
        multiple ? 'two options are' : 'option is'
      } marked correct? (Select ${multiple ? 'TWO' : 'ONE'}.)`;
      const wrong = (letter: string) => ({
        id: letter,
        text: `Sample incorrect option ${letter.toUpperCase()}`,
        explanation: `Option ${letter.toUpperCase()} of ${id} is marked incorrect.`,
      });
      const right = (letter: string) => ({
        id: letter,
        text: `Sample correct option ${letter.toUpperCase()}`,
        explanation: `Option ${letter.toUpperCase()} of ${id} is marked correct.`,
      });
      questions.push({
        id,
        revision: 1,
        type: multiple ? 'multiple' : 'single',
        stem,
        options: multiple
          ? [right('a'), wrong('b'), right('c'), wrong('d'), wrong('e')]
          : [wrong('a'), right('b'), wrong('c'), wrong('d')],
        correctOptionIds: multiple ? ['a', 'c'] : ['b'],
        explanation:
          'Placeholder from the public sample bank. The real questions are kept privately.',
        domain: domain.id,
        taskStatement: task.id,
        difficulty: DIFFICULTIES[i % DIFFICULTIES.length] ?? 'easy',
        tags: ['sample'],
        references: [{ title: `${exam.code} exam guide`, url: exam.guideUrl }],
        review: { status: 'checked', lastVerified: '2026-11-14' },
      });
    }
  }
  return questions;
}

/** Replaces placeholders with hand-written questions that have the same id. */
export function withWritten(
  placeholders: readonly Question[],
  written: readonly Question[],
): Question[] {
  const byId = new Map(written.map((q) => [q.id, q]));
  return placeholders.map((q) => byId.get(q.id) ?? q);
}
