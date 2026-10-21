import { useEffect, useMemo, useSyncExternalStore } from 'react';
import type { ExamSession } from '@/domain/exam/session';
import { useAppStore } from '@/state/StoreProvider';
import {
  browserEnvironment,
  IntegrityMonitor,
  type MonitorEnvironment,
  type MonitorState,
} from './monitor';

const IDLE: MonitorState = {
  active: false,
  fullscreen: 'off',
  fullscreenExited: false,
  camera: 'off',
  face: 'unknown',
};
const noopSubscribe = () => () => undefined;

/**
 * Runs integrity monitoring for the open exam (strict modes only). Monitoring stops, and
 * camera tracks are released, when the exam ends, the layout unmounts, or the learner
 * stops it. Events are saved to the exam session through the store.
 */
export function useIntegrityMonitor(
  exam: ExamSession | null,
  env: MonitorEnvironment = browserEnvironment(),
): { monitor: IntegrityMonitor | null; state: MonitorState } {
  const store = useAppStore();
  const examId = exam?.id ?? null;
  const mode = exam?.integrity.mode ?? 'standard';
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
    monitor.start();
    if (mode === 'webcam') void monitor.startCamera();
    return () => {
      monitor.stop();
    };
  }, [monitor, mode]);

  const state = useSyncExternalStore(
    monitor?.subscribe ?? noopSubscribe,
    monitor?.getState ?? (() => IDLE),
    monitor?.getState ?? (() => IDLE),
  );
  return { monitor, state };
}
