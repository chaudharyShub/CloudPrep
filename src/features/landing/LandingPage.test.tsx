import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createFakeAuthClient } from '@/backend/fakeAuth';
import { renderApp } from '@/test/renderApp';

describe('Landing page', () => {
  it('AC-V.7 guests see the landing page with ways in', async () => {
    renderApp('/', { auth: createFakeAuthClient() });
    expect(await screen.findByRole('heading', { level: 1, name: /Sit the exam/ })).toBeVisible();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('link', { name: /Start practising — free/ })).toHaveAttribute(
      'href',
      '/practice',
    );
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/sign-in');
    expect(
      screen.getByText(/Not affiliated with or endorsed by Amazon Web Services/),
    ).toBeVisible();
    for (const domain of ['Cloud Concepts', 'Security and Compliance']) {
      expect(screen.getByText(domain)).toBeVisible();
    }
  });

  it('AC-V.7 signed-in users go straight to the dashboard', async () => {
    const { router } = renderApp('/');
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/dashboard');
    });
  });
});
