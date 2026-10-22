import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { unavailableAuthClient } from '@/backend/auth';
import { createFakeAuthClient, FAKE_USER } from '@/backend/fakeAuth';
import { renderApp } from '@/test/renderApp';

const guest = () => createFakeAuthClient();

describe('sign-in', () => {
  it('AC-B.6 sends guests from signed-in-only pages to sign-in', async () => {
    for (const path of [
      '/dashboard',
      '/exam',
      '/exam/session',
      '/history',
      '/progress',
      '/results/x',
    ]) {
      const { router, unmount } = renderApp(path, { auth: guest() });
      expect(await screen.findByRole('heading', { level: 1, name: 'Sign in' })).toBeVisible();
      expect(router.state.location.pathname).toBe('/sign-in');
      unmount();
    }
  });

  it('AC-B.6 lets guests use Learning mode, bookmarks and settings', async () => {
    for (const [path, heading] of [
      ['/practice', 'Learning mode'],
      ['/bookmarks', 'Bookmarks'],
      ['/settings', 'Settings'],
    ] as const) {
      const { unmount } = renderApp(path, { auth: guest() });
      expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeVisible();
      unmount();
    }
  });

  it('AC-B.6 AC-B.8 returns to the requested page after signing in with Google', async () => {
    const auth = guest();
    const { router, user } = renderApp('/history', { auth });
    expect(await screen.findByText('Sign in to continue')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Continue with Google' }));
    expect(auth.calls.google).toEqual([`${window.location.origin}/auth/callback?next=%2Fhistory`]);
    expect(await screen.findByRole('heading', { level: 1, name: 'Exam history' })).toBeVisible();
    expect(router.state.location.pathname).toBe('/history');
  });

  it('AC-B.8 shows a Google sign-in failure', async () => {
    const { user } = renderApp('/sign-in', {
      auth: createFakeAuthClient({ failWith: 'Provider is not enabled' }),
    });
    await user.click(await screen.findByRole('button', { name: 'Continue with Google' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Provider is not enabled');
  });

  it('AC-B.7 emails a sign-in link and says to open it in this browser', async () => {
    const auth = guest();
    const { user } = renderApp('/sign-in?next=%2Fprogress', { auth });
    const email = await screen.findByLabelText('Email address');

    await user.click(screen.getByRole('button', { name: 'Email me a sign-in link' }));
    expect(email).toHaveAccessibleDescription(/Enter an email address/);
    expect(email).toBeInvalid();
    expect(auth.calls.magicLinks).toEqual([]);

    await user.type(email, 'ada@example.com');
    await user.click(screen.getByRole('button', { name: 'Email me a sign-in link' }));
    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent('ada@example.com');
    expect(status).toHaveTextContent(/Open it in this browser/);
    expect(auth.calls.magicLinks).toEqual([
      {
        email: 'ada@example.com',
        redirectTo: `${window.location.origin}/auth/callback?next=%2Fprogress`,
      },
    ]);

    await user.click(within(status).getByRole('button', { name: 'Use a different email' }));
    expect(screen.getByLabelText('Email address')).toBeVisible();
  });

  it('AC-B.7 shows why a link could not be sent', async () => {
    const { user } = renderApp('/sign-in', {
      auth: createFakeAuthClient({ failWith: 'Too many sign-in attempts.' }),
    });
    await user.type(await screen.findByLabelText('Email address'), 'ada@example.com');
    await user.click(screen.getByRole('button', { name: 'Email me a sign-in link' }));
    expect(await screen.findByText('Too many sign-in attempts.')).toBeVisible();
  });

  it('AC-B.9 the callback opens the requested page once signed in', async () => {
    const { router } = renderApp('/auth/callback?next=%2Fprogress');
    expect(await screen.findByRole('heading', { level: 1, name: 'Progress' })).toBeVisible();
    expect(router.state.location.pathname).toBe('/progress');
  });

  it('AC-B.9 the callback never leaves the site', async () => {
    const { router } = renderApp('/auth/callback?next=%2F%2Fevil.example');
    await screen.findByRole('heading', { level: 1, name: 'Dashboard' });
    expect(router.state.location.pathname).toBe('/dashboard');
  });

  it('AC-B.9 explains a failed or expired link and offers to try again', async () => {
    renderApp(
      '/auth/callback?next=%2Fhistory&error_description=Email+link+is+invalid+or+has+expired',
      {
        auth: guest(),
      },
    );
    expect(
      await screen.findByRole('heading', { level: 1, name: "Sign-in didn't work" }),
    ).toBeVisible();
    expect(screen.getByText(/Email link is invalid or has expired/)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Try again' })).toHaveAttribute(
      'href',
      '/sign-in?next=%2Fhistory',
    );
  });

  it('AC-B.10 shows the account and signs out from Settings', async () => {
    const auth = createFakeAuthClient({ user: FAKE_USER });
    const { user } = renderApp('/settings', { auth });
    const account = (await screen.findByRole('heading', { name: 'Account' })).closest(
      'div.rounded-lg',
    );
    expect(account).not.toBeNull();
    const card = within(account as HTMLElement);
    expect(card.getByText('learner@example.com')).toBeVisible();
    expect(card.getByText('Test Learner')).toBeVisible();

    await user.click(card.getByRole('button', { name: 'Sign out' }));
    expect(await screen.findByText('Signed out')).toBeVisible();
    expect(await screen.findByText(/using CloudPrep as a guest/)).toBeVisible();
  });

  it('AC-B.10 signing out on a signed-in-only page leads to sign-in', async () => {
    const auth = createFakeAuthClient({ user: FAKE_USER });
    const { router, user } = renderApp('/history', { auth });
    await screen.findByRole('heading', { level: 1, name: 'Exam history' });
    const nav = screen.getAllByRole('button', { name: 'Sign out' })[0];
    expect(nav).toBeDefined();
    await user.click(nav as HTMLElement);
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/sign-in');
    });
    expect(screen.getAllByRole('link', { name: 'Sign in' }).length).toBeGreaterThan(0);
  });

  it('AC-B.10 a signed-in visitor to the sign-in page goes to the dashboard', async () => {
    const { router } = renderApp('/sign-in');
    await screen.findByRole('heading', { level: 1, name: 'Dashboard' });
    expect(router.state.location.pathname).toBe('/dashboard');
  });

  it('AC-B.11 explains when sign-in is not set up, and Learning mode still works', async () => {
    const { unmount } = renderApp('/dashboard', { auth: unavailableAuthClient });
    expect(await screen.findByText("Sign-in isn't available")).toBeVisible();
    expect(screen.queryByLabelText('Email address')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Sign in' })).toBeNull();
    unmount();
    renderApp('/practice', { auth: unavailableAuthClient });
    expect(await screen.findByRole('heading', { level: 1, name: 'Learning mode' })).toBeVisible();
  });
});
