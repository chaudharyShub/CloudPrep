import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { CircleCheck, CircleX, Crosshair, Play, RotateCcw, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Notice } from '@/components/ui/Notice';
import { FULL_EXAM, type ExamConfig } from '@/domain/exam/config';
import { checkInIssues, MAX_STRIKES, type CheckInIssue } from '@/domain/exam/proctor';
import { FULL_EXAM_AVAILABLE, SHORT_EXAM_CONFIG } from '@/state/examQuestions';
import { useActiveExam } from '@/state/hooks';
import { useExamActions } from '../useExamActions';
import {
  ERROR_TEXT,
  ISSUE_TEXT,
  isVirtualCamera,
  PHASE_TEXT,
  type ExtraCheckInIssue,
} from './copy';
import { adoptProctor, ProctorEngine, releaseProctor } from './engine';
import { CameraPreview, MicLevel } from './ProctorMedia';

/** The room must pass every check for this long before calibration. */
const ROOM_CLEAR_MS = 3000;
const MINUTE = 60_000;

const RULES = [
  'I am alone in a closed, quiet room, and nobody will come in.',
  'My desk is clear: no phone, notes, books, smartwatch or other devices within reach.',
  'Only one display is connected, and no other apps are open.',
  'I will not wear headphones, earbuds or a hat, and my face will stay fully visible.',
  'I will stay silent: no talking, whispering, reading aloud or chewing.',
  'I will keep looking at the screen, stay in fullscreen and not leave my seat until I submit.',
] as const;

/** Where the check-in page sends the learner, and with which exam. */
export interface CheckInState {
  kind: 'full' | 'short';
}

function examConfig(kind: CheckInState['kind'] | undefined): ExamConfig | null {
  if (kind === 'short') return SHORT_EXAM_CONFIG;
  return FULL_EXAM_AVAILABLE ? FULL_EXAM : SHORT_EXAM_CONFIG;
}

function hasExtraDisplay(): boolean {
  return (window.screen as Screen & { isExtended?: boolean }).isExtended === true;
}

/**
 * Proctored-exam check-in, modelled on online exam check-in: agree to the rules, allow
 * the camera and microphone, pass a room scan, calibrate, then start in fullscreen.
 */
