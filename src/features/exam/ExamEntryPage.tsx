import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Clock, Cloud, Flag, GraduationCap, Lock, Play, Timer, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PAGE_ICONS } from '@/components/layout/pageIcons';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { buttonClasses } from '@/components/ui/buttonStyles';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ExternalLink } from '@/components/ui/ExternalLink';
import { Notice } from '@/components/ui/Notice';
import { DOMAINS, EXAM_GUIDE_URL } from '@/domain/exam-guide/clf-c02';
import { FULL_EXAM, type ExamConfig } from '@/domain/exam/config';
import { examCounts } from '@/domain/exam/session';
import { formatClock, remainingMs } from '@/domain/exam/timer';
import { useNow } from '@/hooks/useNow';
import { useAppStore } from '@/state/StoreProvider';
import { useActiveExam, useExamQuestions } from '@/state/hooks';
import { useExamActions } from './useExamActions';
import { IntegrityModePicker, MODE_SUMMARY } from './integrity/IntegrityModePicker';
import type { IntegrityMode } from '@/domain/exam/integrity';
import type { CheckInState } from './proctor/CheckInPage';

const MINUTE = 60_000;

const RULES = [
  {
    icon: Timer,
    text: 'The timer starts when you confirm and keeps running, even if you close the tab. There is no pause, as in the real exam.',
  },
  { icon: Flag, text: 'Flag questions to come back to, and review everything before you submit.' },
  { icon: Lock, text: 'Answers and explanations are shown only after you submit.' },
  {
    icon: Clock,
    text: 'When time runs out, the exam is submitted automatically with the answers you have given.',
  },
  {
    icon: Cloud,
    text: 'Your answers are saved as you go, in this browser and to your account. If you reload, reopen CloudPrep or sign in on another device, you continue where you left off.',
  },
] as const;

