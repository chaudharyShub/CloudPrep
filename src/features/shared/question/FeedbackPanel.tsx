import type { Ref } from 'react';
import { CircleCheck, CircleMinus, CircleX } from 'lucide-react';
import { ExternalLink } from '@/components/ui/ExternalLink';
import type { Question } from '@/domain/questions/types';
import { cn } from '@/lib/cn';

export interface FeedbackPanelProps {
  question: Question;
  result: 'correct' | 'incorrect' | 'unanswered';
  /** The heading receives focus after checking, so the result is announced. */
  headingRef?: Ref<HTMLHeadingElement>;
}

/** Shown after an answer is checked: result, explanation and sources. */
export function FeedbackPanel({ question, result, headingRef }: FeedbackPanelProps) {
  const isCorrect = result === 'correct';
  const Icon = isCorrect ? CircleCheck : result === 'unanswered' ? CircleMinus : CircleX;
  const headingId = `${question.id}-feedback`;
  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        'rounded-lg border p-5',
        isCorrect ? 'border-success/40 bg-success-subtle' : 'border-danger/40 bg-danger-subtle',
      )}
    >
      <h3
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className={cn(
          'flex items-center gap-2 text-base font-semibold',
          isCorrect ? 'text-success' : 'text-danger',
        )}
      >
        <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
        {isCorrect ? 'Correct' : result === 'unanswered' ? 'Not answered' : 'Incorrect'}
      </h3>
      <p className="mt-2 text-sm text-fg">{question.explanation}</p>
      <div className="mt-4 border-t border-border pt-3">
        <h4 className="text-xs font-medium tracking-wide text-fg-subtle uppercase">Sources</h4>
        <ul className="mt-2 flex flex-col gap-1.5 text-sm">
          {question.references.map((reference) => (
            <li key={reference.url}>
              <ExternalLink href={reference.url}>{reference.title}</ExternalLink>
            </li>
          ))}
        </ul>
        {question.review.status === 'unverified' && (
          <p className="mt-3 text-xs text-fg-subtle">
            Written from the AWS pages above on {question.review.lastVerified}, but not yet checked
            line by line against them. If anything here disagrees with AWS documentation, trust the
            documentation.
          </p>
        )}
        {question.review.status === 'checked' && (
          <p className="mt-3 text-xs text-fg-subtle">
            Checked against the sources above on {question.review.lastVerified}. Not yet reviewed by
            a second person.
          </p>
        )}
      </div>
    </section>
  );
}
