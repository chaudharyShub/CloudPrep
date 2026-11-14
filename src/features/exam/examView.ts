import { answerState, type ExamSession } from '@/domain/exam/session';
import type { Question, QuestionType } from '@/domain/questions/types';

/**
 * What the exam screen is allowed to know about a question: no correct answers and no
 * explanations, so nothing in the page can reveal the answer before submission.
 */
export interface ExamQuestionView {
  readonly id: string;
  readonly type: QuestionType;
  readonly stem: string;
  readonly options: readonly { readonly id: string; readonly text: string }[];
}

export function toExamView(question: Question): ExamQuestionView {
  return {
    id: question.id,
    type: question.type,
    stem: question.stem,
    options: question.options.map(({ id, text }) => ({ id, text })),
  };
}

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six'];

export function selectionInstruction(required: number): string {
  return required === 1
    ? 'Select one answer.'
    : `Select ${NUMBER_WORDS[required] ?? String(required)} answers.`;
}

const STATE_TEXT = {
  unanswered: 'not answered',
  incomplete: 'partly answered',
  answered: 'answered',
} as const;

/** Spoken status for a question, e.g. "answered, flagged". */
export function questionStatusLabel(exam: ExamSession, questionId: string): string {
  const state = STATE_TEXT[answerState(exam, questionId)];
  return exam.flagged.includes(questionId) ? `${state}, flagged` : state;
}
