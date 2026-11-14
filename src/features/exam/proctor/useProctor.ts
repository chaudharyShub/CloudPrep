import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import type { ExamSession } from '@/domain/exam/session';
import { useAppStore } from '@/state/StoreProvider';
import {
  adoptProctor,
  currentProctor,
  INITIAL_PROCTOR_STATE,
  keepProctor,
  ProctorEngine,
  releaseProctor,
  type ProctorListener,
  type ProctorState,
} from './engine';

/** Shorter re-calibration when resuming after a reload. */
export const RESUME_CALIBRATION_MS = 2000;

const IDLE_STATE: ProctorState = INITIAL_PROCTOR_STATE;
const noopSubscribe = () => () => undefined;
/** Exams whose interruption was already logged during this page load. */
const interruptionsLogged = new Set<string>();

export interface ProctorControl {
  /** The running engine, or the one being resumed. */
  state: ProctorState;
  running: boolean;
  /** True after a reload: the learner must restart the proctor to continue. */
  needsResume: boolean;
  resuming: boolean;
  /** Restarts the proctor (camera, microphone, models, calibration). Call from a click. */
  resume: () => Promise<void>;
}

function engineFor(examId: string | null): ProctorEngine | null {
  const engine = currentProctor();
  if (!examId || !engine) return null;
  const { phase } = engine.getState();
  if (engine.examId === examId && phase === 'running') return engine;
  if (engine.examId === null && phase === 'calibrated') return engine; // fresh from check-in
  return null;
}

/**
 * Connects the AI proctor to a proctored exam. The engine prepared at check-in is handed
 * over here; after a reload there is none, so the interruption is logged (a strike) and
 * the learner has to restart the proctor. The engine stops when the exam ends.
 */
export function useProctor(
  exam: ExamSession | null,
  requestFullscreen: () => Promise<boolean>,
): ProctorControl {
  const store = useAppStore();
  const examId =
    exam && exam.integrity.mode === 'proctored' && exam.status !== 'submitted' ? exam.id : null;
  const [engine, setEngine] = useState<ProctorEngine | null>(() => engineFor(examId));
  const [candidate, setCandidate] = useState<ProctorEngine | null>(null);
  const [resuming, setResuming] = useState(false);

  const log = useCallback<ProctorListener>(
    (type, at) => {
      store.dispatchExam({ type: 'logIntegrity', event: { type, at } });
    },
    [store],
  );

  useEffect(() => {
    if (!engine || !examId) return;
    keepProctor(engine);
    if (engine.getState().phase === 'calibrated') engine.begin(examId, log);
    else engine.setListener(log);
    return () => {
      engine.setListener(null);
      releaseProctor(engine);
    };
  }, [engine, examId, log]);

  // Reopened mid-exam: the proctor wasn't watching in between.
  const wasStarted = exam?.integrity.events.some((e) => e.type === 'proctor-started') ?? false;
  useEffect(() => {
    if (!examId || engine || !wasStarted || interruptionsLogged.has(examId)) return;
    interruptionsLogged.add(examId);
    log('proctor-resumed', Date.now());
  }, [examId, engine, wasStarted, log]);

  // Stop a half-resumed engine if the exam ends first.
  useEffect(() => {
    if (!candidate) return;
    return () => {
      if (currentProctor() !== candidate || candidate.examId === null) releaseProctor(candidate);
    };
  }, [candidate]);

  const resume = useCallback(async () => {
    if (!examId || resuming) return;
    void requestFullscreen(); // inside the click, before any await
    const next = new ProctorEngine();
    adoptProctor(next);
    setCandidate(next);
    setResuming(true);
    const ok = (await next.prepare()) && (await next.calibrate(RESUME_CALIBRATION_MS));
    setResuming(false);
    if (ok) {
      setEngine(next);
      setCandidate(null);
    }
  }, [examId, resuming, requestFullscreen]);

  const shown = engine ?? candidate;
  const state = useSyncExternalStore(
    shown?.subscribe ?? noopSubscribe,
    shown?.getState ?? (() => IDLE_STATE),
    shown?.getState ?? (() => IDLE_STATE),
  );
  return {
    state,
    running: engine !== null && state.phase === 'running',
    needsResume: examId !== null && engine === null,
    resuming,
    resume,
  };
}
