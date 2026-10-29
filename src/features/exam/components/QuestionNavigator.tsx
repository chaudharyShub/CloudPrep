import { Check, CircleDashed, Flag } from 'lucide-react';
import { answerState, type ExamSession } from '@/domain/exam/session';
import { questionStatusLabel } from '../examView';
import { cn } from '@/lib/cn';

/**
 * The answer sheet: a grid of question buttons in the exam-paper style (square cells, mono
 * numbers, D-057). Each state has its own icon and text label (not colour alone):
 * answered = filled with a check, partly answered = dashed, flagged = flag on orange,
 * current = outline ring.
 */
export function QuestionNavigator({
  exam,
  onSelect,
}: {
  exam: ExamSession;
  onSelect: (index: number) => void;
}) {
  return (
    <div>
      <ol className="grid grid-cols-6 gap-1 sm:grid-cols-8">
        {exam.questionIds.map((id, index) => {
          const state = answerState(exam, id);
          const flagged = exam.flagged.includes(id);
          const current = index === exam.currentIndex;
          return (
            <li key={id}>
              <button
                type="button"
                aria-label={`Question ${index + 1}: ${questionStatusLabel(exam, id)}`}
                aria-current={current ? 'step' : undefined}
                onClick={() => {
                  onSelect(index);
                }}
                className={cn(
                  'relative flex h-9 w-full items-center justify-center rounded-none border font-mono text-xs transition-colors',
                  state === 'answered' &&
                    !flagged &&
                    'border-accent bg-accent font-semibold text-on-accent',
                  state === 'incomplete' &&
                    !flagged &&
                    'border-dashed border-accent bg-surface text-fg',
                  state === 'unanswered' &&
                    !flagged &&
                    'border-border bg-surface text-fg-subtle hover:bg-surface-2',
                  flagged && 'border-dashed border-flag-border bg-flag text-on-flag',
                  current && 'ring-2 ring-accent ring-offset-2 ring-offset-surface',
                )}
              >
                {index + 1}
                {state === 'answered' && (
                  <Check
                    size={11}
                    strokeWidth={3}
                    aria-hidden="true"
                    className={cn(
                      'absolute bottom-0.5 left-0.5',
                      flagged ? 'text-on-flag' : 'text-on-accent',
                    )}
                  />
                )}
                {state === 'incomplete' && (
                  <CircleDashed
                    size={11}
                    strokeWidth={2.5}
                    aria-hidden="true"
                    className="absolute bottom-0.5 left-0.5 text-accent-fg"
                  />
                )}
                {flagged && (
                  <Flag
                    size={11}
                    strokeWidth={2.5}
                    aria-hidden="true"
                    className="absolute top-0.5 right-0.5 fill-current text-on-flag"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>
      <NavigatorLegend />
    </div>
  );
}

function NavigatorLegend() {
  return (
    <ul
      className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-fg-muted"
      aria-label="Legend"
    >
      <li className="flex items-center gap-1.5">
        <span aria-hidden="true" className="flex size-3.5 items-center justify-center bg-accent">
          <Check size={10} strokeWidth={3.5} className="text-on-accent" />
        </span>
        Answered
      </li>
      <li className="flex items-center gap-1.5">
        <CircleDashed size={13} strokeWidth={2.5} aria-hidden="true" className="text-accent-fg" />
        Partly answered
      </li>
      <li className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="flex size-3.5 items-center justify-center border border-dashed border-flag-border bg-flag"
        >
          <Flag size={9} strokeWidth={2.5} className="fill-current text-on-flag" />
        </span>
        Flagged
      </li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden="true" className="size-3 ring-2 ring-accent" />
        Current
      </li>
    </ul>
  );
}
