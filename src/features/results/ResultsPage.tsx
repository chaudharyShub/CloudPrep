import { Link, useNavigate, useParams } from 'react-router';
import {
  CircleCheck,
  CircleMinus,
  CircleX,
  Clock,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  RotateCcw,
  SearchX,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { buttonClasses } from '@/components/ui/buttonStyles';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Notice } from '@/components/ui/Notice';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { nextSteps, weakAreas, type NextStep } from '@/domain/analytics/attemptInsights';
import { DOMAINS } from '@/domain/exam-guide/clf-c02';
import type { ExamAttempt } from '@/domain/exam/attempt';
import { formatDateTime, formatPercent } from '@/lib/format';
import { EXAM_QUESTIONS } from '@/state/examQuestions';
import { useExamAttempts, usePreferences } from '@/state/hooks';
import { SESSION_PATH, sessionState } from '@/features/practice/sessionSetup';
import { formatDuration } from './format';
import { IntegrityReport } from './IntegrityReport';

const domainName = (id: string) => DOMAINS.find((d) => d.id === id)?.name ?? id;
const taskTitle = (id: string) =>
  DOMAINS.flatMap((d) => d.taskStatements).find((t) => t.id === id)?.title ?? id;

export function ResultsPage() {
  const { attemptId } = useParams();
  const attempt = useExamAttempts().find((a) => a.id === attemptId);
  if (!attempt) return <ResultsNotFound />;
  return <Results attempt={attempt} />;
}

export function ResultsNotFound() {
  return (
    <>
      <PageHeader title="Exam results" />
      <Card>
        <EmptyState
          icon={SearchX}
          title="Results not found"
          description="This exam isn't in this browser's history. It may have been deleted, or taken in another browser."
          action={
            <Link to="/history" className={buttonClasses({ variant: 'secondary' })}>
              Go to exam history
            </Link>
          }
        />
      </Card>
    </>
  );
}

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface-2 p-3">
      <dt className="flex items-center gap-1.5 text-xs text-fg-muted">
        <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold text-fg tabular-nums">{value}</dd>
    </div>
  );
}

