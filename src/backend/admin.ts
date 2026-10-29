import type { SupabaseClient } from '@supabase/supabase-js';
import type { AdminUser } from '@/domain/admin/users';

/**
 * The admin overview (D-054): the list of signed-in accounts, which only admins may read.
 * The database decides who is an admin; the app just shows what it is given.
 */

export type AdminUsersResult =
  | { readonly status: 'ok'; readonly users: readonly AdminUser[] }
  | { readonly status: 'forbidden' }
  | { readonly status: 'unavailable' }
  | { readonly status: 'error'; readonly message: string };

export interface AdminClient {
  fetchUsers(): Promise<AdminUsersResult>;
  /** Whether the signed-in user is an admin; only decides if the Admin link shows. False on errors. */
  isAdmin(): Promise<boolean>;
}

export const unavailableAdminClient: AdminClient = {
  fetchUsers: () => Promise.resolve({ status: 'unavailable' }),
  isAdmin: () => Promise.resolve(false),
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const text = (value: unknown): string | null =>
  typeof value === 'string' && value !== '' ? value : null;

const time = (value: unknown): number | null => {
  if (typeof value !== 'string') return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
};

const count = (value: unknown): number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : 0;

// Postgres numerics may arrive as strings.
const percent = (value: unknown): number | null => {
  const n = typeof value === 'string' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 100 ? n : null;
};

/** Hand-written parser (D-005): rows without an id or sign-up time are skipped. */
export function parseAdminUsers(data: unknown): AdminUser[] {
  if (!Array.isArray(data)) return [];
  const users: AdminUser[] = [];
  for (const row of data) {
    if (!isRecord(row)) continue;
    const id = text(row['user_id']);
    const signedUpAt = time(row['signed_up_at']);
    if (id === null || signedUpAt === null) continue;
    users.push({
      id,
      email: text(row['email']),
      name: text(row['display_name']),
      provider: text(row['provider']),
      signedUpAt,
      lastSignInAt: time(row['last_sign_in_at']),
      questionsAnswered: count(row['questions_answered']),
      lastAnsweredAt: time(row['last_answered_at']),
      practiceSessions: count(row['practice_sessions']),
      examAttempts: count(row['exam_attempts']),
      bestExamPercent: percent(row['best_exam_percent']),
      lastExamAt: time(row['last_exam_at']),
    });
  }
  return users;
}

/** Postgres "insufficient privilege", raised by the function for non-admins. */
const FORBIDDEN_CODE = '42501';

export function supabaseAdminClient(getClient: () => Promise<SupabaseClient>): AdminClient {
  return {
    async fetchUsers() {
      try {
        const supabase = await getClient();
        // The client is untyped, so read the result as unknown and parse it.
        const response: { data: unknown; error: { code: string; message: string } | null } =
          await supabase.rpc('admin_user_overview');
        const { data, error } = response;
        if (error) {
          return error.code === FORBIDDEN_CODE
            ? { status: 'forbidden' }
            : { status: 'error', message: error.message };
        }
        return { status: 'ok', users: parseAdminUsers(data) };
      } catch (error) {
        return {
          status: 'error',
          message: error instanceof Error ? error.message : 'Something went wrong.',
        };
      }
    },
    async isAdmin() {
      try {
        const supabase = await getClient();
        const response: { data: unknown; error: unknown } = await supabase.rpc('is_admin');
        return response.error === null && response.data === true;
      } catch {
        return false;
      }
    },
  };
}
