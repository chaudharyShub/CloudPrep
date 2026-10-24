import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, ArrowRight, Flag, LayoutGrid, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { buttonClasses } from '@/components/ui/buttonStyles';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Dialog } from '@/components/ui/Dialog';
import { Notice } from '@/components/ui/Notice';
import { examCounts } from '@/domain/exam/session';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/cn';
import { useExamQuestions } from '@/state/hooks';
import { useAppStore } from '@/state/StoreProvider';
import { useExamOutlet } from '@/app/layouts/ExamLayout';
import { OptionList } from '@/features/shared/question/OptionList';
import { QuestionNavigator } from './components/QuestionNavigator';
import { selectionInstruction, toExamView } from './examView';

export function ExamSessionPage() {
  const { exam } = useExamOutlet();
  const { byId: examQuestionsById } = useExamQuestions();
  const store = useAppStore();
  const baseId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousIndex = useRef(exam.currentIndex);
  const [navigatorOpen, setNavigatorOpen] = useState(false);

  const total = exam.questionIds.length;
  const index = exam.currentIndex;
  const questionId = exam.questionIds[index] ?? '';
  const question = examQuestionsById.get(questionId);
  const view = question ? toExamView(question) : null;
  const selected = exam.answers[questionId] ?? [];
  const required = exam.requiredSelections[questionId] ?? 1;
  const flagged = exam.flagged.includes(questionId);
  const counts = examCounts(exam);

  useDocumentTitle(`Question ${index + 1} of ${total} · Exam`);

  // Move focus to the new question after navigating (not on first load).
  useEffect(() => {
    if (previousIndex.current === index) return;
    previousIndex.current = index;
    headingRef.current?.focus();
  }, [index]);

  function goTo(target: number) {
    store.dispatchExam({ type: 'goTo', index: target });
  }

  const legendId = `${baseId}-stem`;
  const instructionsId = `${baseId}-instructions`;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 pt-4 pb-28 sm:px-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:pb-10">
      <div className="min-w-0">
        <Card>
          <CardBody className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-3">
              <h1
                ref={headingRef}
                tabIndex={-1}
                className="text-sm font-semibold text-fg-muted tabular-nums"
              >
                Question {index + 1} of {total}
              </h1>
              <Button
                variant={flagged ? 'secondary' : 'ghost'}
                size="sm"
                icon={Flag}
                aria-pressed={flagged}
                onClick={() =>
                  store.dispatchExam({ type: 'toggleFlag', questionId, at: Date.now() })
                }
                className={cn(flagged && 'border-warning/60 text-warning')}
              >
                {flagged ? 'Flagged' : 'Flag for review'}
              </Button>
            </div>

            {view ? (
              <>
                <p id={legendId} className="text-base leading-relaxed text-fg sm:text-lg">
                  {view.stem}
                </p>
                <p id={instructionsId} className="-mt-2 text-sm text-fg-muted">
                  {selectionInstruction(required)}
                  {required > 1 && (
                    <span className="ml-1 tabular-nums" aria-live="polite">
                      ({selected.length} of {required} selected)
                    </span>
                  )}
                </p>
                <OptionList
                  type={view.type}
                  options={view.options}
                  order={exam.optionOrder[questionId] ?? view.options.map((o) => o.id)}
                  selected={selected}
                  outcomes={null}
                  onToggle={(optionId) =>
                    store.dispatchExam({ type: 'select', questionId, optionId, at: Date.now() })
                  }
                  name={`${baseId}-${questionId}`}
                  legendId={legendId}
                  instructionsId={instructionsId}
                />
              </>
            ) : (
              <Notice tone="warning" title="Question unavailable">
                This question is no longer in the question bank, so it won&apos;t be scored. Move on
                to the next question.
              </Notice>
            )}
          </CardBody>
        </Card>

        {/* Desktop navigation */}
        <div className="mt-6 hidden items-center justify-between gap-3 sm:flex">
          <Button
            variant="secondary"
            icon={ArrowLeft}
            disabled={index === 0}
            onClick={() => {
              goTo(index - 1);
            }}
          >
            Previous
          </Button>
          <Link to="/exam/review" className={buttonClasses({ variant: 'ghost' })}>
            <ListChecks size={18} strokeWidth={1.75} aria-hidden="true" />
            Review all
          </Link>
          <Button
            icon={ArrowRight}
            iconPosition="end"
            disabled={index === total - 1}
            onClick={() => {
              goTo(index + 1);
            }}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Desktop question panel */}
      <aside className="hidden lg:block" aria-label="Question navigation">
        <Card className="sticky top-20">
          <CardHeader
            as="h2"
            title="Questions"
            description={`${counts.answered} answered · ${counts.flagged} flagged`}
          />
          <CardBody>
            <QuestionNavigator exam={exam} onSelect={goTo} />
          </CardBody>
        </Card>
      </aside>

      {/* Mobile bottom bar: fixed, with page padding so it never covers answers. */}
      <nav
        aria-label="Exam navigation"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur-sm sm:hidden"
      >
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            disabled={index === 0}
            onClick={() => {
              goTo(index - 1);
            }}
          >
            Prev
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={LayoutGrid}
            aria-haspopup="dialog"
            onClick={() => {
              setNavigatorOpen(true);
            }}
          >
            {index + 1} / {total}
            <span className="sr-only">: open question list</span>
          </Button>
          <Button
            size="sm"
            icon={ArrowRight}
            iconPosition="end"
            disabled={index === total - 1}
            onClick={() => {
              goTo(index + 1);
            }}
          >
            Next
          </Button>
        </div>
      </nav>

      {/* Tablet (sm–lg): question list button in flow */}
      <div className="hidden sm:block lg:hidden">
        <Button
          variant="secondary"
          icon={LayoutGrid}
          aria-haspopup="dialog"
          onClick={() => {
            setNavigatorOpen(true);
          }}
        >
          All questions
        </Button>
      </div>

      <Dialog
        open={navigatorOpen}
        onClose={() => {
          setNavigatorOpen(false);
        }}
        title="Questions"
        description={`${counts.answered} answered · ${counts.flagged} flagged`}
        footer={
          <Link to="/exam/review" className={buttonClasses({ variant: 'secondary' })}>
            Review all
          </Link>
        }
      >
        <QuestionNavigator
          exam={exam}
          onSelect={(target) => {
            goTo(target);
            setNavigatorOpen(false);
          }}
        />
      </Dialog>
    </div>
  );
}
