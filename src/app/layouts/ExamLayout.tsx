import { Suspense, useCallback, useMemo, useState } from 'react';
import { Navigate, Outlet, useOutletContext } from 'react-router';
import { Flag as FinishIcon } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageSkeleton } from '@/components/ui/Skeleton';
import type { IntegrityEvent } from '@/domain/exam/integrity';
import { proctorStatus, type ProctorRole } from '@/domain/exam/proctor';
import { examCounts, type ExamSession } from '@/domain/exam/session';
import { ExamTimer } from '@/features/exam/components/ExamTimer';
import { FinishExamDialog } from '@/features/exam/components/FinishExamDialog';
import { useExamActions } from '@/features/exam/useExamActions';
import { IntegrityBar } from '@/features/exam/integrity/IntegrityBar';
import { useIntegrityMonitor } from '@/features/exam/integrity/useIntegrityMonitor';
import { ProctorGate } from '@/features/exam/proctor/ProctorGate';
import { ProctorPanel } from '@/features/exam/proctor/ProctorPanel';
import { ProctorWarningDialog } from '@/features/exam/proctor/ProctorWarningDialog';
import { useProctor } from '@/features/exam/proctor/useProctor';
import { StorageNotices } from '@/features/shared/StorageNotices';
import { useAppStore } from '@/state/StoreProvider';
import { useActiveExam, useExamAttempts } from '@/state/hooks';

/** Proctor warnings logged before this time were shown on an earlier page load. */
const PAGE_LOADED_AT = Date.now();

export interface ExamOutletContext {
  exam: ExamSession;
}

// eslint-disable-next-line react-refresh/only-export-components -- typed accessor for this layout's context
export function useExamOutlet(): ExamOutletContext {
  return useOutletContext<ExamOutletContext>();
}

/**
 * Focused exam chrome: no sidebar, a compact top bar with the countdown and Finish button.
 * When the exam ends (submitted here, by the timer, or in another tab) it redirects to the
 * results; with no exam at all it goes back to the exam start page.
 */
export function ExamLayout() {
  const exam = useActiveExam();
  const attempts = useExamAttempts();
  const store = useAppStore();
  const { submit } = useExamActions();
  // The exam this layout was opened for; used to find its results once it has been submitted.
  const [examId] = useState(() => exam?.id ?? null);
  const openExam = exam && exam.status !== 'submitted' ? exam : null;
  // Runs only in strict and proctored modes; stops when the exam ends.
  const integrity = useIntegrityMonitor(openExam);
  const monitor = integrity.monitor;
  const requestFullscreen = useCallback(
    () => monitor?.requestFullscreen() ?? Promise.resolve(false),
    [monitor],
  );
  // Proctored mode: the AI proctor (camera, microphone, models). Stops when the exam ends.
  const proctor = useProctor(openExam, requestFullscreen);
  const integrityLog = openExam?.integrity ?? null;
  const verdict = useMemo(
    () => (integrityLog ? proctorStatus(integrityLog) : null),
    [integrityLog],
  );
  // Time of the last warning the learner acknowledged. Warnings from before this page load
  // were shown then.
  const [acknowledgedAt, setAcknowledgedAt] = useState(PAGE_LOADED_AT - 1);

  if (!exam || exam.status === 'submitted') {
    const finishedId =
      examId !== null && attempts.some((attempt) => attempt.id === examId) ? examId : null;
    if (exam?.status === 'submitted') return <ExamSkeleton />; // being finalised
    return <Navigate to={finishedId ? `/results/${finishedId}` : '/exam'} replace />;
  }

  const counts = examCounts(exam);
  const proctored = exam.integrity.mode === 'proctored';
  // The questions are hidden while the proctor can't watch.
  const blocked =
    proctored && (proctor.needsResume || !proctor.running || integrity.state.fullscreen !== 'on');
  const strikeCount = verdict?.strikeCount ?? 0;
  const latest =
    proctored && verdict && !verdict.endedBy
      ? latestStrike(exam.integrity.events, verdict.roles)
      : null;
  const warning = latest && latest.at > acknowledgedAt ? latest : null;
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to question
      </a>
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-sm font-semibold text-fg">
              <span className="truncate sm:hidden">Exam</span>
              <span className="hidden truncate sm:inline">CLF-C02 practice exam</span>
              {exam.kind === 'short' && (
                <span className="hidden sm:inline">
                  <Badge>Shorter exam</Badge>
                </span>
              )}
            </p>
            <p className="text-xs text-fg-muted tabular-nums">
              {counts.answered} of {counts.total} answered
            </p>
          </div>
          <ExamTimer endsAt={exam.endsAt} />
          <Button
            variant="secondary"
            size="sm"
            icon={FinishIcon}
            aria-label="Finish exam"
            onClick={() => store.dispatchExam({ type: 'requestFinish' })}
          >
            <span className="hidden sm:inline">Finish exam</span>
            <span className="sm:hidden">Finish</span>
          </Button>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6">
          <StorageNotices />
          {proctored ? (
            <ProctorPanel
              state={proctor.state}
              running={proctor.running}
              strikeCount={strikeCount}
            />
          ) : (
            <IntegrityBar mode={exam.integrity.mode} monitor={monitor} state={integrity.state} />
          )}
        </div>
        {blocked ? (
          proctor.needsResume || proctor.running ? (
            <ProctorGate
              needsResume={proctor.needsResume}
              resuming={proctor.resuming}
              state={proctor.state}
              onResume={() => {
                void proctor.resume();
              }}
              onFullscreen={() => {
                void requestFullscreen();
              }}
            />
          ) : (
            <ExamSkeleton /> // the proctor from check-in is being handed over
          )
        ) : (
          <Suspense fallback={<ExamSkeleton />}>
            <Outlet context={{ exam } satisfies ExamOutletContext} />
          </Suspense>
        )}
      </main>
      <ProctorWarningDialog
        warning={warning}
        strikeCount={strikeCount}
        onAcknowledge={() => {
          if (warning) setAcknowledgedAt(warning.at);
        }}
      />
      <FinishExamDialog
        exam={exam}
        onReturn={() => store.dispatchExam({ type: 'cancelFinish' })}
        onSubmit={() => {
          submit('manual');
        }}
      />
    </div>
  );
}

/**
 * The most recent violation that didn't end the exam, including one counted as part of an
 * earlier incident (for example, the reload after the tab was hidden).
 */
function latestStrike(
  events: readonly IntegrityEvent[],
  roles: readonly ProctorRole[],
): IntegrityEvent | null {
  for (let i = roles.length - 1; i >= 0; i--) {
    const role = roles[i];
    if (role === 'warning' || role === 'final-warning' || role === 'merged') {
      return events[i] ?? null;
    }
  }
  return null;
}

/** Loading placeholder with the same width and padding as exam pages. */
function ExamSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6">
      <PageSkeleton />
    </div>
  );
}
