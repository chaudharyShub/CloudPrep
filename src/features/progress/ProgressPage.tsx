import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  ChartNoAxesColumn,
  CircleCheck,
  CircleDashed,
  CircleX,
  Minus,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PAGE_ICONS } from '@/components/layout/pageIcons';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { buttonClasses } from '@/components/ui/buttonStyles';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  assessReadiness,
  domainEvidence,
  frequentlyMissedTopics,
  MIN_ATTEMPTS_FOR_GUIDANCE,
  MIN_DOMAIN_SAMPLE,
  recentScores,
  repeatedMistakes,
  scoreTrend,
  type DomainEvidence,
  type ReadinessAssessment,
} from '@/domain/analytics/readiness';
import { DOMAINS } from '@/domain/exam-guide/clf-c02';
import { practiceStats } from '@/domain/practice/progress';
import { formatDateTime, formatPercent } from '@/lib/format';
import { cn } from '@/lib/cn';
import { usePracticeQuestions, useUserData } from '@/state/hooks';
import { SESSION_PATH, sessionState } from '@/features/practice/sessionSetup';

const domainName = (id: string) => DOMAINS.find((d) => d.id === id)?.name ?? id;
const taskTitle = (id: string) =>
  DOMAINS.flatMap((d) => d.taskStatements).find((t) => t.id === id)?.title ?? id;