export function ExamEntryPage() {
  const navigate = useNavigate();
  const store = useAppStore();
  const activeExam = useActiveExam();
  const { availability, fullAllocation, fullAvailable, shortConfig } = useExamQuestions();
  const { start } = useExamActions();
  const [pending, setPending] = useState<ExamConfig | null>(null);
  const [confirmAbandon, setConfirmAbandon] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [integrityMode, setIntegrityMode] = useState<IntegrityMode>('standard');
  const inProgress = activeExam !== null && activeExam.status !== 'submitted';

  /** Proctored exams go through check-in first; the others ask for confirmation. */
  function choose(config: ExamConfig) {
    if (integrityMode === 'proctored') {
      void navigate('/exam/check-in', { state: { kind: config.kind } satisfies CheckInState });
    } else {
      setPending(config);
    }
  }

  function confirmStart() {
    if (!pending) return;
    const result = start(pending, integrityMode);
    setPending(null);
    if (result.started && integrityMode !== 'standard') {
      // Requested inside this click, because browsers only allow fullscreen from a user action.
      const root = document.documentElement;
      const logUnavailable = () => {
        store.dispatchExam({
          type: 'logIntegrity',
          event: { type: 'fullscreen-unavailable', at: Date.now() },
        });
      };
      // Older browsers lack the method entirely.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (root.requestFullscreen) root.requestFullscreen().catch(logUnavailable);
      else logUnavailable();
    }
    if (result.started) void navigate('/exam/session');
    else setStartError('The exam could not be started. Reload the page and try again.');
  }

  return (
    <>
      <PageHeader
        title="Mock exam"
        icon={PAGE_ICONS.exam}
        description="A full-length, timed practice exam in the format of the CLF-C02 exam."
      />

      {inProgress && (
        <ResumeCard
          onResume={() => {
            void navigate('/exam/session');
          }}
          onAbandon={() => {
            setConfirmAbandon(true);
          }}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader title="Exam format" />
            <CardBody>
              <dl className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Questions', value: FULL_EXAM.questionCount },
                  { label: 'Minutes', value: FULL_EXAM.durationMs / MINUTE },
                  { label: 'Domains', value: DOMAINS.length },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-md border border-border bg-surface-2 p-4"
                  >
                    <dt className="text-sm text-fg-muted">{stat.label}</dt>
                    <dd className="mt-1 text-2xl font-semibold text-fg tabular-nums">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <h3 className="mt-6 text-sm font-semibold text-fg">Questions per domain</h3>
              <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                {DOMAINS.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3">
                    <span className="text-fg-muted">
                      {d.number}. {d.name}
                    </span>
                    <span className="font-medium text-fg tabular-nums">{fullAllocation[d.id]}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-fg-subtle">
                The official weightings (24 / 30 / 34 / 12%) apply to the 50 scored questions of the
                real exam. CloudPrep applies them to all 65 questions, rounding with the
                largest-remainder method, so the split is an approximation.
              </p>
              <h3 className="mt-6 text-sm font-semibold text-fg">Question types</h3>
              <ul className="mt-3 flex flex-col gap-3 text-sm">
                <li className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                  <span className="shrink-0 sm:w-40">
                    <Badge tone="accent">Multiple choice</Badge>
                  </span>
                  <span className="text-fg-muted">One correct answer out of four options.</span>
                </li>
                <li className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                  <span className="shrink-0 sm:w-40">
                    <Badge tone="accent">Multiple response</Badge>
                  </span>
                  <span className="text-fg-muted">
                    Two or more correct answers out of five or more options. The question says how
                    many to choose.
                  </span>
                </li>
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Before you start" />
            <CardBody>
              <ul className="flex flex-col gap-4">
                {RULES.map((rule) => {
                  const Icon = rule.icon;
                  return (
                    <li key={rule.text} className="flex gap-3 text-sm text-fg-muted">
                      <Icon
                        size={18}
                        strokeWidth={1.75}
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-fg-subtle"
                      />
                      {rule.text}
                    </li>
                  );
                })}
              </ul>
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader
              title="Start a mock exam"
              description="Questions are balanced across the four domains and shown in random order."
            />
            <CardBody className="flex flex-col gap-4">
              {startError && <Notice tone="danger">{startError}</Notice>}
              {!inProgress && (
                <IntegrityModePicker value={integrityMode} onChange={setIntegrityMode} />
              )}
              {fullAvailable ? (
                <Button
                  icon={Play}
                  className="w-full"
                  disabled={inProgress}
                  onClick={() => {
                    choose(FULL_EXAM);
                  }}
                >
                  Start full exam
                </Button>
              ) : (
                <>
                  <Notice tone="warning" title="The full exam isn't available yet">
                    A full exam needs {FULL_EXAM.questionCount} different questions in the right
                    balance. The question bank doesn&apos;t have enough yet, and CloudPrep never
                    repeats a question within an exam.
                  </Notice>
                  <table className="w-full text-sm">
                    <caption className="sr-only">Questions needed and available per domain</caption>
                    <thead>
                      <tr className="text-left text-xs text-fg-muted">
                        <th scope="col" className="pb-2 font-medium">
                          Domain
                        </th>
                        <th scope="col" className="pb-2 text-right font-medium">
                          Needed
                        </th>
                        <th scope="col" className="pb-2 text-right font-medium">
                          Available
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {DOMAINS.map((d) => {
                        const short = availability[d.id] < fullAllocation[d.id];
                        return (
                          <tr key={d.id} className="border-t border-border">
                            <th scope="row" className="py-2 text-left font-normal text-fg">
                              {d.name}
                            </th>
                            <td className="py-2 text-right text-fg tabular-nums">
                              {fullAllocation[d.id]}
                            </td>
                            <td
                              className={`py-2 text-right tabular-nums ${short ? 'font-semibold text-warning' : 'text-fg'}`}
                            >
                              {availability[d.id]}
                              {short && <span className="sr-only"> (not enough)</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {shortConfig && (
                    <div className="flex flex-col gap-2 border-t border-border pt-4">
                      <p className="text-sm text-fg-muted">
                        You can take a shorter timed exam now. It uses the same rules, balance and
                        pace ({shortConfig.questionCount} questions in{' '}
                        {shortConfig.durationMs / MINUTE} minutes).
                      </p>
                      <Button
                        icon={Timer}
                        className="w-full"
                        disabled={inProgress}
                        onClick={() => {
                          choose(shortConfig);
                        }}
                      >
                        Start shorter exam
                      </Button>
                    </div>
                  )}
                  <Link
                    to="/practice"
                    className={buttonClasses({ variant: 'secondary', className: 'w-full' })}
                  >
                    <GraduationCap size={18} strokeWidth={1.75} aria-hidden="true" />
                    Practise in Learning mode
                  </Link>
                </>
              )}
              {inProgress && (
                <p className="text-sm text-fg-muted">
                  Finish or discard your exam in progress before starting another.
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader as="h2" title="About the score" />
            <CardBody className="flex flex-col gap-3 text-sm text-fg-muted">
              <p>
                AWS reports a scaled score from 100 to 1,000, with 700 needed to pass. It is
                calculated with a method AWS doesn&apos;t publish, from 50 scored questions.
              </p>
              <p>
                CloudPrep shows an unofficial practice score: the percentage of questions you
                answered correctly, compared with a 70% practice benchmark. It is not a prediction
                of your real result.
              </p>
              <p>
                <ExternalLink href={EXAM_GUIDE_URL}>Read the official exam guide</ExternalLink>
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={pending !== null}
        title={pending?.kind === 'short' ? 'Start the shorter exam?' : 'Start the full exam?'}
        description={
          pending
            ? `${pending.questionCount} questions, ${pending.durationMs / MINUTE} minutes. The timer starts as soon as you confirm and can't be paused. ${MODE_SUMMARY[integrityMode]}`
            : ''
        }
        confirmLabel="Start exam"
        cancelLabel="Not yet"
        onCancel={() => {
          setPending(null);
        }}
        onConfirm={confirmStart}
      />
      <ConfirmDialog
        open={confirmAbandon}
        title="Discard this exam?"
        description="Your answers in this exam will be deleted and it won't appear in your history. This can't be undone."
        confirmLabel="Discard exam"
        tone="danger"
        onCancel={() => {
          setConfirmAbandon(false);
        }}
        onConfirm={() => {
          setConfirmAbandon(false);
          store.abandonExam();
        }}
      />
    </>
  );
}

function ResumeCard({ onResume, onAbandon }: { onResume: () => void; onAbandon: () => void }) {
  const exam = useActiveExam();
  const now = useNow(1000, exam !== null);
  if (!exam) return null;
  const counts = examCounts(exam);
  return (
    <Notice
      tone="info"
      title="You have an exam in progress"
      className="mb-6"
      action={
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button size="sm" icon={Play} onClick={onResume}>
            Resume exam
          </Button>
          <Button size="sm" variant="ghost" icon={Trash2} onClick={onAbandon}>
            Discard
          </Button>
        </div>
      }
    >
      {counts.answered} of {counts.total} answered · {formatClock(remainingMs(exam.endsAt, now))}{' '}
      left. The timer keeps running while you&apos;re away.
    </Notice>
  );
}
