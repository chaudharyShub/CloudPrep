import { Link } from 'react-router';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { buttonClasses } from '@/components/ui/buttonStyles';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useAuth } from '@/state/AuthProvider';
import { useSignOut } from './useSignOut';

/** Settings: the signed-in account, or how to sign in. */
export function AccountCard() {
  const { state, client } = useAuth();
  const signOut = useSignOut();

  if (state.status === 'loading' || !client.available) return null;

  return (
    <Card>
      <CardHeader title="Account" />
      <CardBody className="flex flex-col items-start gap-4">
        {state.status === 'signed-in' ? (
          <>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              {state.user.name && (
                <>
                  <dt className="text-fg-muted">Name</dt>
                  <dd className="text-fg">{state.user.name}</dd>
                </>
              )}
              <dt className="text-fg-muted">Email</dt>
              <dd className="break-all text-fg">{state.user.email ?? '—'}</dd>
            </dl>
            <p className="text-sm text-fg-muted">
              Your progress and exam history are still saved in this browser. Saving them to your
              account is coming next.
            </p>
            <Button variant="secondary" size="sm" icon={LogOut} onClick={() => void signOut()}>
              Sign out
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-fg-muted">
              You're using CloudPrep as a guest. Sign in to use mock exams, the dashboard, exam
              history and progress.
            </p>
            <Link to="/sign-in" className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
              Sign in
            </Link>
          </>
        )}
      </CardBody>
    </Card>
  );
}
