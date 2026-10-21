import { useEffect, useRef } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, ArrowRight, CircleCheck, CircleMinus, CircleX, Flag } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { buttonClasses } from '@/components/ui/buttonStyles';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SegmentedControl } from '@/components/ui/FormControls';
import type { AttemptQuestion, ExamAttempt } from '@/domain/exam/attempt';
import type { QuestionOutcome } from '@/domain/exam/scoring';
import { evaluateAnswer } from '@/domain/questions/evaluate';
import { cn } from '@/lib/cn';
import { useExamAttempts } from '@/state/hooks';
import { BookmarkButton } from '@/features/shared/question/BookmarkButton';
import { FeedbackPanel } from '@/features/shared/question/FeedbackPanel';
import { OptionList } from '@/features/shared/question/OptionList';
import { QuestionMeta } from '@/features/shared/question/QuestionMeta';
import { ResultsNotFound } from './ResultsPage';
import { useAttemptQuestion } from './useAttemptQuestion';

const FILTERS = ['incorrect', 'unanswered', 'correct', 'all'] as const;
type Filter = (typeof FILTERS)[number];

const OUTCOME_LABEL: Record<QuestionOutcome, string> = {
  correct: 'Correct',
  incorrect: 'Incorrect',
  unanswered: 'Not answered',
};
const OUTCOME_ICON = { correct: CircleCheck, incorrect: CircleX, unanswered: CircleMinus };
const OUTCOME_CLASS = {
  correct: 'text-success',
  incorrect: 'text-danger',
  unanswered: 'text-fg-subtle',
};

export function AnswerReviewPage() {
  const { attemptId } = useParams();
  const attempt = useExamAttempts().find((a) => a.id === attemptId);
  if (!attempt) return <ResultsNotFound />;
  return <AnswerReview attempt={attempt} />;
}

