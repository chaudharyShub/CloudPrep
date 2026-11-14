import { useId, useState, type ReactNode } from 'react';
import { Button } from './Button';
import { Dialog } from './Dialog';
import { TextInput } from './FormControls';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  /** If set, the user must type this exact text before confirming (for destructive actions). */
  confirmationText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, ...props }: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={props.onCancel}
      title={props.title}
      description={props.description}
    >
      {/* Dialog only renders children while open, so typed text resets on every open. */}
      <ConfirmDialogContent {...props} />
    </Dialog>
  );
}

function ConfirmDialogContent({
  confirmLabel,
  cancelLabel = 'Cancel',
  tone = 'primary',
  confirmationText,
  onConfirm,
  onCancel,
}: Omit<ConfirmDialogProps, 'open' | 'title' | 'description'>) {
  const [typed, setTyped] = useState('');
  const inputId = useId();
  const canConfirm = confirmationText === undefined || typed === confirmationText;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (canConfirm) onConfirm();
      }}
    >
      {confirmationText !== undefined && (
        <div className="mb-5">
          <label htmlFor={inputId} className="mb-1.5 block text-sm text-fg-muted">
            Type <strong className="font-semibold text-fg">{confirmationText}</strong> to confirm
          </label>
          <TextInput
            id={inputId}
            value={typed}
            onChange={(event) => {
              setTyped(event.target.value);
            }}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      )}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button
          type="submit"
          variant={tone === 'danger' ? 'danger' : 'primary'}
          disabled={!canConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </form>
  );
}
