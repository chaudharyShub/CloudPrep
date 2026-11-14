import type { Question } from './types';

export type OptionOutcome =
  /** Correct option the learner selected. */
  | 'correct-selected'
  /** Correct option the learner did not select. */
  | 'correct-missed'
  /** Incorrect option the learner selected. */
  | 'incorrect-selected'
  /** Incorrect option the learner left unselected. */
  | 'incorrect-unselected';

export interface AnswerEvaluation {
  isCorrect: boolean;
  /** Outcome per option id. */
  outcomes: Record<string, OptionOutcome>;
}

/** How many options the learner must select: 1 for single, the number of correct answers otherwise. */
export function requiredSelectionCount(question: Pick<Question, 'correctOptionIds'>): number {
  return question.correctOptionIds.length;
}

/**
 * Scores an answer. Exact-set match: every correct option and no incorrect option must be
 * selected. No partial credit (docs/DECISIONS.md D-012). Unknown ids count as incorrect.
 */
export function evaluateAnswer(
  question: Pick<Question, 'options' | 'correctOptionIds'>,
  selectedOptionIds: readonly string[],
): AnswerEvaluation {
  const correct = new Set(question.correctOptionIds);
  const selected = new Set(selectedOptionIds);
  const outcomes: Record<string, OptionOutcome> = {};
  for (const option of question.options) {
    const isCorrectOption = correct.has(option.id);
    const isSelected = selected.has(option.id);
    outcomes[option.id] = isCorrectOption
      ? isSelected
        ? 'correct-selected'
        : 'correct-missed'
      : isSelected
        ? 'incorrect-selected'
        : 'incorrect-unselected';
  }
  const optionIds = new Set(question.options.map((option) => option.id));
  const hasUnknownSelection = [...selected].some((id) => !optionIds.has(id));
  const isCorrect =
    !hasUnknownSelection &&
    selected.size === correct.size &&
    [...correct].every((id) => selected.has(id));
  return { isCorrect, outcomes };
}