function Results({ attempt }: { attempt: ExamAttempt }) {
  const { summary } = attempt;
  const weak = weakAreas(attempt, attempt.benchmarkPercent);
  const steps = nextSteps(attempt);
  const reviewPath = `/results/${attempt.id}/review`;

  return (
    <>
      <PageHeader
        title="Exam results"
        description={`${attempt.kind === 'short' ? 'Shorter timed exam' : 'Full mock exam'} · completed ${formatDateTime(attempt.submittedAt)}`}
      />

      {attempt.submitReason !== 'manual' && (
        <Notice tone="warning" title="Time ran out" className="mb-6">
          {attempt.submitReason === 'expired_while_away'
            ? 'The exam time ended while CloudPrep was closed, so it was submitted with the answers saved before then.'
            : 'The exam was submitted automatically when the timer reached zero.'}
        </Notice>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader title="Practice score" />
          <CardBody>
            <p className="text-5xl font-semibold text-fg tabular-nums">{summary.percent}%</p>
            <p className="mt-1 text-sm text-fg-muted tabular-nums">
              {summary.correct} of {summary.total} questions correct
            </p>
            <div className="mt-4">
              {attempt.benchmarkMet ? (
                <Badge tone="success">
                  <CircleCheck size={14} aria-hidden="true" />
                  Practice benchmark met ({attempt.benchmarkPercent}%)
                </Badge>
              ) : (
                <Badge tone="danger">
                  <CircleX size={14} aria-hidden="true" />
                  Practice benchmark not met ({attempt.benchmarkPercent}%)
                </Badge>
              )}
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-2">
              <Stat icon={CircleCheck} label="Correct" value={String(summary.correct)} />
              <Stat icon={CircleX} label="Incorrect" value={String(summary.incorrect)} />
              <Stat icon={CircleMinus} label="Unanswered" value={String(summary.unanswered)} />
              <Stat icon={Clock} label="Time used" value={formatDuration(attempt.timeUsedMs)} />
            </dl>
            <p className="mt-2 text-xs text-fg-subtle">
              Time allowed: {formatDuration(attempt.durationMs)}
            </p>
            <p className="mt-5 text-xs leading-relaxed text-fg-subtle">
              <strong className="font-medium text-fg-muted">
                Official AWS result not predicted or guaranteed.
              </strong>{' '}
              This is an unofficial practice score: the percentage of questions answered correctly,
              with unanswered questions counted as incorrect. AWS reports a scaled score (100–1,000,
              700 to pass) using a method it doesn&apos;t publish, so a practice result can&apos;t
              guarantee success in the real exam.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to={reviewPath} className={buttonClasses()}>
                <ListChecks size={18} strokeWidth={1.75} aria-hidden="true" />
                Review all answers
              </Link>
              <Link to="/exam" className={buttonClasses({ variant: 'secondary' })}>
                <RotateCcw size={18} strokeWidth={1.75} aria-hidden="true" />
                Take another exam
              </Link>
              <Link to="/dashboard" className={buttonClasses({ variant: 'ghost' })}>
                <LayoutDashboard size={18} strokeWidth={1.75} aria-hidden="true" />
                Dashboard
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader
            title="Domain performance"
            description="Score counts unanswered questions as incorrect; accuracy is correct ÷ answered. Like the real exam, passing depends only on the overall score."
          />
          <CardBody className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Results by exam domain</caption>
              <thead>
                <tr className="border-b border-border text-left text-xs text-fg-muted">
                  <th scope="col" className="pb-2 font-medium">
                    Domain
                  </th>
                  <th scope="col" className="pb-2 text-right font-medium">
                    Correct
                  </th>
                  <th scope="col" className="pb-2 pl-4 font-medium">
                    Score
                  </th>
                  <th scope="col" className="pb-2 text-right font-medium">
                    Accuracy
                  </th>
                </tr>
              </thead>
              <tbody>
                {DOMAINS.map((d) => {
                  const result = summary.byDomain[d.id];
                  if (result.total === 0) return null;
                  return (
                    <tr key={d.id} className="border-b border-border last:border-0">
                      <th scope="row" className="py-3 pr-3 text-left font-normal text-fg">
                        {d.name}
                        {result.smallSample && (
                          <span className="block text-xs text-fg-subtle">
                            Only {result.total} question{result.total === 1 ? '' : 's'}: too few to
                            judge
                          </span>
                        )}
                      </th>
                      <td className="py-3 text-right text-fg tabular-nums">
                        {result.correct}/{result.total}
                      </td>
                      <td className="w-1/3 py-3 pl-4">
                        <div className="flex items-center gap-2">
                          <ProgressBar
                            label={`${d.name} score`}
                            value={result.correct}
                            max={result.total}
                            valueText={`${formatPercent(result.score)} score`}
                            tone={
                              (result.score ?? 0) * 100 >= attempt.benchmarkPercent
                                ? 'success'
                                : 'warning'
                            }
                          />
                          <span className="w-10 shrink-0 text-right text-fg-muted tabular-nums">
                            {formatPercent(result.score)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-right text-fg-muted tabular-nums">
                        {formatPercent(result.accuracy)}
                        <span className="sr-only"> of answered questions</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Weak areas"
            description={`Domains below your ${attempt.benchmarkPercent}% benchmark, most costly first (weighted by each domain's share of the exam), and topics with two or more misses.`}
          />
          <CardBody>
            {weak.domains.length === 0 && weak.topics.length === 0 ? (
              <p className="text-sm text-fg-muted">
                No domain fell below your benchmark in this exam. With few questions per domain, one
                exam is weak evidence; keep practising to confirm.
              </p>
            ) : (
              <ul className="flex flex-col gap-3 text-sm">
                {weak.domains.map(({ domain, result }) => (
                  <li key={domain} className="flex gap-3">
                    <Target size={18} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
                    <span>
                      <span className="font-medium text-fg">{domainName(domain)}</span>
                      <span className="block text-fg-muted">
                        {result.correct} of {result.total} correct ({formatPercent(result.score)})
                        {result.smallSample && ' · small sample'}
                      </span>
                    </span>
                  </li>
                ))}
                {weak.topics.map((topic) => (
                  <li key={topic.taskStatement} className="flex gap-3">
                    <CircleX size={18} className="mt-0.5 shrink-0 text-danger" aria-hidden="true" />
                    <span>
                      <span className="font-medium text-fg">
                        {topic.taskStatement} {taskTitle(topic.taskStatement)}
                      </span>
                      <span className="block text-fg-muted">
                        Missed {topic.missed} of {topic.total}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recommended next steps" />
          <CardBody>
            <ol className="flex flex-col gap-4">
              {steps.map((step) => (
                <NextStepItem key={stepKey(step)} step={step} />
              ))}
            </ol>
          </CardBody>
        </Card>
      </div>

      <IntegrityReport attempt={attempt} />
    </>
  );
}

function stepKey(step: NextStep): string {
  return step.kind === 'practise-domain' ? `${step.kind}-${step.domain}` : step.kind;
}

function NextStepItem({ step }: { step: NextStep }) {
  const navigate = useNavigate();
  const { practiceSessionLength } = usePreferences();
  const limit = practiceSessionLength === 'all' ? null : Number(practiceSessionLength);

  const startPractice = (label: string, questionIds: string[], max: number | null) => {
    void navigate(SESSION_PATH, { state: sessionState({ label, questionIds, limit: max }) });
  };

  switch (step.kind) {
    case 'pacing':
      return (
        <li className="text-sm">
          <p className="font-medium text-fg">Work on pacing</p>
          <p className="mt-1 text-fg-muted">
            You left {step.unanswered} question{step.unanswered === 1 ? '' : 's'} unanswered.
            Unanswered questions always score as incorrect, so give every question a best guess and
            flag it to revisit. The real exam allows about 83 seconds per question.
          </p>
        </li>
      );
    case 'practise-domain': {
      const name = domainName(step.domain);
      return (
        <li className="text-sm">
          <p className="font-medium text-fg">Practise {name}</p>
          <p className="mt-1 text-fg-muted">
            This domain was below your benchmark. Practise it in Learning mode, where every answer
            is explained.
          </p>
          <Button
            variant="secondary"
            size="sm"
            icon={GraduationCap}
            className="mt-2"
            onClick={() => {
              startPractice(
                name,
                EXAM_QUESTIONS.filter((q) => q.domain === step.domain).map((q) => q.id),
                limit,
              );
            }}
          >
            Practise {name}
          </Button>
        </li>
      );
    }
    case 'practise-missed':
      return (
        <li className="text-sm">
          <p className="font-medium text-fg">Retry the questions you missed</p>
          <p className="mt-1 text-fg-muted">
            Answer the {step.questionIds.length} incorrect or unanswered questions again, with
            explanations after each one.
          </p>
          <Button
            variant="secondary"
            size="sm"
            icon={RotateCcw}
            className="mt-2"
            onClick={() => {
              startPractice('Missed exam questions', step.questionIds, null);
            }}
          >
            Practise {step.questionIds.length} missed
          </Button>
        </li>
      );
    case 'retake':
      return (
        <li className="text-sm">
          <p className="font-medium text-fg">Retake after reviewing</p>
          <p className="mt-1 text-fg-muted">
            Read the explanations for your incorrect answers, practise the weak areas, then take
            another exam to measure progress.
          </p>
        </li>
      );
    case 'confirm-consistency':
      return (
        <li className="text-sm">
          <p className="font-medium text-fg">Confirm it wasn&apos;t a one-off</p>
          <p className="mt-1 text-fg-muted">
            One exam is limited evidence. Take more exams to check your score holds up. The{' '}
            <Link
              to="/progress"
              className="font-medium text-accent-fg underline-offset-4 hover:underline"
            >
              Progress
            </Link>{' '}
            page gives readiness guidance after three exams.
          </p>
        </li>
      );
  }
}
