import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { InfoTip } from './InfoTip';

function setup() {
  const user = userEvent.setup();
  render(
    <div>
      <InfoTip label="Review due">
        <p>Questions come back later.</p>
      </InfoTip>
      <button type="button">Elsewhere</button>
    </div>,
  );
  return { user, button: screen.getByRole('button', { name: 'About Review due' }) };
}

describe('InfoTip', () => {
  it('AC-I.1 opens and closes the explanation from the "i" button', async () => {
    const { user, button } = setup();
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Questions come back later.')).not.toBeVisible();

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Questions come back later.')).toBeVisible();
    expect(document.getElementById(button.getAttribute('aria-controls') ?? '')).toBeVisible();

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Questions come back later.')).not.toBeVisible();
  });

  it('AC-I.2 works from the keyboard and Escape closes it, returning focus', async () => {
    const { user, button } = setup();
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByText('Questions come back later.')).toBeVisible();

    await user.keyboard('{Escape}');
    expect(screen.queryByText('Questions come back later.')).not.toBeVisible();
    expect(button).toHaveFocus();
  });

  it('AC-I.3 closes on a click outside, but not on a click inside the explanation', async () => {
    const { user, button } = setup();
    await user.click(button);
    await user.click(screen.getByText('Questions come back later.'));
    expect(screen.getByText('Questions come back later.')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Elsewhere' }));
    expect(screen.queryByText('Questions come back later.')).not.toBeVisible();
  });
});
