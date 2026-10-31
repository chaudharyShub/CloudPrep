import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router';
import { History, Target } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { buttonClasses } from '@/components/ui/buttonStyles';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ExternalLink } from '@/components/ui/ExternalLink';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  assessReadiness,
  countedAttempts,
  MIN_ATTEMPTS_FOR_GUIDANCE,
} from '@/domain/analytics/readiness';
import { FULL_EXAM } from '@/domain/exam/config';
import { DOMAINS, EXAM_GUIDE_URL } from '@/domain/exam-guide/clf-c02';
import { practiceStats, weakestDomain } from '@/domain/practice/progress';
import { reviewOverview } from '@/domain/practice/review';
import { questionCount, reviewSessionSetup } from '@/features/practice/reviewSession';
import { SESSION_PATH, sessionState } from '@/features/practice/sessionSetup';
import { useNow } from '@/hooks/useNow';
import { cn } from '@/lib/cn';
import { formatDateTime, formatMinutes, formatPercent } from '@/lib/format';
import type { ExamConfig } from '@/domain/exam/config';
import { ReviewDueInfo } from '@/features/practice/ReviewDueInfo';
import {
  useExamAttempts,
  useExamQuestions,
  usePracticeQuestions,
  useUserData,
} from '@/state/hooks';

interface QuickAction {
  to: string;
  title: string;
  description: string;
  /** Drawn as the page's main suggestion (Review due when something is due). */
  emphasis?: boolean;
  /** A count shown as a pill, e.g. questions due. */
  count?: number;
  /** Router state, e.g. a practice session to start. */
  state?: unknown;
  /** An "i" button shown beside the row, outside the link. */
  info?: ReactNode;
}

const MINUTE = 60_000;

/** The timed exam on offer: the full exam, or the shorter one while the bank is too small. */
function examAction(fullAvailable: boolean, shortConfig: ExamConfig | null): QuickAction {
  return fullAvailable || !shortConfig
    ? {
        to: '/exam',
        title: 'Timed mock exam',
        description: `${FULL_EXAM.questionCount} questions · ${FULL_EXAM.durationMs / MINUTE} minutes`,
      }
    : {
        to: '/exam',
        title: 'Timed mock exam (shorter)',
        description: `${shortConfig.questionCount} questions · ${shortConfig.durationMs / MINUTE} minutes`,
      };
}

const OTHER_ACTIONS: readonly QuickAction[] = [
  {
    to: '/practice',
    title: 'Learning mode',
    description: 'Untimed, with instant feedback and explanations',
  },
  {
    to: '/bookmarks',
    title: 'Bookmarked questions',
    description: 'Questions you saved for later',
  },
];

/** "Review due" (D-052): starts the review session, or opens Learning mode when nothing is due. */
function reviewAction(due: number, setup: ReturnType<typeof reviewSessionSetup>): QuickAction {
  return setup
    ? {
        to: SESSION_PATH,
        title: 'Review due',
        description: `${questionCount(due)} due for review today`,
        emphasis: true,
        count: due,
        state: sessionState(setup),
        info: <ReviewDueInfo align="end" />,
      }
    : {
        to: '/practice',
        title: 'Review due',
        description: 'Nothing due for review today',
        info: <ReviewDueInfo align="end" />,
      };
}

/** The review queue changes by the day; a minute's refresh is plenty. */
const REVIEW_REFRESH_MS = 60_000;

