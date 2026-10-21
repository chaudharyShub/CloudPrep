import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Check, CircleDashed, Flag, Send } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SegmentedControl } from '@/components/ui/FormControls';
import { answerState, examCounts } from '@/domain/exam/session';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { EXAM_QUESTIONS_BY_ID } from '@/state/examQuestions';
import { useAppStore } from '@/state/StoreProvider';
import { useExamOutlet } from '@/app/layouts/ExamLayout';

type Filter = 'all' | 'unanswered' | 'flagged';

/** Pre-submission review: every question's status, with filters and jump-to links. */
export function ExamReviewPage() {
  const { exam } = useExamOutlet();
  const store = useAppStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');
  useDocumentTitle('Review answers · Exam');

  const counts = examCounts(exam);
  const notAnswered = counts.unanswered + counts.incomplete;
  const rows = exam.questionIds
    .map((id, index) => ({
      id,
      index,
      state: answerState(exam, id),
      flagged: exam.flagged.includes(id),
    }))
    .filter((row) =>
      filter === 'all' ? true : filter === 'flagged' ? row.flagged : row.state !== 'answered',
    );

  function open(index: number) {
    store.dispatchExam({ type: 'goTo', index });
    void navigate('/exam/session');
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-4 pb-16 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">Review your answers</h1>
          <p className="mt-1 text-sm text-fg-muted">
            Select a question to go back to it. Nothing is submitted until you choose Submit exam.
          </p>
        </div>
        <Button
          variant="secondary"
          icon={ArrowLeft}
          onClick={() => {
            void navigate('/exam/session');
          }}
        >
          Back to questions
        </Button>
      </div>

      <dl className="mb-6 grid grid-cols-3 gap-3">
        {[
          { label: 'Answered', value: counts.answered },
          { label: 'Not answered', value: notAnswered },
          { label: 'Flagged', value: counts.flagged },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-surface p-4">
            <dt className="text-sm text-fg-muted">{stat.label}</dt>
            <dd className="mt-1 text-2xl font-semibold text-fg tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mb-4">
        <SegmentedControl
          label="Show"
          value={filter}
          onValueChange={setFilter}
          options={[
            { value: 'all', label: `All (${counts.total})` },
            { value: 'unanswered', label: `Not answered (${notAnswered})` },
            { value: 'flagged', label: `Flagged (${counts.flagged})` },
          ]}
        />
      </div>

      <Card>
        {rows.length === 0 ? (
          <EmptyState
            icon={Check}
            headingLevel="h2"
            title={filter === 'flagged' ? 'No flagged questions' : 'Every question is answered'}
            description="Choose another filter, go back to the questions, or submit your exam."
            className="py-10"
          />
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((row) => {
              const stem = EXAM_QUESTIONS_BY_ID.get(row.id)?.stem ?? 'Question unavailable';
              return (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => {
                      open(row.index);
                    }}
                    className="flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-2"
                  >
                    <span className="w-8 shrink-0 text-sm font-semibold text-fg-muted tabular-nums">
                      {row.index + 1}.
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-sm text-fg">{stem}</span>
                      <span className="mt-2 flex flex-wrap gap-2">
                        {row.state === 'answered' && (
                          <Badge tone="accent">
                            <Check size={12} strokeWidth={3} aria-hidden="true" />
                            Answered
                          </Badge>
                        )}
                        {row.state === 'incomplete' && (
                          <Badge tone="warning">
                            <CircleDashed size={12} strokeWidth={2.5} aria-hidden="true" />
                            Partly answered
                          </Badge>
                        )}
                        {row.state === 'unanswered' && <Badge>Not answered</Badge>}
                        {row.flagged && (
                          <Badge tone="warning">
                            <Flag size={12} strokeWidth={2.5} aria-hidden="true" />
                            Flagged
                          </Badge>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <div className="mt-6 flex justify-end">
        <Button icon={Send} onClick={() => store.dispatchExam({ type: 'requestFinish' })}>
          Finish exam
        </Button>
      </div>
    </div>
  );
}
