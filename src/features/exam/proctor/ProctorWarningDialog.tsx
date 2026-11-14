import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { EVENT_DESCRIPTIONS, type IntegrityEvent } from '@/domain/exam/integrity';
import { MAX_STRIKES } from '@/domain/exam/proctor';

/** The proctor's warning after a violation, like a human proctor speaking up. */
export function ProctorWarningDialog({
  warning,
  strikeCount,
  onAcknowledge,
}: {
  warning: IntegrityEvent | null;
  strikeCount: number;
  onAcknowledge: () => void;
}) {
  const info = warning ? EVENT_DESCRIPTIONS[warning.type] : null;
  const final = strikeCount >= MAX_STRIKES - 1;
  return (
    <Dialog
      open={warning !== null}
      onClose={onAcknowledge}
      title={
        final
          ? 'Final warning from the proctor'
          : `Proctor warning ${strikeCount} of ${MAX_STRIKES - 1}`
      }
      description={info ? `${info.label}. ${info.explanation}` : undefined}
      footer={<Button onClick={onAcknowledge}>I understand</Button>}
    >
      <p className="text-sm text-fg">{info?.action}</p>
      <p className="mt-3 text-sm font-medium text-danger">
        {final
          ? 'One more violation will end your exam.'
          : `${MAX_STRIKES - strikeCount} more violations will end your exam.`}
      </p>
      <p className="mt-3 text-xs text-fg-subtle">
        The timer keeps running. Use the button, not Esc: Esc also leaves fullscreen, which is
        another violation.
      </p>
    </Dialog>
  );
}
