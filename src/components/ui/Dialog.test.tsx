import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';
import { ConfirmDialog } from './ConfirmDialog';
import { Dialog } from './Dialog';

function DialogHarness({ onClose }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        Open
      </Button>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          onClose?.();
        }}
        title="Example"
        description="Example description"
      >
        <p>Body</p>
      </Dialog>
    </>
  );
}

describe('Dialog', () => {
  it('is hidden until opened, then exposes an accessible name and description', async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = screen.getByRole('dialog', { name: 'Example' });
    expect(dialog).toHaveAccessibleDescription('Example description');
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<DialogHarness onClose={onClose} />);
    const trigger = screen.getByRole('button', { name: 'Open' });

    await user.click(trigger);
    screen.getByRole('button', { name: 'Close' }).focus();
    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes with the close button', async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('ConfirmDialog', () => {
  function renderConfirm(props: Partial<Parameters<typeof ConfirmDialog>[0]> = {}) {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Reset all data?"
        description="This can't be undone."
        confirmLabel="Reset data"
        tone="danger"
        onConfirm={onConfirm}
        onCancel={onCancel}
        {...props}
      />,
    );
    return { onConfirm, onCancel, user: userEvent.setup() };
  }

  it('calls onConfirm when confirmed', async () => {
    const { onConfirm, user } = renderConfirm();
    await user.click(screen.getByRole('button', { name: 'Reset data' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel from the cancel button', async () => {
    const { onCancel, onConfirm, user } = renderConfirm();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('requires the exact confirmation text before confirming', async () => {
    const { onConfirm, user } = renderConfirm({ confirmationText: 'RESET' });
    const confirm = screen.getByRole('button', { name: 'Reset data' });
    const input = screen.getByRole('textbox', { name: /type reset to confirm/i });

    expect(confirm).toBeDisabled();
    await user.type(input, 'reset');
    expect(confirm).toBeDisabled();
    await user.keyboard('{Enter}');
    expect(onConfirm).not.toHaveBeenCalled();

    await user.clear(input);
    await user.type(input, 'RESET');
    expect(confirm).toBeEnabled();
    await user.keyboard('{Enter}');
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
