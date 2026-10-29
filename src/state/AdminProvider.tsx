import { createContext, use, type ReactNode } from 'react';
import { unavailableAdminClient, type AdminClient } from '@/backend/admin';

const AdminContext = createContext<AdminClient>(unavailableAdminClient);

/** Provides the admin overview's client (D-054); only the Admin page uses it. */
export function AdminProvider({ client, children }: { client: AdminClient; children: ReactNode }) {
  return <AdminContext value={client}>{children}</AdminContext>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook belongs with its provider
export function useAdminClient(): AdminClient {
  return use(AdminContext);
}
