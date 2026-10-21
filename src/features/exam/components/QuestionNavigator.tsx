import { Check, CircleDashed, Flag } from 'lucide-react';
import { answerState, type ExamSession } from '@/domain/exam/session';
import { questionStatusLabel } from '../examView';
import { cn } from '@/lib/cn';

/**
 * Grid of question buttons. Each state has its own icon and text label (not colour alone):
 * answered = check, partly answered = dashed circle, flagged = flag, current = outline ring.
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
      <ol className="grid grid-cols-6 gap-1.5 sm:grid-cols-8 lg:grid-cols-5">
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
                  'relative flex h-10 w-full items-center justify-center rounded-sm border text-sm tabular-nums transition-colors',
                  state === 'answered' && 'border-accent/50 bg-accent-subtle font-semibold text-fg',
                  state === 'incomplete' && 'border-dashed border-accent/70 bg-surface text-fg',
                  state === 'unanswered' &&
                    'border-border-control bg-surface text-fg-muted hover:bg-surface-2',
                  current && 'ring-2 ring-fg ring-offset-2 ring-offset-bg',
                )}
              >
                {index + 1}
                {state === 'answered' && (
                  <Check
                    size={11}
                    strokeWidth={3}
                    aria-hidden="true"
                    className="absolute bottom-0.5 left-0.5 text-accent-fg"
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
                    className="absolute top-0.5 right-0.5 fill-warning text-warning"
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
        <Check size={13} strokeWidth={3} aria-hidden="true" className="text-accent-fg" />
        Answered
      </li>
      <li className="flex items-center gap-1.5">
        <CircleDashed size={13} strokeWidth={2.5} aria-hidden="true" className="text-accent-fg" />
        Partly answered
      </li>
      <li className="flex items-center gap-1.5">
        <Flag
          size={13}
          strokeWidth={2.5}
          aria-hidden="true"
          className="fill-warning text-warning"
        />
        Flagged
      </li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden="true" className="size-3 rounded-[3px] ring-2 ring-fg" />
        Current
      </li>
    </ul>
  );
}
