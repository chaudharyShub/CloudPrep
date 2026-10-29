import { useEffect, useId, useReducer, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, Check, CircleDashed, Flag, LogOut, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { evaluateAnswer, requiredSelectionCount } from '@/domain/questions/evaluate';
import type { Question } from '@/domain/questions/types';
import {
  canCheck,
  createPracticeSession,
  practiceReducer,
  summarizeSession,
  type PracticeSession,
} from '@/domain/practice/session';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/cn';
import { newId, newSeed } from '@/lib/ids';
import { useAppStore } from '@/state/StoreProvider';
import { usePracticeQuestions } from '@/state/hooks';
import { BookmarkButton } from '@/features/shared/question/BookmarkButton';
import { FeedbackPanel } from '@/features/shared/question/FeedbackPanel';
import { OptionList } from '@/features/shared/question/OptionList';
import { QuestionMeta } from '@/features/shared/question/QuestionMeta';
import { parseSessionSetup, type SessionSetup } from './sessionSetup';
import { SessionSummaryView } from './SessionSummaryView';

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five'];

export function PracticeSessionPage() {
  const location = useLocation();
  const setup = parseSessionSetup(location.state);
  if (!setup) return <Navigate to="/practice" replace />;
  // A new navigation (e.g. "Retry incorrect") starts a fresh session.
  return <PracticeSessionRunner key={location.key} setup={setup} />;
}

function PracticeSessionRunner({ setup }: { setup: SessionSetup }) {
  const store = useAppStore();
  const navigate = useNavigate();
  const { byId } = usePracticeQuestions();
  const [session, dispatch] = useReducer(practiceReducer, setup, (initial): PracticeSession => {
    const questions = initial.questionIds
      .map((id) => byId.get(id))
      .filter((question): question is Question => question !== undefined);
    return createPracticeSession({
      id: newId(),
      label: initial.label,
      seed: newSeed(),
      startedAt: Date.now(),
      questions,
      limit: initial.limit,
      shuffleQuestions: true,
      shuffleOptions: store.getSnapshot().data.preferences.shuffleOptions,
    });
  });
  const [confirmExit, setConfirmExit] = useState(false);
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const feedbackHeadingRef = useRef<HTMLHeadingElement>(null);
  const focusTarget = useRef<'question' | 'feedback' | null>(null);
  const baseId = useId();

  useDocumentTitle(`Practice: ${session.label}`);

  const total = session.questionIds.length;
  const checkedCount = session.questionIds.filter(
    (id) => (session.answers[id]?.result ?? null) !== null,
  ).length;

  // Save a summary once the session finishes with at least one checked answer.
  useEffect(() => {
    if (session.status !== 'finished' || session.finishedAt === null) return;
    const summary = summarizeSession(session, byId, session.finishedAt);
    if (summary.answered > 0) store.addSessionSummary(summary);
  }, [session, byId, store]);

  // Move focus after question changes and answer checks, for keyboard and screen-reader users.
  useEffect(() => {
    const target = focusTarget.current;
    focusTarget.current = null;
    if (target === 'question') questionHeadingRef.current?.focus();
    if (target === 'feedback') feedbackHeadingRef.current?.focus();
  });

  if (session.status === 'finished') {
    return (
      <SessionSummaryView
        session={session}
        questionsById={byId}
        onRetry={(questionIds) => {
          void navigate('/practice/session', {
            state: {
              setup: {
                label: `Retry: ${session.label.replace(/^Retry: /, '')}`,
                questionIds,
                limit: null,
              },
            },
          });
        }}
      />
    );
  }

  const questionId = session.questionIds[session.currentIndex];
  const question = questionId ? byId.get(questionId) : undefined;
  if (!question) return <Navigate to="/practice" replace />;

  const answer = session.answers[question.id] ?? { selected: [], result: null };
  const outcomes =
    answer.result === null ? null : evaluateAnswer(question, answer.selected).outcomes;
  const required = requiredSelectionCount(question);
  const isLast = session.currentIndex === total - 1;
  const legendId = `${baseId}-stem`;
  const instructionsId = `${baseId}-instructions`;

  function goTo(index: number) {
    focusTarget.current = 'question';
    dispatch({ type: 'goTo', index });
  }

  function check() {
    if (!question || !canCheck(session, question)) return;
    const { isCorrect } = evaluateAnswer(question, answer.selected);
    store.recordAnswer({
      questionId: question.id,
      isCorrect,
      at: Date.now(),
      sessionId: session.id,
    });
    focusTarget.current = 'feedback';
    dispatch({ type: 'check', question });
  }

  function finish() {
    dispatch({ type: 'finish', at: Date.now() });
  }

  function exit() {
    if (checkedCount === 0) void navigate('/practice');
    else setConfirmExit(true);
  }

  return (
    <>
      <div className="mx-auto grid w-full max-w-6xl gap-x-8 lg:grid-cols-[minmax(0,1fr)_18.5rem]">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          {/* Session header */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm text-fg-muted">
                Learning mode · untimed, with instant feedback
              </p>
              <h1 className="font-serif text-2xl font-medium break-words text-fg sm:text-3xl">
                {session.label}
              </h1>
            </div>
            <Button variant="secondary" size="sm" icon={LogOut} onClick={exit}>
              End session
            </Button>
          </div>

          <div className="mb-4 flex items-center justify-between gap-4 text-sm">
            <span className="font-medium text-fg tabular-nums">
              Question {session.currentIndex + 1} of {total}
            </span>
            <span className="text-fg-muted tabular-nums">{checkedCount} checked</span>
          </div>
          <ProgressBar
            label="Session progress"
            value={checkedCount}
            max={total}
            valueText={`${checkedCount} of ${total} questions checked`}
            className="mb-4"
          />
        </div>

        {/* The answer sheet: right column on wide screens, under the progress bar otherwise. */}
        <SessionNavigator
          session={session}
          onSelect={goTo}
          className="lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start"
        />

        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          {/* Question */}
          <Card className="mt-6">
            <CardBody className="flex flex-col gap-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <QuestionMeta question={question} />
                <BookmarkButton questionId={question.id} />
              </div>
              <h2
                ref={questionHeadingRef}
                tabIndex={-1}
                className="sr-only"
              >{`Question ${session.currentIndex + 1}`}</h2>
              <p
                id={legendId}
                className="font-serif text-xl leading-snug font-medium text-fg sm:text-[1.625rem]"
              >
                {question.stem}
              </p>
              <p id={instructionsId} className="-mt-2 text-sm text-fg-muted">
                {question.type === 'single'
                  ? 'Select one answer.'
                  : `Select ${NUMBER_WORDS[required] ?? required} answers.`}
                {question.type === 'multiple' && answer.result === null && (
                  <span className="ml-1 tabular-nums" aria-live="polite">
                    ({answer.selected.length} of {required} selected)
                  </span>
                )}
              </p>
              <OptionList
                type={question.type}
                options={question.options}
                order={session.optionOrder[question.id] ?? question.options.map((o) => o.id)}
                selected={answer.selected}
                outcomes={outcomes}
                onToggle={(optionId) => {
                  dispatch({ type: 'select', question, optionId });
                }}
                name={`${baseId}-${question.id}`}
                legendId={legendId}
                instructionsId={instructionsId}
              />
              {answer.result !== null && (
                <FeedbackPanel
                  question={question}
                  result={answer.result}
                  headingRef={feedbackHeadingRef}
                />
              )}
            </CardBody>
          </Card>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="ghost"
              icon={ArrowLeft}
              disabled={session.currentIndex === 0}
              onClick={() => {
                goTo(session.currentIndex - 1);
              }}
            >
              Previous
            </Button>
            <div className="flex flex-wrap gap-2">
              {answer.result === null ? (
                <>
                  {!isLast && (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        goTo(session.currentIndex + 1);
                      }}
                    >
                      Skip
                    </Button>
                  )}
                  <Button icon={Check} disabled={!canCheck(session, question)} onClick={check}>
                    Check answer
                  </Button>
                </>
              ) : isLast ? (
                <Button icon={Flag} onClick={finish}>
                  Finish session
                </Button>
              ) : (
                <Button
                  icon={ArrowRight}
                  iconPosition="end"
                  onClick={() => {
                    goTo(session.currentIndex + 1);
                  }}
                >
                  Next question
                </Button>
              )}
            </div>
          </div>
          {isLast && answer.result === null && checkedCount > 0 && (
            <p className="mt-3 text-right text-sm text-fg-muted">
              This is the last question.{' '}
              <button
                type="button"
                onClick={finish}
                className="rounded-sm font-medium text-accent-fg underline-offset-4 hover:underline"
              >
                Finish without answering it
              </button>
            </p>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmExit}
        title="End this session?"
        description={`You've checked ${checkedCount} of ${total} questions. Your answers are already saved; you'll see a summary next.`}
        confirmLabel="End session"
        cancelLabel="Keep practising"
        onCancel={() => {
          setConfirmExit(false);
        }}
        onConfirm={() => {
          setConfirmExit(false);
          finish();
        }}
      />
    </>
  );
}

function SessionNavigator({
  session,
  onSelect,
  className,
}: {
  session: PracticeSession;
  onSelect: (index: number) => void;
  className?: string;
}) {
  const results = session.questionIds.map((id) => session.answers[id]?.result ?? null);
  const correct = results.filter((result) => result === 'correct').length;
  const incorrect = results.filter((result) => result === 'incorrect').length;
  return (
    <section
      aria-labelledby="answer-sheet-heading"
      className={cn('mt-2 border border-ink bg-surface p-4', className)}
    >
      <h2
        id="answer-sheet-heading"
        className="font-mono text-[0.8125rem] font-semibold tracking-wide text-fg uppercase"
      >
        Answer sheet
      </h2>
      <p className="mt-1 mb-3.5 text-sm text-fg-muted tabular-nums">
        {correct} correct · {incorrect} incorrect
      </p>
      <nav aria-label="Questions in this session">
        <ol className="grid grid-cols-[repeat(auto-fill,minmax(2.25rem,1fr))] gap-1 lg:grid-cols-8">
          {session.questionIds.map((id, index) => {
            const result = results[index] ?? null;
            const chosen = result === null && (session.answers[id]?.selected.length ?? 0) > 0;
            const isCurrent = index === session.currentIndex;
            const status =
              result === 'correct'
                ? 'correct'
                : result === 'incorrect'
                  ? 'incorrect'
                  : chosen
                    ? 'answer chosen, not checked'
                    : 'not answered';
            return (
              <li key={id}>
                <button
                  type="button"
                  aria-label={`Question ${index + 1}, ${status}`}
                  aria-current={isCurrent ? 'step' : undefined}
                  onClick={() => {
                    onSelect(index);
                  }}
                  className={cn(
                    'relative flex h-9 w-full items-center justify-center rounded-none border font-mono text-xs transition-colors',
                    result === 'correct' &&
                      'border-success bg-success-subtle font-semibold text-success',
                    result === 'incorrect' &&
                      'border-danger bg-danger-subtle font-semibold text-danger',
                    chosen && 'border-dashed border-accent bg-surface text-fg',
                    result === null &&
                      !chosen &&
                      'border-border bg-surface text-fg-subtle hover:bg-surface-2',
                    isCurrent && 'ring-2 ring-accent ring-offset-2 ring-offset-surface',
                  )}
                >
                  {index + 1}
                  {result === 'correct' && (
                    <Check
                      size={11}
                      strokeWidth={3}
                      aria-hidden="true"
                      className="absolute bottom-0.5 left-0.5"
                    />
                  )}
                  {result === 'incorrect' && (
                    <X
                      size={11}
                      strokeWidth={3}
                      aria-hidden="true"
                      className="absolute bottom-0.5 left-0.5"
                    />
                  )}
                  {chosen && (
                    <CircleDashed
                      size={11}
                      strokeWidth={2.5}
                      aria-hidden="true"
                      className="absolute bottom-0.5 left-0.5 text-accent-fg"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
      <ul
        aria-label="Legend"
        className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-fg-muted"
      >
        <li className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="flex size-3.5 items-center justify-center border border-success bg-success-subtle text-success"
          >
            <Check size={10} strokeWidth={3.5} />
          </span>
          Correct
        </li>
        <li className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="flex size-3.5 items-center justify-center border border-danger bg-danger-subtle text-danger"
          >
            <X size={10} strokeWidth={3.5} />
          </span>
          Incorrect
        </li>
        <li className="flex items-center gap-1.5">
          <CircleDashed size={13} strokeWidth={2.5} aria-hidden="true" className="text-accent-fg" />
          Not checked yet
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 ring-2 ring-accent" />
          Current
        </li>
      </ul>
    </section>
  );
}
