import { Link } from 'react-router';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { buttonClasses } from '@/components/ui/buttonStyles';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useAuth } from '@/state/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { useSyncStatus } from '@/state/UserDataProvider';
import { describeGuestData, useGuestImport } from './useGuestImport';
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
            <SyncStatusLine />
            <GuestDataOffer />
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

/** Whether the account's data is on the server. */
function SyncStatusLine() {
  const status = useSyncStatus();
  let text: string;
  if (!status) text = 'Your progress is saved in this browser.';
  else if (status.state === 'retrying') {
    text = `${status.pending.toLocaleString('en')} ${status.pending === 1 ? 'change is' : 'changes are'} waiting to be saved to your account. CloudPrep keeps trying, for example when you're back online.`;
  } else if (status.state === 'syncing' || status.pending > 0) text = 'Saving to your account…';
  else text = 'Your progress, exam history and settings are saved to your account.';
  return (
    <p role="status" className="text-sm text-fg-muted">
      {text}
    </p>
  );
}

/** Offers to add this browser's guest data, if there is any. */
function GuestDataOffer() {
  const guestImport = useGuestImport();
  const { showToast } = useToast();
  if (!guestImport.available) return null;
  return (
    <div className="flex flex-col items-start gap-2 text-sm text-fg-muted">
      <p>
        This browser also has progress from using CloudPrep without signing in:{' '}
        {describeGuestData(guestImport.counts)}.
      </p>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          guestImport.add();
          showToast({ title: 'Progress added to your account', tone: 'success' });
        }}
      >
        Add it to my account
      </Button>
    </div>
  );
}
