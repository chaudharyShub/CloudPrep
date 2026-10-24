import { EXAM_ID } from '@/domain/exam-guide/clf-c02';
import type { UserDataRemote } from '@/storage/sync';
import { getSupabase, readSupabaseConfig } from './supabaseClient';
import { createUserDataRemote, supabaseUserTables, type UserTables } from './userDataRemote';

/** Where E2E builds keep the fake server's rows, when a test turns sync on. */
export const E2E_REMOTE_KEY = 'cloudprep-e2e-remote';

declare global {
  interface Window {
    /** E2E only: set by a test (init script) to sync with a fake server in localStorage. */
    __cloudprepE2ESync?: boolean;
  }
}

/** E2E only: the fake tables, loaded on first use and saved in localStorage. */
function e2eUserTables(): UserTables {
  let loading: Promise<UserTables> | null = null;
  const tables = () =>
    (loading ??= import('./fakeUserTables').then(({ createFakeUserTables }) => {
      // eslint-disable-next-line no-restricted-syntax -- E2E-only fake server, not app data
      const storage = window.localStorage;
      let initial = {};
      try {
        initial = JSON.parse(storage.getItem(E2E_REMOTE_KEY) ?? '{}') as typeof initial;
      } catch {
        initial = {};
      }
      return createFakeUserTables(initial, (rows) => {
        storage.setItem(E2E_REMOTE_KEY, JSON.stringify(rows));
      });
    }));
  return {
    select: async (table, query) => (await tables()).select(table, query),
    upsert: async (table, rows, onConflict) => (await tables()).upsert(table, rows, onConflict),
    delete: async (table, query) => (await tables()).delete(table, query),
  };
}

/**
 * The server copy of a signed-in user's data (D-047): Supabase, a fake in E2E builds when a
 * test asks for it, or null (the account copy then stays in this browser only).
 */
export function createAccountRemote(userId: string): UserDataRemote | null {
  if (import.meta.env.MODE === 'e2e') {
    return window.__cloudprepE2ESync
      ? createUserDataRemote(e2eUserTables(), userId, EXAM_ID)
      : null;
  }
  const config = readSupabaseConfig(import.meta.env);
  if (!config) return null;
  return createUserDataRemote(
    supabaseUserTables(() => getSupabase(config)),
    userId,
    EXAM_ID,
  );
}
