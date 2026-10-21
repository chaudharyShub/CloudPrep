import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { CircleCheck, CircleMinus, CircleX, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { buttonClasses } from '@/components/ui/buttonStyles';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { DOMAINS } from '@/domain/exam-guide/clf-c02';
import { summarizeSession, type PracticeSession } from '@/domain/practice/session';
import type { Question } from '@/domain/questions/types';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatPercent } from '@/lib/format';

export interface SessionSummaryViewProps {
  session: PracticeSession;
  questionsById: ReadonlyMap<string, Question>;
  onRetry: (questionIds: string[]) => void;
}

export function SessionSummaryView({ session, questionsById, onRetry }: SessionSummaryViewProps) {
  useDocumentTitle('Session summary');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const summary = summarizeSession(session, questionsById, session.finishedAt ?? session.startedAt);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  if (session.questionIds.length === 0) {
    return (
      <Card className="mx-auto max-w-prose">
        <EmptyState
          icon={CircleMinus}
          title="No questions to practise"
          description="None of the selected questions are available any more. Choose another set in Learning mode."
          action={
            <Link to="/practice" className={buttonClasses({ variant: 'secondary' })}>
              Back to Learning mode
            </Link>
          }
        />
      </Card>
    );
  }

  const percent = summary.answered === 0 ? null : summary.correct / summary.answered;
  const skipped = summary.total - summary.answered;

  return (
    <div className="mx-auto max-w-prose">
      <p className="text-sm text-fg-muted">{session.label}</p>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl"
      >
        Session complete
      </h1>

      <Card className="mt-6">
        <CardBody>
          {summary.answered === 0 ? (
            <p className="text-sm text-fg-muted">
              You didn&apos;t check any answers in this session, so nothing was recorded.
            </p>
          ) : (
            <>
              <p className="text-4xl font-semibold text-fg tabular-nums">
                {summary.correct}
                <span className="text-2xl text-fg-muted">/{summary.answered}</span>
              </p>
              <p className="mt-1 text-sm text-fg-muted">
                {formatPercent(percent)} correct
                {skipped > 0 && ` · ${skipped} not answered`}
              </p>
              <ProgressBar
                label="Session score"
                value={summary.correct}
                max={summary.answered}
                valueText={`${summary.correct} of ${summary.answered} correct`}
                tone="success"
                size="md"
                className="mt-4"
              />
            </>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            {summary.incorrectQuestionIds.length > 0 && (
              <Button
                icon={RotateCcw}
                onClick={() => {
                  onRetry([...summary.incorrectQuestionIds]);
                }}
              >
                Retry incorrect ({summary.incorrectQuestionIds.length})
              </Button>
            )}
            <Link
              to="/practice"
              className={buttonClasses({
                variant: summary.incorrectQuestionIds.length > 0 ? 'secondary' : 'primary',
              })}
            >
              Back to Learning mode
            </Link>
          </div>
        </CardBody>
      </Card>

      {summary.answered > 0 && (
        <Card className="mt-6">
          <CardHeader title="By domain" />
          <CardBody>
            <ul className="flex flex-col gap-3 text-sm">
              {DOMAINS.filter((domain) => summary.byDomain[domain.id]).map((domain) => {
                const tally = summary.byDomain[domain.id] ?? { answered: 0, correct: 0 };
                return (
                  <li key={domain.id} className="flex items-center justify-between gap-4">
                    <span className="text-fg">{domain.name}</span>
                    <span className="text-fg-muted tabular-nums">
                      {tally.correct}/{tally.answered} correct
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader title="Questions" />
        <CardBody>
          <ol className="flex flex-col divide-y divide-border">
            {session.questionIds.map((id, index) => {
              const question = questionsById.get(id);
              const answer = session.answers[id];
              const result = answer?.result ?? null;
              const correctTexts = question
                ? question.options
                    .filter((option) => question.correctOptionIds.includes(option.id))
                    .map((option) => option.text)
                : [];
              return (
                <li key={id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  {result === 'correct' ? (
                    <CircleCheck
                      size={18}
                      className="mt-0.5 shrink-0 text-success"
                      aria-hidden="true"
                    />
                  ) : result === 'incorrect' ? (
                    <CircleX size={18} className="mt-0.5 shrink-0 text-danger" aria-hidden="true" />
                  ) : (
                    <CircleMinus
                      size={18}
                      className="mt-0.5 shrink-0 text-fg-subtle"
                      aria-hidden="true"
                    />
                  )}
                  <div className="min-w-0 text-sm">
                    <p className="text-fg">
                      <span className="sr-only">
                        {result === 'correct'
                          ? 'Correct: '
                          : result === 'incorrect'
                            ? 'Incorrect: '
                            : 'Not answered: '}
                      </span>
                      <span className="text-fg-subtle tabular-nums">{index + 1}. </span>
                      {question?.stem ?? 'This question is no longer available.'}
                    </p>
                    {result === 'incorrect' && correctTexts.length > 0 && (
                      <p className="mt-1 text-fg-muted">
                        Correct answer{correctTexts.length > 1 ? 's' : ''}:{' '}
                        {correctTexts.join('; ')}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </CardBody>
      </Card>
    </div>
  );
}
