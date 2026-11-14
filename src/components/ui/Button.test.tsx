import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Flag, Play } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { Button, IconButton } from './Button';
import { buttonClasses } from './buttonStyles';

describe('Button', () => {
  it('renders a type="button" by default so it never submits forms accidentally', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'button');
  });

  it('calls onClick when activated by mouse or keyboard', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Start</Button>);
    const button = screen.getByRole('button', { name: 'Start' });
    await user.click(button);
    button.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('does not fire onClick when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Start
      </Button>,
    );
    await user.click(screen.getByRole('button', { name: 'Start' }));
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled();
  });

  it('hides its icon from assistive technology', () => {
    render(<Button icon={Play}>Play</Button>);
    const svg = screen.getByRole('button', { name: 'Play' }).querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies variant classes', () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole('button', { name: 'Delete' }).className).toContain('bg-danger');
  });
});

describe('IconButton', () => {
  it('uses its label as the accessible name', () => {
    render(<IconButton label="Flag question" icon={Flag} />);
    expect(screen.getByRole('button', { name: 'Flag question' })).toBeInTheDocument();
  });
});

describe('buttonClasses', () => {
  it('merges extra class names', () => {
    expect(buttonClasses({ variant: 'secondary', className: 'w-full' })).toMatch(
      /bg-surface-2.*w-full/,
    );
  });
});
