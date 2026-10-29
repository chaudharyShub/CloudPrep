import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createFakeAdminClient } from '@/backend/fakeAdmin';
import { createFakeAuthClient } from '@/backend/fakeAuth';
import type { AdminUser } from '@/domain/admin/users';
import { renderApp } from '@/test/renderApp';

const HOUR = 60 * 60 * 1000;

function user(patch: Partial<AdminUser> & Pick<AdminUser, 'id'>): AdminUser {
  return {
    email: null,
    name: null,
    provider: 'google',
    signedUpAt: Date.now() - 100 * HOUR,
    lastSignInAt: null,
    questionsAnswered: 0,
    lastAnsweredAt: null,
    practiceSessions: 0,
    examAttempts: 0,
    bestExamPercent: null,
    lastExamAt: null,
    ...patch,
  };
}

const USERS = [
  user({
    id: 'a',
    email: 'old@example.com',
    name: 'Old Friend',
    signedUpAt: Date.now() - 900 * HOUR,
  }),
  user({
    id: 'b',
    email: 'busy@example.com',
    name: 'Busy Learner',
    lastAnsweredAt: Date.now() - HOUR,
    questionsAnswered: 120,
    practiceSessions: 6,
    examAttempts: 2,
    bestExamPercent: 81.5,
  }),
];

describe('Admin page', () => {
  it('AC-A.1 guests are sent to sign-in', async () => {
    const { router } = renderApp('/admin', { auth: createFakeAuthClient() });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/sign-in');
    });
  });

  it('AC-A.2 a signed-in user who is not an admin sees no data', async () => {
    renderApp('/admin', { admin: createFakeAdminClient({ users: USERS }) });
    expect(await screen.findByRole('heading', { name: 'No admin access' })).toBeInTheDocument();
    expect(screen.queryByText('busy@example.com')).not.toBeInTheDocument();
  });

  it('AC-A.3 an admin sees totals and users, most recently active first', async () => {
    renderApp('/admin', { admin: createFakeAdminClient({ admin: true, users: USERS }) });
    expect(await screen.findByRole('heading', { level: 1, name: 'Admin' })).toBeInTheDocument();
    const table = await screen.findByRole('table');
    const rows = within(table).getAllByRole('row').slice(1);
    expect(within(rows[0] as HTMLElement).getByRole('rowheader')).toHaveTextContent('Busy Learner');
    expect(rows[0]).toHaveTextContent('busy@example.com');
    expect(rows[0]).toHaveTextContent('81.5%');
    expect(within(rows[1] as HTMLElement).getByRole('rowheader')).toHaveTextContent('Old Friend');
    expect(screen.getByText('Signed-in users').nextSibling).toHaveTextContent('2');
    expect(screen.getByText('Active in the last 7 days').nextSibling).toHaveTextContent('1');
    expect(screen.getByText('Questions answered').nextSibling).toHaveTextContent('120');
  });

  it('AC-A.3 errors can be retried', async () => {
    const admin = createFakeAdminClient({ admin: true, failWith: 'Network down' });
    const { user } = renderApp('/admin', { admin });
    expect(await screen.findByText('Network down')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => {
      expect(admin.calls.count).toBe(2);
    });
  });

  it('AC-A.1 the admin page is not in the navigation', async () => {
    renderApp('/dashboard');
    await screen.findByRole('heading', { level: 1 });
    expect(screen.queryByRole('link', { name: /admin/i })).not.toBeInTheDocument();
  });

  it('AC-A.5 admins get an Admin link in the navigation that opens the admin page', async () => {
    const { user, router } = renderApp('/dashboard', {
      admin: createFakeAdminClient({ admin: true, users: USERS }),
    });
    const [link] = await screen.findAllByRole('link', { name: 'Admin' });
    expect(link).toHaveAttribute('href', '/admin');
    await user.click(link as HTMLElement);
    expect(await screen.findByRole('heading', { level: 1, name: 'Admin' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/admin');
  });

  it('AC-A.5 guests never see the Admin link', async () => {
    renderApp('/practice', {
      auth: createFakeAuthClient(),
      admin: createFakeAdminClient({ admin: true }),
    });
    await screen.findByRole('heading', { level: 1 });
    expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();
  });
});
