import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { parseAdminUsers, supabaseAdminClient } from './admin';

const ROW = {
  user_id: '00000000-0000-4000-8000-00000000000a',
  email: 'alice@example.com',
  display_name: 'Alice',
  provider: 'google',
  signed_up_at: '2026-10-20T10:00:00Z',
  last_sign_in_at: '2026-10-28T09:00:00Z',
  questions_answered: 42,
  last_answered_at: '2026-10-28T09:30:00Z',
  practice_sessions: 3,
  exam_attempts: 2,
  best_exam_percent: '78.5',
  last_exam_at: null,
};

function fakeSupabase(result: { data: unknown; error: { code: string; message: string } | null }) {
  return {
    rpc: (name: string) => {
      expect(name).toBe('admin_user_overview');
      return Promise.resolve(result);
    },
  } as unknown as SupabaseClient;
}

describe('admin overview client', () => {
  it('AC-A.4 parses rows and skips malformed ones', () => {
    expect(parseAdminUsers([ROW, { user_id: 'x' }, null, 'nope', { ...ROW, user_id: '' }])).toEqual(
      [
        {
          id: ROW.user_id,
          email: 'alice@example.com',
          name: 'Alice',
          provider: 'google',
          signedUpAt: Date.parse(ROW.signed_up_at),
          lastSignInAt: Date.parse(ROW.last_sign_in_at),
          questionsAnswered: 42,
          lastAnsweredAt: Date.parse(ROW.last_answered_at),
          practiceSessions: 3,
          examAttempts: 2,
          bestExamPercent: 78.5,
          lastExamAt: null,
        },
      ],
    );
    expect(parseAdminUsers({})).toEqual([]);
  });

  it('AC-A.4 bad counts and percents fall back safely', () => {
    const [user] = parseAdminUsers([
      { ...ROW, questions_answered: -1, exam_attempts: 1.5, best_exam_percent: 140 },
    ]);
    expect(user?.questionsAnswered).toBe(0);
    expect(user?.examAttempts).toBe(0);
    expect(user?.bestExamPercent).toBeNull();
  });

  it('AC-A.2 maps the database refusal to forbidden, and other errors to error', async () => {
    const forbidden = supabaseAdminClient(() =>
      Promise.resolve(
        fakeSupabase({ data: null, error: { code: '42501', message: 'Admins only.' } }),
      ),
    );
    expect(await forbidden.fetchUsers()).toEqual({ status: 'forbidden' });

    const failing = supabaseAdminClient(() =>
      Promise.resolve(fakeSupabase({ data: null, error: { code: '500', message: 'Down' } })),
    );
    expect(await failing.fetchUsers()).toEqual({ status: 'error', message: 'Down' });

    const offline = supabaseAdminClient(() => Promise.reject(new Error('Offline')));
    expect(await offline.fetchUsers()).toEqual({ status: 'error', message: 'Offline' });

    const ok = supabaseAdminClient(() =>
      Promise.resolve(fakeSupabase({ data: [ROW], error: null })),
    );
    const result = await ok.fetchUsers();
    expect(result.status === 'ok' && result.users.map((u) => u.email)).toEqual([
      'alice@example.com',
    ]);
  });
});
