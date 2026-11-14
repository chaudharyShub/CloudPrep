import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from './Button';
import { ToastProvider, useToast, type ToastOptions } from './Toast';

function Trigger({ options }: { options: ToastOptions }) {
  const { showToast } = useToast();
  return (
    <Button
      onClick={() => {
        showToast(options);
      }}
    >
      Notify
    </Button>
  );
}

function renderWithToast(options: ToastOptions) {
  render(
    <ToastProvider>
      <Trigger options={options} />
    </ToastProvider>,
  );
}

describe('Toast', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a toast inside a polite live region', async () => {
    const user = userEvent.setup();
    renderWithToast({ title: 'Saved', description: 'Your settings were saved.' });
    await user.click(screen.getByRole('button', { name: 'Notify' }));

    const region = screen.getByRole('region', { name: 'Notifications' });
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('status')).toHaveTextContent('Saved');
    expect(screen.getByRole('status')).toHaveTextContent('Your settings were saved.');
  });

  it('can be dismissed', async () => {
    const user = userEvent.setup();
    renderWithToast({ title: 'Saved', durationMs: null });
    await user.click(screen.getByRole('button', { name: 'Notify' }));
    await user.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('dismisses itself after its duration', () => {
    vi.useFakeTimers();
    renderWithToast({ title: 'Saved', durationMs: 3000 });
    fireEvent.click(screen.getByRole('button', { name: 'Notify' }));
    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(screen.getByRole('status')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('keeps at most three toasts visible', async () => {
    const user = userEvent.setup();
    renderWithToast({ title: 'Saved', durationMs: null });
    const button = screen.getByRole('button', { name: 'Notify' });
    for (let i = 0; i < 5; i++) await user.click(button);
    expect(screen.getAllByRole('status')).toHaveLength(3);
  });

  it('throws a clear error outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Trigger options={{ title: 'x' }} />)).toThrow(/ToastProvider/);
  });
});
