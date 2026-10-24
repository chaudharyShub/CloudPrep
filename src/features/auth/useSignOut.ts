import { useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/state/AuthProvider';
import { useUserDataScope } from '@/state/UserDataProvider';

/** How long sign-out waits for unsaved changes to reach the server. */
export const SIGN_OUT_FLUSH_MS = 5_000;

/**
 * Sends unsaved changes (the server only accepts them while signed in), signs out and
 * confirms with a toast. Pages that need sign-in then redirect by themselves.
 */
export function useSignOut(): () => Promise<void> {
  const { client } = useAuth();
  const { account } = useUserDataScope();
  const { showToast } = useToast();
  return useCallback(async () => {
    const sync = account?.sync;
    let saved = true;
    if (sync) {
      saved = await Promise.race([
        sync.flush(),
        new Promise<boolean>((resolve) => {
          setTimeout(() => {
            resolve(false);
          }, SIGN_OUT_FLUSH_MS);
        }),
      ]);
    }
    const result = await client.signOut();
    if (!result.ok) {
      showToast({ title: "Couldn't sign out", description: result.message, tone: 'danger' });
    } else if (!saved) {
      showToast({
        title: 'Signed out',
        description:
          "Some changes couldn't be saved to your account yet. They're kept in this browser and saved the next time you sign in here.",
        tone: 'warning',
      });
    } else {
      showToast({ title: 'Signed out', tone: 'success' });
    }
  }, [account, client, showToast]);
}