export function ProgressPage() {
  const { attempts, progress, preferences } = useUserData();
  const { questions, byId, ids } = usePracticeQuestions();
  const benchmark = preferences.benchmarkPercent;

  const readiness = useMemo(() => assessReadiness(attempts, benchmark), [attempts, benchmark]);
  const scores = useMemo(() => recentScores(attempts), [attempts]);
  const trend = useMemo(() => scoreTrend(attempts), [attempts]);
  const evidence = useMemo(() => domainEvidence(attempts, benchmark), [attempts, benchmark]);
  const coverage = useMemo(() => practiceStats(progress, questions), [progress, questions]);
  const topics = useMemo(() => frequentlyMissedTopics(progress, byId), [progress, byId]);
  const repeated = useMemo(() => repeatedMistakes(progress, ids), [progress, ids]);

  return (
    <>
      <PageHeader
        title="Progress"
        icon={PAGE_ICONS.progress}
        description="Readiness indicators calculated only from the exams and practice saved in this browser."
      />

      <ReadinessCard readiness={readiness} benchmark={benchmark} />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Recent exam scores"
            description={`${scores.length === 1 ? 'Your last exam' : `Your last ${scores.length > 0 ? scores.length : 'few'} exams, oldest first`}. The dashed line is your ${benchmark}% benchmark.`}
          />
          <CardBody>
            {scores.length === 0 ? (
              <EmptyState
                icon={ChartNoAxesColumn}
                headingLevel="h3"
                title="No exams yet"
                description="Your scores appear here after your first mock exam."
                action={
                  <Link to="/exam" className={buttonClasses({ variant: 'secondary' })}>
                    Go to mock exam
                  </Link>
                }
                className="py-6"
              />
            ) : (
              <>
                <ScoreBars scores={scores} benchmark={benchmark} />
                <TrendSummary trend={trend} />
              </>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Domain strengths and weaknesses"
            description={`From your last exams, pooled. A domain is only judged with at least ${MIN_DOMAIN_SAMPLE} questions. Strength: ${benchmark + 10}% or more. Weakness: below ${benchmark}%.`}
          />
          <CardBody>
            <DomainEvidenceList evidence={evidence} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Practice coverage"
            description="How much of the question bank you've answered at least once (practice and exams), and how often your latest answer is correct."
          />
          <CardBody>
            <ul className="flex flex-col gap-4">
              {DOMAINS.map((d) => {
                const stats = coverage.byDomain[d.id];
                return (
                  <li key={d.id}>
                    <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-3 text-sm">
                      <span className="text-fg">{d.name}</span>
                      <span className="text-fg-muted tabular-nums">
                        {stats.answeredQuestions}/{stats.availableQuestions} covered ·{' '}
                        {stats.accuracy === null
                          ? 'no answers yet'
                          : `${formatPercent(stats.accuracy)} correct`}
                      </span>
                    </div>
                    <ProgressBar
                      label={`${d.name} coverage`}
                      value={stats.answeredQuestions}
                      max={stats.availableQuestions}
                      valueText={`${stats.answeredQuestions} of ${stats.availableQuestions} questions answered`}
                      tone="accent"
                    />
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-xs text-fg-subtle">
              Coverage and accuracy are separate: high accuracy on a few questions isn&apos;t
              mastery of the whole domain.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Frequently missed topics"
            description="Exam-guide task statements with the most incorrect answers (at least two) across practice and exams."
          />
          <CardBody>
            {topics.length === 0 ? (
              <p className="text-sm text-fg-muted">
                No topic has been missed twice yet. Topics show up here as you practise.
              </p>
            ) : (
              <ol className="flex flex-col gap-3 text-sm">
                {topics.map((topic) => (
                  <li key={topic.taskStatement} className="flex items-start justify-between gap-3">
                    <span className="text-fg">
                      <span className="text-fg-subtle tabular-nums">{topic.taskStatement}</span>{' '}
                      {taskTitle(topic.taskStatement)}
                    </span>
                    <span className="shrink-0 text-fg-muted tabular-nums">
                      {topic.misses} missed
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardBody>
        </Card>
      </div>

      <RepeatedMistakesCard
        items={repeated.map((item) => ({ ...item, stem: byId.get(item.questionId)?.stem ?? '' }))}
      />
    </>
  );
}

const LEVEL_COPY: Record<
  ReadinessAssessment['level'],
  { title: string; tone: BadgeTone; icon: LucideIcon; body: string }
> = {
  'insufficient-data': {
    title: 'Not enough data yet',
    tone: 'neutral',
    icon: CircleDashed,
    body: `CloudPrep gives guidance only after ${MIN_ATTEMPTS_FOR_GUIDANCE} practice exams. A single exam is too small a sample to judge.`,
  },
  below: {
    title: 'Below your practice benchmark',
    tone: 'danger',
    icon: CircleX,
    body: 'Your recent average is under your benchmark. Focus on weak domains and the explanations for missed questions.',
  },
  mixed: {
    title: 'Approaching your benchmark',
    tone: 'warning',
    icon: Minus,
    body: 'Your recent average meets your benchmark, but not every criterion below is met yet.',
  },
  consistent: {
    title: 'Consistently at or above your practice benchmark',
    tone: 'success',
    icon: CircleCheck,
    body: 'Every criterion below is met across your last three exams.',
  },
};

function ReadinessCard({
  readiness,
  benchmark,
}: {
  readiness: ReadinessAssessment;
  benchmark: number;
}) {
  const copy = LEVEL_COPY[readiness.level];
  const Icon = copy.icon;
  return (
    <Card>
      <CardHeader title="Practice readiness" />
      <CardBody className="grid gap-6 lg:grid-cols-2">
        <div>
          <Badge tone={copy.tone} className="text-sm">
            <Icon size={16} aria-hidden="true" />
            {copy.title}
          </Badge>
          <p className="mt-3 text-sm text-fg-muted">{copy.body}</p>
          <p className="mt-3 text-xs leading-relaxed text-fg-subtle">
            This is guidance, not a prediction. It compares practice scores with your {benchmark}%
            benchmark using a small set of original questions. AWS scores the real exam differently,
            so no practice result can guarantee your official result.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-fg">Criteria</h3>
          <ul className="mt-3 flex flex-col gap-2.5 text-sm">
            {readiness.criteria.map((criterion) => (
              <li key={criterion.id} className="flex gap-2.5">
                {criterion.met ? (
                  <CircleCheck
                    size={18}
                    className="mt-0.5 shrink-0 text-success"
                    aria-hidden="true"
                  />
                ) : (
                  <CircleDashed
                    size={18}
                    className="mt-0.5 shrink-0 text-fg-subtle"
                    aria-hidden="true"
                  />
                )}
                <span>
                  <span className="text-fg">{criterion.label}</span>
                  <span className="sr-only">{criterion.met ? ': met' : ': not met'}</span>
                  <span className="block text-xs text-fg-muted">{criterion.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardBody>
    </Card>
  );
}

/** Bar chart with a full text alternative (the table is the accessible version). */
function ScoreBars({
  scores,
  benchmark,
}: {
  scores: ReturnType<typeof recentScores>;
  benchmark: number;
}) {
  return (
    <figure>
      <div
        aria-hidden="true"
        className="relative flex h-40 items-end justify-center gap-3 border-b border-border"
      >
        <div
          className="absolute inset-x-0 border-t border-dashed border-fg-subtle"
          style={{ bottom: `${benchmark}%` }}
        />
        {scores.map((score) => (
          <div key={score.id} className="flex h-full max-w-16 flex-1 flex-col justify-end">
            <span className="mb-1 text-center text-xs text-fg-muted tabular-nums">
              {Math.round(score.percent)}%
            </span>
            <div
              className={cn('rounded-t-sm', score.benchmarkMet ? 'bg-success' : 'bg-warning')}
              style={{ height: `${Math.max(score.percent, 1)}%` }}
            />
          </div>
        ))}
      </div>
      <figcaption className="sr-only">Recent exam scores</figcaption>
      <table className="mt-4 w-full text-sm">
        <caption className="sr-only">Recent exam scores, oldest first</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Exam</th>
            <th scope="col">Score</th>
            <th scope="col">Benchmark</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((score) => (
            <tr key={score.id} className="border-b border-border last:border-0">
              <td className="py-1.5 text-fg-muted">{formatDateTime(score.submittedAt)}</td>
              <td className="py-1.5 text-fg-muted">
                {score.kind === 'short' ? 'Shorter' : 'Full'}
              </td>
              <td className="py-1.5 text-right font-medium text-fg tabular-nums">
                {score.percent}%
              </td>
              <td className="py-1.5 text-right text-xs">
                {score.benchmarkMet ? (
                  <span className="text-success">Met</span>
                ) : (
                  <span className="text-fg-muted">Not met</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

function TrendSummary({ trend }: { trend: ReturnType<typeof scoreTrend> }) {
  if (trend.change === null || trend.direction === null) {
    return (
      <p className="mt-4 text-sm text-fg-muted">
        Average {trend.average ?? 0}%. Take another exam to see a trend.
      </p>
    );
  }
  const Icon =
    trend.direction === 'up' ? TrendingUp : trend.direction === 'down' ? TrendingDown : Minus;
  const text =
    trend.direction === 'steady'
      ? `Steady (${trend.change >= 0 ? '+' : ''}${trend.change} points)`
      : `${trend.direction === 'up' ? 'Up' : 'Down'} ${Math.abs(trend.change)} points`;
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
      <span className="flex items-center gap-1.5 font-medium text-fg">
        <Icon size={16} aria-hidden="true" />
        {text} across your last {trend.count} exams
      </span>
      <span className="text-fg-muted">Average {trend.average}%</span>
    </p>
  );
}

const STATUS_COPY: Record<DomainEvidence['status'], { label: string; tone: BadgeTone }> = {
  strength: { label: 'Strength', tone: 'success' },
  weakness: { label: 'Weakness', tone: 'danger' },
  neutral: { label: 'Near benchmark', tone: 'neutral' },
  insufficient: { label: 'Not enough data', tone: 'neutral' },
};

function DomainEvidenceList({ evidence }: { evidence: DomainEvidence[] }) {
  if (evidence.every((d) => d.total === 0)) {
    return (
      <p className="text-sm text-fg-muted">Take a mock exam to see how each domain is going.</p>
    );
  }
  return (
    <ul className="divide-y divide-border">
      {evidence.map((d) => {
        const status = STATUS_COPY[d.status];
        return (
          <li
            key={d.domain}
            className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
          >
            <span className="text-sm text-fg">{domainName(d.domain)}</span>
            <span className="flex items-center gap-3">
              <span className="text-sm text-fg-muted tabular-nums">
                {d.correct}/{d.total} · {formatPercent(d.ratio)}
              </span>
              <Badge tone={status.tone}>{status.label}</Badge>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function RepeatedMistakesCard({
  items,
}: {
  items: {
    questionId: string;
    misses: number;
    attempts: number;
    lastResult: string;
    stem: string;
  }[];
}) {
  const navigate = useNavigate();
  return (
    <Card className="mt-6">
      <CardHeader
        title="Questions you keep missing"
        description="Answered incorrectly at least twice, in practice or exams."
        action={
          items.length > 0 && (
            <Button
              size="sm"
              variant="secondary"
              icon={RotateCcw}
              onClick={() => {
                void navigate(SESSION_PATH, {
                  state: sessionState({
                    label: 'Repeated mistakes',
                    questionIds: items.map((i) => i.questionId),
                    limit: null,
                  }),
                });
              }}
            >
              Practise these ({items.length})
            </Button>
          )
        }
      />
      <CardBody>
        {items.length === 0 ? (
          <p className="text-sm text-fg-muted">
            No question has been missed twice. That changes as you practise; nothing here is
            estimated.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li
                key={item.questionId}
                className="flex items-start justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0"
              >
                <span className="line-clamp-2 text-fg">{item.stem}</span>
                <span className="shrink-0 text-right text-fg-muted tabular-nums">
                  Missed {item.misses} of {item.attempts}
                  <span className="block text-xs">
                    Latest: {item.lastResult === 'correct' ? 'correct' : 'incorrect'}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
