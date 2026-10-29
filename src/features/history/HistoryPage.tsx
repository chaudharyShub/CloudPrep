import { Link } from 'react-router';
import { ChevronRight, History } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { buttonClasses } from '@/components/ui/buttonStyles';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime } from '@/lib/format';
import { useExamAttempts } from '@/state/hooks';

export function HistoryPage() {
  const attempts = useExamAttempts();
  return (
    <>
      <PageHeader
        title="Exam history"
        description="Your submitted mock exams in this browser, newest first."
      />
      <Card>
        {attempts.length === 0 ? (
          <EmptyState
            icon={History}
            title="No exam attempts yet"
            description="Each mock exam you submit will be listed here, so you can review answers and track your scores."
            action={
              <Link to="/exam" className={buttonClasses({ variant: 'secondary' })}>
                Go to mock exam
              </Link>
            }
            className="py-16"
          />
        ) : (
          <ul className="divide-y divide-border">
            {attempts.map((attempt) => {
              const score = attempt.summary;
              return (
                <li key={attempt.id}>
                  <Link
                    to={`/results/${attempt.id}`}
                    className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-2"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-fg">
                          {attempt.kind === 'short' ? 'Shorter exam' : 'Full exam'} · {score.total}{' '}
                          questions
                        </span>
                        {attempt.submitReason === 'proctor_ended' ? (
                          <Badge tone="danger">Ended by proctor</Badge>
                        ) : (
                          attempt.submitReason !== 'manual' && <Badge>Time ran out</Badge>
                        )}
                      </span>
                      <span className="mt-0.5 block text-sm text-fg-muted">
                        {formatDateTime(attempt.submittedAt)}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block text-lg font-semibold text-fg tabular-nums">
                        {score.percent}%
                      </span>
                      <span
                        className={`block text-xs ${attempt.benchmarkMet ? 'text-success' : 'text-fg-muted'}`}
                      >
                        {attempt.benchmarkMet ? 'Benchmark met' : 'Benchmark not met'} (
                        {attempt.benchmarkPercent}%)
                      </span>
                    </span>
                    <ChevronRight
                      size={18}
                      strokeWidth={1.75}
                      aria-hidden="true"
                      className="shrink-0 text-fg-subtle group-hover:text-fg-muted"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
