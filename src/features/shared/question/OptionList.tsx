import { Check, X } from 'lucide-react';
import type { OptionOutcome } from '@/domain/questions/evaluate';
import type { QuestionType } from '@/domain/questions/types';

/** Only what's needed to render an option. Exam mode passes options without explanations. */
export interface OptionView {
  readonly id: string;
  readonly text: string;
  readonly explanation?: string;
}
import { cn } from '@/lib/cn';

export interface OptionListProps {
  type: QuestionType;
  options: readonly OptionView[];
  /** Option ids in display order. */
  order: readonly string[];
  selected: readonly string[];
  /** When set, the answer has been checked: inputs lock and outcomes + explanations show. */
  outcomes: Readonly<Record<string, OptionOutcome>> | null;
  onToggle: (optionId: string) => void;
  /** Unique name for the radio group. */
  name: string;
  legendId: string;
  instructionsId: string;
}

const OUTCOME_LABEL: Record<OptionOutcome, string | null> = {
  'correct-selected': 'Correct · your answer',
  'correct-missed': 'Correct answer · not selected',
  'incorrect-selected': 'Incorrect · your answer',
  'incorrect-unselected': null,
};

/**
 * Answer options as native radio buttons (single answer) or checkboxes (multiple response),
 * so arrow keys, Space, and screen readers work as expected.
 */
export function OptionList({
  type,
  options,
  order,
  selected,
  outcomes,
  onToggle,
  name,
  legendId,
  instructionsId,
}: OptionListProps) {
  const optionsById = new Map(options.map((option) => [option.id, option]));
  const isChecked = outcomes !== null;
  const inputType = type === 'single' ? 'radio' : 'checkbox';

  return (
    <fieldset aria-labelledby={legendId} aria-describedby={instructionsId} className="min-w-0">
      <ul className="flex flex-col gap-3">
        {order.map((optionId, index) => {
          const option = optionsById.get(optionId);
          if (!option) return null;
          const outcome = outcomes?.[optionId] ?? null;
          const isSelected = selected.includes(optionId);
          const isCorrectOption = outcome === 'correct-selected' || outcome === 'correct-missed';
          const label = outcome ? OUTCOME_LABEL[outcome] : null;
          const inputId = `${name}-${optionId}`;
          const letter = String.fromCharCode(65 + index);

          return (
            <li key={optionId}>
              <label
                htmlFor={inputId}
                className={cn(
                  'relative flex items-start gap-4 rounded-md border p-4 transition-colors sm:px-5',
                  !isChecked && 'cursor-pointer',
                  !isChecked && !isSelected && 'hover:border-border-strong hover:bg-surface-2',
                  !isChecked &&
                    (isSelected
                      ? 'border-accent bg-highlight shadow-[inset_0_0_0_1px_var(--cp-accent)]'
                      : 'border-border bg-surface'),
                  isChecked && isCorrectOption && 'border-success/60 bg-success-subtle',
                  isChecked &&
                    outcome === 'incorrect-selected' &&
                    'border-danger/60 bg-danger-subtle',
                  isChecked && outcome === 'incorrect-unselected' && 'border-border bg-surface',
                  'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus',
                )}
              >
                <input
                  id={inputId}
                  type={inputType}
                  name={name}
                  value={optionId}
                  checked={isSelected}
                  disabled={isChecked}
                  onChange={() => {
                    onToggle(optionId);
                  }}
                  // Invisible but covering the whole row, so it is what gets clicked and focused.
                  className="absolute inset-0 m-0 size-full cursor-pointer opacity-0 disabled:cursor-default"
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center text-sm font-bold',
                    inputType === 'radio' ? 'rounded-full' : 'rounded-sm',
                    isSelected
                      ? 'bg-accent text-on-accent'
                      : 'border-[1.5px] border-border-strong text-fg-muted',
                  )}
                >
                  {letter}
                </span>
                <span className="min-w-0 flex-1 pt-1">
                  <span className="flex flex-wrap items-start gap-x-3 gap-y-1">
                    <span className={cn('text-[1.0625rem] text-fg', isSelected && 'font-semibold')}>
                      {option.text}
                    </span>
                    {label && (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap',
                          isCorrectOption ? 'text-success' : 'text-danger',
                        )}
                      >
                        {isCorrectOption ? (
                          <Check size={14} strokeWidth={2} aria-hidden="true" />
                        ) : (
                          <X size={14} strokeWidth={2} aria-hidden="true" />
                        )}
                        {label}
                      </span>
                    )}
                  </span>
                  {isChecked && option.explanation && (
                    <span className="mt-2 block text-sm text-fg-muted">{option.explanation}</span>
                  )}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
