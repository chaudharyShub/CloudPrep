import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DEVELOPER, FRONTEND_PREP } from '@/app/developer';
import { createFakeAuthClient } from '@/backend/fakeAuth';
import { renderApp } from '@/test/renderApp';

const CREDIT = new RegExp(`^${DEVELOPER.name}`);
const OTHER_SITE = new RegExp(`^${FRONTEND_PREP.name}`);

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

  it('AC-D.3 the navigation footer links Frontend Interview Prep in a new tab, under the credit', async () => {
    renderApp('/dashboard', { auth: createFakeAuthClient() });
    await screen.findByRole('heading', { level: 1 });
    const [link] = screen.getAllByRole('link', { name: OTHER_SITE });
    expect(link).toHaveAttribute('href', FRONTEND_PREP.url);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link?.closest('p')).toHaveTextContent(`Also by me: ${FRONTEND_PREP.name}`);
  });

  it('AC-D.3 the landing page footer shows the same link to guests', async () => {
    renderApp('/', { auth: createFakeAuthClient() });
    await screen.findByRole('heading', { level: 1 });
    expect(screen.getByRole('link', { name: OTHER_SITE })).toHaveAttribute(
      'href',
      FRONTEND_PREP.url,
    );
  });

  it('AC-D.4 the Privacy page mentions Frontend Interview Prep under who runs CloudPrep', async () => {
    renderApp('/privacy', { auth: createFakeAuthClient() });
    await screen.findByRole('heading', { name: 'Who runs CloudPrep' });
    const main = screen.getByRole('main');
    expect(within(main).getByRole('link', { name: OTHER_SITE })).toHaveAttribute(
      'href',
      FRONTEND_PREP.url,
    );
  });

  it('AC-D.5 the Privacy page says how the questions were made and links both licences', async () => {
    renderApp('/privacy', { auth: createFakeAuthClient() });
    const heading = await screen.findByRole('heading', {
      name: 'Licence and how the questions were made',
    });
    expect(heading).toBeVisible();
    const main = screen.getByRole('main');
    expect(within(main).getByText(/written with AI assistance/)).toBeVisible();
    expect(within(main).getByRole('link', { name: /^CC BY-NC-SA 4\.0/ })).toHaveAttribute(
      'href',
      'https://github.com/chaudharyShub/CloudPrep/blob/master/LICENSE-CONTENT.md',
    );
    expect(within(main).getByRole('link', { name: /^MIT License/ })).toHaveAttribute(
      'href',
      'https://github.com/chaudharyShub/CloudPrep/blob/master/LICENSE',
    );
  });
});
