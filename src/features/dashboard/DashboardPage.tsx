import { useMemo } from 'react';
import { Link } from 'react-router';
import {
  Bookmark,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  History,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { buttonClasses } from '@/components/ui/buttonStyles';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ExternalLink } from '@/components/ui/ExternalLink';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { assessReadiness, MIN_ATTEMPTS_FOR_GUIDANCE } from '@/domain/analytics/readiness';
import { FULL_EXAM } from '@/domain/exam/config';
import { DOMAINS, EXAM_GUIDE_URL } from '@/domain/exam-guide/clf-c02';
import { practiceStats } from '@/domain/practice/progress';
import { formatDateTime, formatPercent } from '@/lib/format';
import { FULL_EXAM_AVAILABLE, SHORT_EXAM_CONFIG } from '@/state/examQuestions';
import { useExamAttempts, usePracticeQuestions, useUserData } from '@/state/hooks';

interface QuickAction {
  to: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const MINUTE = 60_000;

/** The timed exam on offer: the full exam, or the shorter one while the bank is too small. */
const examAction: QuickAction =
  FULL_EXAM_AVAILABLE || !SHORT_EXAM_CONFIG
    ? {
        to: '/exam',
        title: 'Timed mock exam',
        description: `${FULL_EXAM.questionCount} questions · ${FULL_EXAM.durationMs / MINUTE} minutes`,
        icon: ClipboardCheck,
      }
    : {
        to: '/exam',
        title: 'Timed mock exam (shorter)',
        description: `${SHORT_EXAM_CONFIG.questionCount} questions · ${SHORT_EXAM_CONFIG.durationMs / MINUTE} minutes`,
        icon: ClipboardCheck,
      };

const QUICK_ACTIONS: readonly QuickAction[] = [
  examAction,
  {
    to: '/practice',
    title: 'Learning mode',
    description: 'Untimed, with instant feedback and explanations',
    icon: GraduationCap,
  },
  {
    to: '/bookmarks',
    title: 'Bookmarked questions',
    description: 'Questions you saved for later',
    icon: Bookmark,
  },
];

export function DashboardPage() {
  const { progress, preferences } = useUserData();
  const { questions } = usePracticeQuestions();
  const stats = useMemo(() => practiceStats(progress, questions), [progress, questions]);
  const attempts = useExamAttempts();
  const latest = attempts[0];
  const latestScore = latest?.summary ?? null;
  const readiness = useMemo(
    () => assessReadiness(attempts, preferences.benchmarkPercent),
    [attempts, preferences.benchmarkPercent],
  );

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your AWS Certified Cloud Practitioner (CLF-C02) preparation at a glance."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="Latest mock exam" description="Your most recent timed exam." />
          {latest && latestScore ? (
            <CardBody>
              <p className="text-5xl font-semibold text-fg tabular-nums">{latestScore.percent}%</p>
              <p className="mt-1 text-sm text-fg-muted tabular-nums">
                {latestScore.correct} of {latestScore.total} correct ·{' '}
                {latest.kind === 'short' ? 'shorter exam' : 'full exam'} ·{' '}
                {formatDateTime(latest.submittedAt)}
              </p>
              <div className="mt-4">
                <Badge tone={latest.benchmarkMet ? 'success' : 'danger'}>
                  Practice benchmark {latest.benchmarkMet ? 'met' : 'not met'} (
                  {latest.benchmarkPercent}%)
                </Badge>
              </div>
              <p className="mt-4 text-sm text-fg-muted">
                {readiness.level === 'insufficient-data'
                  ? `Readiness guidance starts after ${MIN_ATTEMPTS_FOR_GUIDANCE} exams (${attempts.length} so far).`
                  : readiness.level === 'consistent'
                    ? 'Your last three exams are consistently at or above your benchmark.'
                    : readiness.level === 'mixed'
                      ? 'Your recent average meets your benchmark, but not consistently yet.'
                      : 'Your recent average is below your benchmark.'}
              </p>
              <p className="mt-2 text-xs text-fg-subtle">
                Unofficial practice score. Official AWS result not predicted or guaranteed.
              </p>
              <Link
                to={`/results/${latest.id}`}
                className={buttonClasses({ variant: 'secondary', className: 'mt-5' })}
              >
                View results
              </Link>
              <Link
                to="/progress"
                className={buttonClasses({ variant: 'ghost', className: 'mt-5 ml-2' })}
              >
                See progress
              </Link>
            </CardBody>
          ) : (
            <EmptyState
              icon={Target}
              headingLevel="h3"
              title="No mock exams yet"
              description="Take a timed mock exam to see your practice score and how each domain is going."
              action={
                <Link to="/exam" className={buttonClasses({ variant: 'secondary' })}>
                  Go to mock exam
                </Link>
              }
            />
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Quick actions" />
          <CardBody>
            <ul className="flex flex-col gap-2">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <li key={action.to}>
                    <Link
                      to={action.to}
                      className="group flex items-center gap-3 rounded-md border border-border bg-surface-2 p-3 transition-colors hover:border-border-strong hover:bg-surface-3"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent-subtle text-accent-fg">
                        <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-fg">{action.title}</span>
                        <span className="block text-sm text-fg-muted">{action.description}</span>
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
          </CardBody>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader
            title="Practice by domain"
            description="Correct uses your most recent answer to each question. Weightings are from the official exam guide."
          />
          <CardBody>
            <ul className="divide-y divide-border">
              {DOMAINS.map((domain) => {
                const domainStats = stats.byDomain[domain.id];
                return (
                  <li key={domain.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <Badge>Domain {domain.number}</Badge>
                        <span className="text-sm font-medium text-fg">{domain.name}</span>
                      </div>
                      <span className="text-sm text-fg-muted tabular-nums">
                        {domain.weightPercent}% of exam
                      </span>
                    </div>
                    {domainStats.answeredQuestions === 0 ? (
                      <p className="mt-1.5 text-sm text-fg-subtle">No practice answers yet</p>
                    ) : (
                      <div className="mt-2 flex items-center gap-3">
                        <ProgressBar
                          className="flex-1"
                          tone="success"
                          label={`${domain.name}: correct`}
                          value={domainStats.correctQuestions}
                          max={domainStats.answeredQuestions}
                          valueText={`${formatPercent(domainStats.accuracy)} correct`}
                        />
                        <span className="w-44 shrink-0 text-right text-sm text-fg-muted tabular-nums">
                          {formatPercent(domainStats.accuracy)} correct ·{' '}
                          {domainStats.answeredQuestions}/{domainStats.availableQuestions} answered
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="mt-6 text-sm text-fg-muted">
              Source: <ExternalLink href={EXAM_GUIDE_URL}>CLF-C02 exam guide</ExternalLink>
            </p>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent attempts"
            action={
              attempts.length > 0 && (
                <Link to="/history" className={buttonClasses({ variant: 'ghost', size: 'sm' })}>
                  View all
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
            <ul className="divide-y divide-border px-5 pt-3 pb-2">
              {attempts.slice(0, 4).map((attempt) => {
                const score = attempt.summary;
                return (
                  <li key={attempt.id} className="py-2.5">
                    <Link
                      to={`/results/${attempt.id}`}
                      className="flex items-center justify-between gap-3 rounded-sm text-sm hover:text-fg"
                    >
                      <span className="text-fg-muted">{formatDateTime(attempt.submittedAt)}</span>
                      <span className="font-medium text-fg tabular-nums">{score.percent}%</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