export function CheckInPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeExam = useActiveExam();
  const { start } = useExamActions();
  const config = examConfig((location.state as Partial<CheckInState> | null)?.kind);
  const [agreed, setAgreed] = useState<boolean[]>(() => RULES.map(() => false));
  const [engine, setEngine] = useState<ProctorEngine | null>(null);
  const [clearLongEnough, setClearLongEnough] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  // The exam has started from this page (state for rendering, ref for the cleanup).
  const [examStarted, setExamStarted] = useState(false);
  const started = useRef(false);
  const rulesId = useId();

  // Release the camera if the learner leaves without starting.
  useEffect(() => {
    if (!engine) return;
    return () => {
      if (!started.current) releaseProctor(engine);
    };
  }, [engine]);

  const state = useSyncExternalStore(
    engine?.subscribe ?? (() => () => undefined),
    () => engine?.getState() ?? null,
    () => engine?.getState() ?? null,
  );

  const extra: ExtraCheckInIssue[] = [];
  if (!document.fullscreenEnabled) extra.push('no-fullscreen');
  if (hasExtraDisplay()) extra.push('extra-display');
  if (state && isVirtualCamera(state.cameraLabel)) extra.push('virtual-camera');
  if (state && (state.cameraLost || state.microphoneLost)) extra.push('device-lost');
  const ready = state?.phase === 'ready' || state?.phase === 'calibrated';
  const room: CheckInIssue[] = ready
    ? checkInIssues({ frame: state.frame, objects: state.objects, noiseDb: state.levelDb })
    : [];
  const issues = [...extra, ...room];
  const roomClear = ready && issues.length === 0;

  // The room must stay clear for a few seconds in a row.
  useEffect(() => {
    if (!roomClear) return;
    const id = window.setTimeout(() => {
      setClearLongEnough(true);
    }, ROOM_CLEAR_MS);
    return () => {
      window.clearTimeout(id);
      setClearLongEnough(false);
    };
  }, [roomClear]);
  const roomPassed = roomClear && clearLongEnough;

  if (activeExam && activeExam.status !== 'submitted' && !examStarted) {
    return <Navigate to="/exam" replace />;
  }
  if (!config) return <Navigate to="/exam" replace />;

  function begin() {
    const next = new ProctorEngine();
    adoptProctor(next);
    setEngine(next);
    void next.prepare();
  }

  function retry() {
    if (engine) releaseProctor(engine);
    begin();
  }

  function startExam() {
    if (!config || !engine || state?.phase !== 'calibrated') return;
    started.current = true;
    setExamStarted(true);
    const result = start(config, 'proctored');
    if (!result.started) {
      started.current = false;
      setExamStarted(false);
      setStartError('The exam could not be started. Reload the page and try again.');
      return;
    }
    // Inside this click: browsers only allow fullscreen from a user action.
    void document.documentElement.requestFullscreen().catch(() => undefined);
    void navigate('/exam/session');
  }

  const allAgreed = agreed.every(Boolean);
  const phaseText = state ? PHASE_TEXT[state.phase] : undefined;

  return (
    <>
      <PageHeader
        title="Proctored exam check-in"
        description={`${config.questionCount} questions in ${config.durationMs / MINUTE} minutes, watched by a strict AI proctor. ${MAX_STRIKES - 1} warnings, then the exam ends.`}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="1. Exam rules" id={rulesId} />
          <CardBody>
            <fieldset aria-labelledby={rulesId} disabled={engine !== null} className="min-w-0">
              <ul className="flex flex-col gap-3">
                {RULES.map((rule, index) => (
                  <li key={rule}>
                    <label className="flex cursor-pointer gap-3 text-sm text-fg">
                      <input
                        type="checkbox"
                        checked={agreed[index]}
                        onChange={(event) => {
                          const value = event.target.checked;
                          setAgreed((list) => list.map((v, i) => (i === index ? value : v)));
                        }}
                        className="mt-0.5 size-4 shrink-0 accent-accent"
                      />
                      {rule}
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
            <div className="mt-4 rounded-md border border-border bg-surface-2 p-3 text-xs text-fg-muted">
              <p className="font-medium text-fg">Stricter than a real exam</p>
              <p className="mt-1">
                Ends immediately: a phone, another person or face, a second display, or losing the
                camera or microphone. Counts as a violation: no face, head turned or eyes off the
                screen for 2 seconds, eyes closed for 3 seconds, lips moving, voice or noise, books
                or other screens, leaving the tab, window or fullscreen, the mouse leaving the page,
                blocked shortcuts (copy, paste, print, screenshots, developer tools), and reloading
                the page. Detection is approximate.
              </p>
            </div>
            {!engine && (
              <Button icon={ShieldCheck} className="mt-4" disabled={!allAgreed} onClick={begin}>
                Agree and allow camera and microphone
              </Button>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="2. Camera, microphone and room check"
            description="Nothing is recorded or uploaded. Video and sound are analysed on this device only."
          />
          <CardBody className="flex flex-col gap-4">
            {!engine && (
              <p className="text-sm text-fg-muted">Agree to the rules to start the check.</p>
            )}
            {state && (
              <>
                <CameraPreview stream={state.stream} className="aspect-4/3 w-full max-w-sm" />
                <MicLevel db={state.levelDb} className="max-w-sm" />
                {phaseText && (
                  <p role="status" className="text-sm text-fg-muted">
                    {phaseText}
                  </p>
                )}
                {state.error && (
                  <Notice
                    tone="danger"
                    action={
                      state.error === 'calibration-failed' ? undefined : (
                        <Button size="sm" icon={RotateCcw} onClick={retry}>
                          Try again
                        </Button>
                      )
                    }
                  >
                    {ERROR_TEXT[state.error]}
                  </Notice>
                )}
                {ready && (
                  <ul aria-label="Room check" className="flex flex-col gap-2 text-sm">
                    {issues.length === 0 ? (
                      <li className="flex gap-2 text-success">
                        <CircleCheck size={18} aria-hidden="true" className="shrink-0" />
                        {roomPassed
                          ? 'Room check passed.'
                          : 'Everything looks good. Hold still for a moment…'}
                      </li>
                    ) : (
                      issues.map((issue) => (
                        <li key={issue} className="flex gap-2 text-danger">
                          <CircleX size={18} aria-hidden="true" className="shrink-0" />
                          {ISSUE_TEXT[issue]}
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="3. Calibrate and start"
            description="Calibration measures how you normally sit and how quiet the room is, so the proctor can tell when you look away or talk."
          />
          <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {state?.phase === 'calibrated' ? (
              <Button icon={Play} onClick={startExam}>
                Start proctored exam
              </Button>
            ) : (
              <Button
                icon={Crosshair}
                disabled={!roomPassed || state.phase !== 'ready'}
                onClick={() => {
                  void engine?.calibrate();
                }}
              >
                {state?.phase === 'calibrating'
                  ? 'Calibrating…'
                  : 'Look at the screen and calibrate'}
              </Button>
            )}
            <p className="text-sm text-fg-muted">
              The timer starts when you start, in fullscreen. Don&apos;t press Esc during the exam.
            </p>
            <Link
              to="/exam"
              className="text-sm font-medium text-accent-fg underline-offset-4 hover:underline sm:ml-auto"
            >
              Cancel
            </Link>
          </CardBody>
          {startError && (
            <div className="px-5 pb-5">
              <Notice tone="danger">{startError}</Notice>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
