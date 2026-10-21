import { useEffect, useId, useReducer, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, Check, CircleCheck, CircleX, Flag, LogOut } from 'lucide-react';
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
      <div className="mx-auto max-w-prose">
        {/* Session header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-fg-muted">Learning mode · untimed, with instant feedback</p>
            <h1 className="text-xl font-semibold break-words text-fg sm:text-2xl">
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

        <SessionNavigator session={session} onSelect={goTo} />

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
            <p id={legendId} className="text-base leading-relaxed text-fg sm:text-lg">
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
}: {
  session: PracticeSession;
  onSelect: (index: number) => void;
}) {
  return (
    <nav aria-label="Questions in this session">
      <ol className="flex flex-wrap gap-1.5">
        {session.questionIds.map((id, index) => {
          const result = session.answers[id]?.result ?? null;
          const isCurrent = index === session.currentIndex;
          const status =
            result === 'correct'
              ? 'correct'
              : result === 'incorrect'
                ? 'incorrect'
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
                  'relative flex size-9 items-center justify-center rounded-sm border text-sm font-medium tabular-nums transition-colors',
                  result === 'correct' && 'border-success/50 bg-success-subtle text-success',
                  result === 'incorrect' && 'border-danger/50 bg-danger-subtle text-danger',
                  result === null && 'border-border bg-surface text-fg-muted hover:bg-surface-2',
                  isCurrent && 'ring-2 ring-accent ring-offset-2 ring-offset-bg',
                )}
              >
                {result === 'correct' ? (
                  <CircleCheck size={16} strokeWidth={2} aria-hidden="true" />
                ) : result === 'incorrect' ? (
                  <CircleX size={16} strokeWidth={2} aria-hidden="true" />
                ) : (
                  index + 1
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
