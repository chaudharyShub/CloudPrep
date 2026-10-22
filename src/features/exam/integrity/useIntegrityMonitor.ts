import { useEffect, useMemo, useSyncExternalStore } from 'react';
import type { ExamSession } from '@/domain/exam/session';
import { useAppStore } from '@/state/StoreProvider';
import {
  browserEnvironment,
  IntegrityMonitor,
  type MonitorEnvironment,
  type MonitorState,
} from './monitor';

const IDLE: MonitorState = { active: false, fullscreen: 'off', fullscreenExited: false };
const noopSubscribe = () => () => undefined;

/**
 * Leaving fullscreen waits until after the current render pass. React (in development)
 * unmounts and remounts the exam layout straight away; exiting at once would end the
 * fullscreen the exam just entered and count as a violation.
 */
let pendingExit: number | null = null;
function cancelPendingExit() {
  if (pendingExit !== null) window.clearTimeout(pendingExit);
  pendingExit = null;
}

/**
 * Runs browser-signal monitoring for the open exam (strict and proctored modes). Monitoring
 * stops when the exam ends, the layout unmounts, or the learner stops it (strict mode).
 * Events are saved to the exam session through the store.
 */
export function useIntegrityMonitor(
  exam: ExamSession | null,
  env: MonitorEnvironment = browserEnvironment(),
): { monitor: IntegrityMonitor | null; state: MonitorState } {
  const store = useAppStore();
  const examId = exam?.id ?? null;
  const saved = exam?.integrity.mode ?? 'standard';
  // An exam started with the retired webcam mode continues with focus monitoring.
  const mode = saved === 'webcam' ? 'focus' : saved;
  // Constructing a monitor has no side effects; the effect below starts and stops it.
  const monitor = useMemo(
    () =>
      examId === null || mode === 'standard'
        ? null
        : new IntegrityMonitor(env, mode, (type, at) => {
            store.dispatchExam({ type: 'logIntegrity', event: { type, at } });
          }),
    // The environment is fixed for the page's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [examId, mode, store],
  );

  useEffect(() => {
    if (!monitor) return;
    cancelPendingExit();
    monitor.start();
    return () => {
      monitor.stop(false, { keepFullscreen: true });
      cancelPendingExit();
      pendingExit = window.setTimeout(() => {
        pendingExit = null;
        monitor.exitFullscreen();
      }, 0);
    };
  }, [monitor]);

  const state = useSyncExternalStore(
    monitor?.subscribe ?? noopSubscribe,
    monitor?.getState ?? (() => IDLE),
    monitor?.getState ?? (() => IDLE),
  );
  return { monitor, state };
}
