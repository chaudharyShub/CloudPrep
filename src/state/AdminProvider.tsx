import { createContext, use, useEffect, useState, type ReactNode } from 'react';
import { unavailableAdminClient, type AdminClient } from '@/backend/admin';
import { useAuth } from './AuthProvider';

const AdminContext = createContext<AdminClient>(unavailableAdminClient);

/** Provides the admin overview's client (D-054). */
export function AdminProvider({ client, children }: { client: AdminClient; children: ReactNode }) {
  return <AdminContext value={client}>{children}</AdminContext>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook belongs with its provider
export function useAdminClient(): AdminClient {
  return use(AdminContext);
}

/**
 * True once the database says the signed-in user is an admin (D-055). It only shows or hides
 * the Admin link; the data stays protected by the database whatever this returns.
 */
// eslint-disable-next-line react-refresh/only-export-components -- hook belongs with its provider
export function useIsAdmin(): boolean {
  const client = useAdminClient();
  const { state } = useAuth();
  const userId = state.status === 'signed-in' ? state.user.id : null;
  // Keyed by user, so a previous account's answer is never shown for the next one.
  const [result, setResult] = useState<{ userId: string; admin: boolean } | null>(null);

  useEffect(() => {
    if (userId === null) return;
    let active = true;
    void client.isAdmin().then((admin) => {
      if (active) setResult({ userId, admin });
    });
    return () => {
      active = false;
    };
  }, [client, userId]);

  return userId !== null && result?.userId === userId && result.admin;
}