export function DashboardPage() {
  const { progress, preferences } = useUserData();
  const { questions, ids } = usePracticeQuestions();
  const { fullAvailable, shortConfig } = useExamQuestions();
  const now = useNow(REVIEW_REFRESH_MS);
  const quickActions = useMemo(() => {
    const due = reviewOverview(progress, ids, now).due;
    const setup = reviewSessionSetup(progress, ids, now, preferences.practiceSessionLength);
    const [learning, ...rest] = OTHER_ACTIONS;
    return [
      examAction(fullAvailable, shortConfig),
      ...(learning ? [learning] : []),
      reviewAction(due, setup),
      ...rest,
    ];
  }, [fullAvailable, shortConfig, progress, ids, now, preferences.practiceSessionLength]);
  const stats = useMemo(() => practiceStats(progress, questions), [progress, questions]);
  const attempts = useExamAttempts();
  const latest = attempts[0];
  const latestScore = latest?.summary ?? null;
  const readiness = useMemo(
    () => assessReadiness(attempts, preferences.benchmarkPercent),
    [attempts, preferences.benchmarkPercent],
  );

  const weakest = useMemo(() => weakestDomain(stats.byDomain), [stats]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your AWS Certified Cloud Practitioner (CLF-C02) preparation at a glance."
      />

      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="Latest mock exam" description="Your most recent timed exam." />
          {latest && latestScore ? (
            <CardBody>
              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
                <p className="font-serif text-7xl leading-none font-medium text-accent-fg tabular-nums">
                  {latestScore.percent}%
                </p>
                <p className="text-fg-muted tabular-nums">
                  {latestScore.correct} of {latestScore.total} correct
                </p>
                <Badge tone={latest.benchmarkMet ? 'success' : 'danger'}>
                  Practice benchmark {latest.benchmarkMet ? 'met' : 'not met'} (
                  {latest.benchmarkPercent}%)
                </Badge>
              </div>
              <p className="mt-2 text-sm text-fg-subtle">
                {latest.kind === 'short' ? 'Shorter exam' : 'Full exam'} ·{' '}
                {formatDateTime(latest.submittedAt)}
              </p>
              <p className="mt-4 text-fg-muted">
                {readiness.level === 'insufficient-data'
                  ? `Readiness guidance starts after ${MIN_ATTEMPTS_FOR_GUIDANCE} exams (${countedAttempts(attempts).length} so far).`
                  : readiness.level === 'consistent'
                    ? 'Your last three exams are consistently at or above your benchmark.'
                    : readiness.level === 'mixed'
                      ? 'Your recent average meets your benchmark, but not consistently yet.'
                      : 'Your recent average is below your benchmark.'}
              </p>
              <p className="mt-2 text-xs text-fg-subtle">
                Unofficial practice score. Official AWS result not predicted or guaranteed.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link to="/exam" className={buttonClasses()}>
                  Start a new mock exam
                </Link>
                <Link
                  to={`/results/${latest.id}`}
                  className={buttonClasses({ variant: 'secondary' })}
                >
                  View results
                </Link>
                <Link to="/progress" className={buttonClasses({ variant: 'ghost' })}>
                  See progress
                </Link>
              </div>
            </CardBody>
          ) : (
            <EmptyState
              icon={Target}
              headingLevel="h3"
              title="No mock exams yet"
              description="Take a timed mock exam to see your practice score and how each domain is going."
              action={
                <Link to="/exam" className={buttonClasses()}>
                  Go to mock exam
                </Link>
              }
            />
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Quick actions" />
          <CardBody>
            <ul className="flex flex-col gap-2.5">
              {quickActions.map((action) => (
                <li key={action.title} className="flex items-center gap-1.5">
                  <Link
                    to={action.to}
                    state={action.state}
                    className={cn(
                      'flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-md border px-4 py-2.5 transition-colors',
                      action.emphasis
                        ? 'border-accent bg-highlight text-on-highlight hover:bg-highlight-hover'
                        : 'border-border text-fg hover:bg-surface-2',
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{action.title}</span>
                      <span
                        className={cn(
                          'block text-sm',
                          action.emphasis ? 'text-on-highlight' : 'text-fg-muted',
                        )}
                      >
                        {action.description}
                      </span>
                    </span>
                    {action.count !== undefined ? (
                      <span
                        aria-hidden="true"
                        className="shrink-0 rounded-full bg-accent px-2.5 py-0.5 text-sm font-bold text-on-accent tabular-nums"
                      >
                        {action.count}
                      </span>
                    ) : (
                      <span aria-hidden="true" className="shrink-0 text-fg-subtle">
                        →
                      </span>
                    )}
                  </Link>
                  {action.info}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader
            title="Practice by domain"
            description="Correct uses your most recent answer to each question. Weightings are from the official exam guide."
          />
          <CardBody>
            <ul className="grid gap-3.5 md:grid-cols-2">
              {DOMAINS.map((domain) => {
                const domainStats = stats.byDomain[domain.id];
                const isWeakest = weakest === domain.id;
                return (
                  <li
                    key={domain.id}
                    className={cn(
                      'rounded-md bg-surface-2 px-4 py-4',
                      isWeakest && 'shadow-[inset_0_0_0_1.5px_var(--cp-warning)]',
                    )}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-semibold text-fg">{domain.name}</span>
                      {domainStats.answeredQuestions > 0 && (
                        <span className="font-semibold text-accent-fg tabular-nums">
                          {formatPercent(domainStats.accuracy)}
                        </span>
                      )}
                    </div>
                    {domainStats.answeredQuestions === 0 ? (
                      <p className="mt-2 text-sm text-fg-subtle">No practice answers yet</p>
                    ) : (
                      <ProgressBar
                        className="mt-2.5"
                        size="md"
                        label={`${domain.name}: correct`}
                        value={domainStats.correctQuestions}
                        max={domainStats.answeredQuestions}
                        valueText={`${formatPercent(domainStats.accuracy)} correct`}
                      />
                    )}
                    <p className="mt-2 text-sm text-fg-muted tabular-nums">
                      Domain {domain.number} · {domain.weightPercent}% of exam
                      {domainStats.answeredQuestions > 0 &&
                        ` · ${String(domainStats.answeredQuestions)}/${String(domainStats.availableQuestions)} answered`}
                      {isWeakest && (
                        <>
                          {' · '}
                          <strong className="font-semibold text-warning">weakest</strong>
                        </>
                      )}
                    </p>
                  </li>
                );
              })}
            </ul>
            <p className="mt-5 text-sm text-fg-muted">
              Source: <ExternalLink href={EXAM_GUIDE_URL}>CLF-C02 exam guide</ExternalLink>
            </p>
          </CardBody>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader
            title="Recent attempts"
            action={
              attempts.length > 0 && (
                <Link to="/history" className={buttonClasses({ variant: 'ghost', size: 'sm' })}>
                  All exam history
                </Link>
              )
            }
          />
          {attempts.length === 0 ? (
            <EmptyState
              icon={History}
              headingLevel="h3"
              title="No attempts yet"
              description="Completed mock exams will be listed here."
            />
          ) : (
            <ul className="px-5 pt-2 pb-3">
              {attempts.slice(0, 4).map((attempt) => (
                <li key={attempt.id} className="border-t border-border first:border-t-0">
                  <Link
                    to={`/results/${attempt.id}`}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-sm py-3"
                  >
                    <span className="font-semibold text-accent-fg">
                      {formatDateTime(attempt.submittedAt)}
                    </span>
                    <span className="text-fg-muted tabular-nums">
                      {attempt.summary.percent}% · {formatMinutes(attempt.timeUsedMs)} used ·
                      benchmark {attempt.benchmarkMet ? 'met' : 'not met'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
