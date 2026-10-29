import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DEVELOPER } from '@/app/developer';
import { createFakeAuthClient } from '@/backend/fakeAuth';
import { renderApp } from '@/test/renderApp';

const CREDIT = new RegExp(`^${DEVELOPER.name}`);

describe('Developer credit', () => {
  it('AC-D.1 the navigation footer links the developer’s portfolio in a new tab', async () => {
    renderApp('/dashboard', { auth: createFakeAuthClient() });
    await screen.findByRole('heading', { level: 1 });
    const [link] = screen.getAllByRole('link', { name: CREDIT });
    expect(link).toHaveAttribute('href', DEVELOPER.url);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link?.closest('p')).toHaveTextContent(`Made by ${DEVELOPER.name}`);
  });

  it('AC-D.2 the Privacy page says who runs CloudPrep', async () => {
    renderApp('/privacy', { auth: createFakeAuthClient() });
    expect(await screen.findByRole('heading', { name: 'Who runs CloudPrep' })).toBeVisible();
    const main = screen.getByRole('main');
    expect(within(main).getByRole('link', { name: CREDIT })).toHaveAttribute('href', DEVELOPER.url);
  });
});
