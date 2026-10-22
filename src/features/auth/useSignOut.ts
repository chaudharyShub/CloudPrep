import { useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/state/AuthProvider';

/** Signs out and confirms with a toast. Pages that need sign-in then redirect by themselves. */
export function useSignOut(): () => Promise<void> {
  const { client } = useAuth();
  const { showToast } = useToast();
  return useCallback(async () => {
    const result = await client.signOut();
    if (result.ok) showToast({ title: 'Signed out', tone: 'success' });
    else showToast({ title: "Couldn't sign out", description: result.message, tone: 'danger' });
  }, [client, showToast]);
}
