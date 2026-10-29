import {
  parseAdminUsers,
  supabaseAdminClient,
  unavailableAdminClient,
  type AdminClient,
} from './admin';
import { getSupabase, readSupabaseConfig } from './supabaseClient';

declare global {
  interface Window {
    /** E2E only: set by a test (init script) to make the fake user an admin with these rows. */
    __cloudprepE2EAdmin?: unknown[];
  }
}

/**
 * The admin overview's client (D-054): a fake in E2E builds (this branch is removed from
 * production builds), otherwise Supabase; "unavailable" without Supabase settings.
 */
export function createAdminClient(): AdminClient {
  if (import.meta.env.MODE === 'e2e') {
    return {
      fetchUsers: async () => {
        const { createFakeAdminClient } = await import('./fakeAdmin');
        const rows = window.__cloudprepE2EAdmin;
        return createFakeAdminClient({
          admin: rows !== undefined,
          users: parseAdminUsers(rows),
        }).fetchUsers();
      },
      isAdmin: () => Promise.resolve(window.__cloudprepE2EAdmin !== undefined),
    };
  }
  const config = readSupabaseConfig(import.meta.env);
  if (!config) return unavailableAdminClient;
  return supabaseAdminClient(() => getSupabase(config));
}
