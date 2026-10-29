import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, ShieldOff, Users } from 'lucide-react';
import type { AdminUsersResult } from '@/backend/admin';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Notice } from '@/components/ui/Notice';
import { Skeleton } from '@/components/ui/Skeleton';
import { lastActivity, sortByActivity, summarizeUsers, type AdminUser } from '@/domain/admin/users';
import { formatDateTime } from '@/lib/format';
import { useAdminClient } from '@/state/AdminProvider';

type LoadState = { readonly status: 'loading' } | AdminUsersResult;

/** Signed-in accounts and their activity, for admins only (D-054). Linked in the navigation only for admins (D-055). */
export function AdminPage() {
  const client = useAdminClient();
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  const load = useCallback(() => {
    setState({ status: 'loading' });
    void client.fetchUsers().then(setState);
  }, [client]);

  useEffect(() => {
    let active = true;
    void client.fetchUsers().then((result) => {
      if (active) setState(result);
    });
    return () => {
      active = false;
    };
  }, [client]);

  return (
    <>
      <PageHeader
        title="Admin"
        description="Everyone who has signed in, with their activity. Guests aren't recorded; Vercel Analytics shows visit totals."
        actions={
          state.status === 'ok' && (
            <Button variant="secondary" icon={RefreshCw} onClick={load}>
              Refresh
            </Button>
          )
        }
      />
      <AdminContent state={state} onRetry={load} />
    </>
  );
}

function AdminContent({ state, onRetry }: { state: LoadState; onRetry: () => void }) {
  switch (state.status) {
    case 'loading':
      return (
        <div role="status" aria-label="Loading users" className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </div>
      );
    case 'forbidden':
      return (
        <Card>
          <EmptyState
            icon={ShieldOff}
            title="No admin access"
            description="This page is only for admins, and your account isn't one."
            className="py-16"
          />
        </Card>
      );
    case 'unavailable':
      return <Notice tone="warning">The admin page needs the Supabase backend.</Notice>;
    case 'error':
      return (
        <Notice
          tone="danger"
          title="Couldn't load users"
          action={
            <Button variant="secondary" size="sm" onClick={onRetry}>
              Try again
            </Button>
          }
        >
          {state.message}
        </Notice>
      );
    case 'ok':
      return <Overview users={state.users} />;
  }
}

function Overview({ users }: { users: readonly AdminUser[] }) {
  const [now] = useState(() => Date.now());
  const summary = summarizeUsers(users, now);
  const sorted = sortByActivity(users);
  return (
    <div className="flex flex-col gap-6">
      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Signed-in users" value={summary.users} />
        <Stat label="Active in the last 7 days" value={summary.activeLastWeek} />
        <Stat label="Questions answered" value={summary.questionsAnswered} />
        <Stat label="Exams taken" value={summary.examAttempts} />
      </dl>
      <Card>
        <CardHeader title="Users" description="Most recently active first." />
        {sorted.length === 0 ? (
          <EmptyState icon={Users} title="No users yet" description="Nobody has signed in yet." />
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[48rem] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-fg-muted">
                  <th scope="col" className="px-5 py-2 font-medium">
                    User
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Signed up
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Last active
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    Answered
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    Sessions
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    Exams
                  </th>
                  <th scope="col" className="px-5 py-2 text-right font-medium">
                    Best score
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sorted.map((user) => (
                  <tr key={user.id}>
                    <th scope="row" className="px-5 py-3 text-left font-normal">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-fg">
                          {user.name ?? user.email ?? 'Unknown'}
                        </span>
                        {user.provider && <Badge>{user.provider}</Badge>}
                      </span>
                      {user.name && user.email && (
                        <span className="block text-fg-muted">{user.email}</span>
                      )}
                    </th>
                    <td className="px-3 py-3 whitespace-nowrap text-fg-muted">
                      {formatDateTime(user.signedUpAt)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-fg-muted">
                      {formatDateTime(lastActivity(user))}
                    </td>
                    <td className="px-3 py-3 text-right text-fg tabular-nums">
                      {user.questionsAnswered}
                    </td>
                    <td className="px-3 py-3 text-right text-fg tabular-nums">
                      {user.practiceSessions}
                    </td>
                    <td className="px-3 py-3 text-right text-fg tabular-nums">
                      {user.examAttempts}
                    </td>
                    <td className="px-5 py-3 text-right text-fg tabular-nums">
                      {user.bestExamPercent === null ? '—' : `${String(user.bestExamPercent)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-5">
      <dt className="text-sm text-fg-muted">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold text-fg tabular-nums">{value}</dd>
    </Card>
  );
}
