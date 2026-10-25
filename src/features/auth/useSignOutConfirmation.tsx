import { useState, type ReactNode } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useSyncStatus } from '@/state/UserDataProvider';
import { useSignOut } from './useSignOut';

/**
 * Asks before signing out. `request` opens the dialog; render `dialog` next to the button.
 * The wording says whether everything is already saved to the account.
 */
export function useSignOutConfirmation(): { request: () => void; dialog: ReactNode } {
  const signOut = useSignOut();
  const sync = useSyncStatus();
  const [open, setOpen] = useState(false);

  const description =
    sync && sync.pending > 0
      ? "Some of your latest changes haven't reached your account yet. CloudPrep will try to save them first; anything it can't send stays in this browser until you sign in here again."
      : sync
        ? "Your progress is saved to your account, so it'll be here when you sign in again. Until then, this browser shows its guest data."
        : 'You can sign in again at any time.';

  return {
    request: () => {
      setOpen(true);
    },
    dialog: (
      <ConfirmDialog
        open={open}
        title="Sign out of CloudPrep?"
        description={description}
        confirmLabel="Sign out"
        onCancel={() => {
          setOpen(false);
        }}
        onConfirm={() => {
          setOpen(false);
          void signOut();
        }}
      />
    ),
  };
}
