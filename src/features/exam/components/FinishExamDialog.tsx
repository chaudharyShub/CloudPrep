import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { examCounts, type ExamSession } from '@/domain/exam/session';

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/** Shown while the exam is in the `confirming` state. */
export function FinishExamDialog({
  exam,
  onReturn,
  onSubmit,
}: {
  exam: ExamSession;
  onReturn: () => void;
  onSubmit: () => void;
}) {
  const counts = examCounts(exam);
  const notAnswered = counts.unanswered + counts.incomplete;
  return (
    <Dialog
      open={exam.status === 'confirming'}
      onClose={onReturn}
      title="Submit your exam?"
      description="You can't change your answers after submitting."
      footer={
        <>
          <Button variant="secondary" onClick={onReturn}>
            Return to exam
          </Button>
          <Button icon={Send} onClick={onSubmit}>
            Submit exam
          </Button>
        </>
      }
    >
      <dl className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md border border-border bg-surface-2 p-3">
          <dt className="text-xs text-fg-muted">Answered</dt>
          <dd className="text-xl font-semibold text-fg tabular-nums">{counts.answered}</dd>
        </div>
        <div className="rounded-md border border-border bg-surface-2 p-3">
          <dt className="text-xs text-fg-muted">Unanswered</dt>
          <dd className="text-xl font-semibold text-fg tabular-nums">{notAnswered}</dd>
        </div>
        <div className="rounded-md border border-border bg-surface-2 p-3">
          <dt className="text-xs text-fg-muted">Flagged</dt>
          <dd className="text-xl font-semibold text-fg tabular-nums">{counts.flagged}</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-col gap-2 text-sm text-fg-muted">
        {notAnswered > 0 && (
          <p>
            {plural(notAnswered, 'question')} {notAnswered === 1 ? "isn't" : "aren't"} fully
            answered
            {counts.incomplete > 0 && ` (${counts.incomplete} partly answered)`}. These are scored
            as incorrect.
          </p>
        )}
        {counts.flagged > 0 && (
          <p>
            {plural(counts.flagged, 'question')} {counts.flagged === 1 ? 'is' : 'are'} flagged.
            Flags are only reminders; they don&apos;t affect your score.
          </p>
        )}
        {notAnswered === 0 && counts.flagged === 0 && <p>Every question has an answer.</p>}
      </div>
    </Dialog>
  );
}