function AnswerReview({ attempt }: { attempt: ExamAttempt }) {
  const [params, setParams] = useSearchParams();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const counts = { ...attempt.summary, all: attempt.summary.total };

  // Default to the first non-empty group, so the page opens on something useful.
  const requested = params.get('filter');
  const filter: Filter = (FILTERS as readonly string[]).includes(requested ?? '')
    ? (requested as Filter)
    : (FILTERS.find((f) => f !== 'all' && counts[f] > 0) ?? 'all');
  const inFilter = attempt.questions.filter((q) => filter === 'all' || q.outcome === filter);
  const position = Math.min(
    Math.max(Number(params.get('q') ?? '0') || 0, 0),
    Math.max(inFilter.length - 1, 0),
  );
  const record = inFilter[position];

  const lastShown = useRef(record?.questionId);
  useEffect(() => {
    if (lastShown.current === record?.questionId) return;
    lastShown.current = record?.questionId;
    headingRef.current?.focus();
  }, [record?.questionId]);

  function show(nextFilter: Filter, index: number) {
    setParams({ filter: nextFilter, q: String(index) }, { replace: true });
  }

  return (
    <>
      <PageHeader
        title="Answer review"
        description="Every question with your answer, the correct answer, and why each option is right or wrong."
        actions={
          <Link to={`/results/${attempt.id}`} className={buttonClasses({ variant: 'secondary' })}>
            <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
            Back to results
          </Link>
        }
      />

      <div className="mb-6">
        <SegmentedControl
          label="Show"
          value={filter}
          onValueChange={(value) => {
            show(value, 0);
          }}
          options={[
            { value: 'incorrect', label: `Incorrect (${counts.incorrect})` },
            { value: 'unanswered', label: `Unanswered (${counts.unanswered})` },
            { value: 'correct', label: `Correct (${counts.correct})` },
            { value: 'all', label: `All (${counts.all})` },
          ]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0">
          {record ? (
            <>
              <ReviewedQuestion
                record={record}
                number={attempt.questions.indexOf(record) + 1}
                headingRef={headingRef}
              />
              <div className="mt-6 flex items-center justify-between gap-3">
                <Button
                  variant="secondary"
                  icon={ArrowLeft}
                  disabled={position === 0}
                  onClick={() => {
                    show(filter, position - 1);
                  }}
                >
                  Previous
                </Button>
                <span className="text-sm text-fg-muted tabular-nums">
                  {position + 1} of {inFilter.length}
                </span>
                <Button
                  icon={ArrowRight}
                  iconPosition="end"
                  disabled={position >= inFilter.length - 1}
                  onClick={() => {
                    show(filter, position + 1);
                  }}
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <EmptyState
                icon={CircleCheck}
                title={`No ${filter === 'all' ? '' : `${OUTCOME_LABEL[filter].toLowerCase()} `}questions`}
                description="Choose another filter above."
              />
            </Card>
          )}
        </div>

        <aside aria-label="All questions">
          <Card>
            <CardHeader as="h2" title="All questions" description="Select one to review it." />
            <CardBody>
              <ol className="grid grid-cols-6 gap-1.5 sm:grid-cols-10 lg:grid-cols-5">
                {attempt.questions.map((q, index) => {
                  const Icon = OUTCOME_ICON[q.outcome];
                  const current = q.questionId === record?.questionId;
                  return (
                    <li key={q.questionId}>
                      <button
                        type="button"
                        aria-label={`Question ${index + 1}: ${OUTCOME_LABEL[q.outcome].toLowerCase()}${q.flagged ? ', flagged' : ''}`}
                        aria-current={current ? 'true' : undefined}
                        onClick={() => {
                          show('all', index);
                        }}
                        className={cn(
                          'relative flex h-10 w-full items-center justify-center rounded-sm border border-border bg-surface text-sm text-fg-muted tabular-nums hover:bg-surface-2',
                          current && 'ring-2 ring-fg ring-offset-2 ring-offset-bg',
                        )}
                      >
                        {index + 1}
                        <Icon
                          size={11}
                          strokeWidth={2.5}
                          aria-hidden="true"
                          className={cn('absolute bottom-0.5 left-0.5', OUTCOME_CLASS[q.outcome])}
                        />
                      </button>
                    </li>
                  );
                })}
              </ol>
              <ul
                className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-fg-muted"
                aria-label="Legend"
              >
                {(['correct', 'incorrect', 'unanswered'] as const).map((outcome) => {
                  const Icon = OUTCOME_ICON[outcome];
                  return (
                    <li key={outcome} className="flex items-center gap-1.5">
                      <Icon size={13} aria-hidden="true" className={OUTCOME_CLASS[outcome]} />
                      {OUTCOME_LABEL[outcome]}
                    </li>
                  );
                })}
              </ul>
            </CardBody>
          </Card>
        </aside>
      </div>
    </>
  );
}

function ReviewedQuestion({
  record,
  number,
  headingRef,
}: {
  record: AttemptQuestion;
  number: number;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const { question, source } = useAttemptQuestion(record);
  const Icon = OUTCOME_ICON[record.outcome];
  const stemId = `review-${record.questionId}-stem`;
  const statusId = `review-${record.questionId}-status`;
  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="flex flex-wrap items-center gap-2 text-base font-semibold text-fg"
          >
            <Icon size={20} aria-hidden="true" className={OUTCOME_CLASS[record.outcome]} />
            Question {number} · {OUTCOME_LABEL[record.outcome]}
            {record.flagged && (
              <Badge tone="warning">
                <Flag size={12} aria-hidden="true" />
                Flagged
              </Badge>
            )}
          </h2>
          {question && <BookmarkButton questionId={question.id} />}
        </div>
        {question ? (
          <>
            <QuestionMeta question={question} />
            {source === 'bank-newer' && (
              <p className="text-xs text-fg-subtle">
                This question has been updated since your exam and the original wording wasn&apos;t
                saved. Your result is unchanged; the current version is shown.
              </p>
            )}
            <p id={stemId} className="text-base leading-relaxed text-fg">
              {question.stem}
            </p>
            <span id={statusId} className="sr-only">
              {OUTCOME_LABEL[record.outcome]}
            </span>
            <OptionList
              type={question.type}
              options={question.options}
              order={record.optionOrder}
              selected={record.selectedOptionIds}
              outcomes={evaluateAnswer(question, record.selectedOptionIds).outcomes}
              onToggle={() => undefined}
              name={`review-${record.questionId}`}
              legendId={stemId}
              instructionsId={statusId}
            />
            <FeedbackPanel question={question} result={record.outcome} />
          </>
        ) : (
          <p className="text-sm text-fg-muted">
            This question is no longer available. Your result for it is unchanged.
          </p>
        )}
      </CardBody>
    </Card>
  );
}
