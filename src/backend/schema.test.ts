// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, describe, expect, it } from 'vitest';
import { QUESTION_BANK } from '@/content/questions';
import { EXAM_ID } from '@/domain/exam-guide/clf-c02';
import type { Question } from '@/domain/questions/types';
import { createMemoryDriver } from '@/storage/driver';
import { createAppStore } from '@/storage/store';
import { createSyncEngine, parseRemote } from '@/storage/sync';
import { EXAM_QUESTIONS } from '@/test/bank';
import { examQuestion, makeAttempt, makeExam } from '@/test/exam';
import { clfExamRows, isPublishable, questionToRows } from './contentRows';
import { createUserDataRemote, type SelectQuery, type UserTables } from './userDataRemote';

/**
 * Applies supabase/migrations to an in-process Postgres (PGlite) and checks constraints and
 * Row Level Security. The Supabase pieces the migrations rely on (roles, auth.users,
 * auth.uid()) are stubbed the way Supabase defines them.
 */

/** Migration SQL by path, applied in file-name (timestamp) order. */
const MIGRATIONS = import.meta.glob<string>('/supabase/migrations/*.sql', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const SUPABASE_STUB = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  grant usage on schema public to anon, authenticated, service_role;
  create schema auth;
  grant usage on schema auth to anon, authenticated, service_role;
  create table auth.users (
    id uuid primary key,
    email varchar(255),
    raw_user_meta_data jsonb not null default '{}',
    raw_app_meta_data jsonb not null default '{}',
    created_at timestamptz not null default now(),
    last_sign_in_at timestamptz
  );
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  grant execute on function auth.uid() to anon, authenticated, service_role;
`;

const ALICE = '00000000-0000-4000-8000-00000000000a';
const BOB = '00000000-0000-4000-8000-00000000000b';
const CAROL = '00000000-0000-4000-8000-00000000000c';

let db: PGlite;

async function asAdmin(): Promise<void> {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false);`);
}
async function asAnon(): Promise<void> {
  await asAdmin();
  await db.exec('set role anon;');
}
async function asUser(id: string): Promise<void> {
  await asAdmin();
  await db.exec(
    `set role authenticated; select set_config('request.jwt.claim.sub', '${id}', false);`,
  );
}
async function count(sql: string, params: unknown[] = []): Promise<number> {
  const result = await db.query<{ n: number }>(`select count(*)::int as n from ${sql}`, params);
  return result.rows[0]?.n ?? -1;
}

function insertRow(table: string, row: Record<string, unknown>) {
  const keys = Object.keys(row);
  const values = keys.map((key) => {
    const value = row[key];
    return value !== null && typeof value === 'object' && !Array.isArray(value)
      ? JSON.stringify(value)
      : Array.isArray(value) && value.some((item) => typeof item === 'object')
        ? JSON.stringify(value)
        : value;
  });
  const columns = keys.map((key) => `"${key}"`).join(', ');
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  return db.query(`insert into public.${table} (${columns}) values (${placeholders})`, values);
}

async function publish(questions: readonly Question[]): Promise<void> {
  const { exam, domains, topics } = clfExamRows();
  await insertRow('exams', { ...exam });
  for (const domain of domains) await insertRow('exam_domains', { ...domain });
  for (const topic of topics) await insertRow('exam_topics', { ...topic });
  for (const question of questions) {
    const rows = questionToRows(question, EXAM_ID);
    await insertRow('questions', { ...rows.question });
    await insertRow('question_keys', { ...rows.key });
    await insertRow('question_revisions', { ...rows.revision });
  }
}

/** `UserTables` on PGlite as the current role, like Supabase's API on Postgres. */
function pgUserTables(): UserTables {
  const where = (query: Pick<SelectQuery, 'eq' | 'in'>, params: unknown[]) => {
    const parts: string[] = [];
    for (const [column, value] of Object.entries(query.eq ?? {})) {
      params.push(value);
      parts.push(`"${column}" = $${params.length}`);
    }
    if (query.in) {
      params.push([...query.in.values]);
      parts.push(`"${query.in.column}"::text = any($${params.length})`);
    }
    return parts.length > 0 ? ` where ${parts.join(' and ')}` : '';
  };
  // Supabase sends dates as ISO strings; PGlite returns Date objects.
  const toWire = (row: Record<string, unknown>) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        key,
        value instanceof Date ? value.toISOString() : value,
      ]),
    );
  return {
    async select(table, query) {
      const params: unknown[] = [];
      let sql = `select * from public.${table}${where(query, params)}`;
      if (query.order) {
        sql += ` order by "${query.order.column}" ${query.order.ascending ? 'asc' : 'desc'}`;
      }
      if (query.limit !== undefined) sql += ` limit ${String(query.limit)}`;
      const { rows } = await db.query<Record<string, unknown>>(sql, params);
      return rows.map(toWire);
    },
    async upsert(table, rows, onConflict) {
      for (const row of rows) {
        const keys = Object.keys(row);
        const conflict = onConflict.split(',');
        const values = keys.map((key) => {
          const value = row[key];
          return value !== null && typeof value === 'object' && !Array.isArray(value)
            ? JSON.stringify(value)
            : value;
        });
        const updates = keys
          .filter((key) => !conflict.includes(key))
          .map((key) => `"${key}" = excluded."${key}"`);
        await db.query(
          `insert into public.${table} (${keys.map((key) => `"${key}"`).join(', ')})
           values (${keys.map((_, i) => `$${i + 1}`).join(', ')})
           on conflict (${conflict.map((key) => `"${key}"`).join(', ')})
           ${updates.length > 0 ? `do update set ${updates.join(', ')}` : 'do nothing'}`,
          values,
        );
      }
    },
    async delete(table, query) {
      const params: unknown[] = [];
      await db.query(`delete from public.${table}${where(query, params)}`, params);
    },
  };
}

const publishable = QUESTION_BANK.filter(isPublishable);
const visible = publishable.slice(0, 3);
const retired = {
  ...publishable[3],
  review: { ...publishable[3]?.review, status: 'retired' },
} as Question;

beforeAll(async () => {
  db = new PGlite();
  await db.exec(SUPABASE_STUB);
  const paths = Object.keys(MIGRATIONS).sort();
  expect(paths.length).toBeGreaterThan(0);
  for (const path of paths) await db.exec(MIGRATIONS[path] ?? '');
  await publish([...visible, retired]);
  await db.query(
    `insert into auth.users (id, raw_user_meta_data) values ($1, '{"full_name": "Alice"}'), ($2, '{}')`,
    [ALICE, BOB],
  );
}, 60_000);

describe('database schema', () => {
  it('AC-B.1 migrations apply and store a published question set', async () => {
    await asAdmin();
    expect(await count('public.questions')).toBe(4);
    expect(await count('public.question_keys')).toBe(4);
    expect(await count('public.exam_topics')).toBe(clfExamRows().topics.length);
  });

  it('AC-B.5 signing up creates a profile', async () => {
    await asAdmin();
    const { rows } = await db.query<{ id: string; display_name: string | null }>(
      'select id, display_name from public.profiles order by id',
    );
    expect(rows).toEqual([
      { id: ALICE, display_name: 'Alice' },
      { id: BOB, display_name: null },
    ]);
  });

  it('AC-B.3 guests and users read published, visible questions only', async () => {
    for (const as of [asAnon, () => asUser(ALICE)]) {
      await as();
      expect(await count('public.exams')).toBe(1);
      expect(await count('public.questions')).toBe(3);
      expect(await count('public.question_keys')).toBe(3);
      expect(await count('public.questions where id = $1', [retired.id])).toBe(0);
    }

    await asAdmin();
    await db.exec(`update public.exams set is_published = false`);
    await asAnon();
    expect(await count('public.exams')).toBe(0);
    expect(await count('public.questions')).toBe(0);
    await asAdmin();
    await db.exec(`update public.exams set is_published = true`);
  });

  it('AC-B.3 revisions (for reviewing past attempts) need sign-in and include retired questions', async () => {
    await asAnon();
    await expect(count('public.question_revisions')).rejects.toThrow(/permission denied/);
    await asUser(ALICE);
    expect(await count('public.question_revisions')).toBe(4);
  });

  it('AC-B.3 nobody but the service role writes content', async () => {
    for (const as of [asAnon, () => asUser(ALICE)]) {
      await as();
      await expect(db.exec(`update public.questions set stem = 'x'`)).rejects.toThrow(
        /permission denied/,
      );
      await expect(db.exec(`delete from public.question_keys`)).rejects.toThrow(
        /permission denied/,
      );
    }
  });

  it('AC-B.2 users only see and change their own data', async () => {
    await asUser(ALICE);
    await db.query(
      `insert into public.question_progress (exam_id, question_id, attempts, correct, last_result,
         first_answered_at, last_answered_at, last_incorrect_at, last_session_id)
       values ($1, 'clf-d1-0001', 2, 1, 'correct', now(), now(), now(), 's1')`,
      [EXAM_ID],
    );
    await db.query(
      `insert into public.bookmarks (exam_id, question_id) values ($1, 'clf-d1-0001')`,
      [EXAM_ID],
    );
    await db.query(
      `insert into public.user_preferences (preferences) values ('{"theme": "light"}')`,
    );
    await db.query(
      `insert into public.active_exams (exam_id, session) values ($1, '{"id": "e1"}')`,
      [EXAM_ID],
    );
    expect(await count('public.question_progress')).toBe(1);

    await asUser(BOB);
    for (const table of ['question_progress', 'bookmarks', 'user_preferences', 'active_exams']) {
      expect(await count(`public.${table}`)).toBe(0);
    }
    expect(await count('public.profiles')).toBe(1);
    // Writing a row for someone else is refused; updating or deleting theirs changes nothing.
    await expect(
      db.query(
        `insert into public.bookmarks (user_id, exam_id, question_id) values ($1, $2, 'x')`,
        [ALICE, EXAM_ID],
      ),
    ).rejects.toThrow(/row-level security/);
    const updated = await db.query(`update public.user_preferences set preferences = '{}'`);
    expect(updated.affectedRows).toBe(0);
    const deleted = await db.query(`delete from public.question_progress`);
    expect(deleted.affectedRows).toBe(0);

    await asAnon();
    await expect(count('public.question_progress')).rejects.toThrow(/permission denied/);
    await expect(count('public.profiles')).rejects.toThrow(/permission denied/);
  });

  it('AC-B.2 exam attempts and their questions stay private and are deleted together', async () => {
    await asUser(ALICE);
    await db.query(
      `insert into public.exam_attempts (id, exam_id, kind, bank_version, started_at, ends_at,
         duration_ms, submitted_at, submit_reason, time_used_ms, benchmark_percent, benchmark_met,
         summary)
       values ('a1', $1, 'short', 'v1', now() - interval '10 min', now(), 600000, now(), 'manual',
         600000, 70, true, '{"total": 1}')`,
      [EXAM_ID],
    );
    await db.query(
      `insert into public.exam_attempt_questions (attempt_id, position, question_id, revision,
         domain_id, topic_id, selected_option_ids, option_order, outcome)
       values ('a1', 0, 'clf-d1-0001', 1, 'D1', '1.1', '{a}', '{a,b,c,d}', 'correct')`,
    );
    await asUser(BOB);
    expect(await count('public.exam_attempts')).toBe(0);
    expect(await count('public.exam_attempt_questions')).toBe(0);
    // Bob can't attach questions to Alice's attempt.
    await expect(
      db.query(
        `insert into public.exam_attempt_questions (user_id, attempt_id, position, question_id,
           revision, domain_id, topic_id, option_order, outcome)
         values ($1, 'a1', 1, 'q', 1, 'D1', '1.1', '{a}', 'unanswered')`,
        [ALICE],
      ),
    ).rejects.toThrow(/row-level security/);

    await asUser(ALICE);
    await db.exec(`delete from public.exam_attempts where id = 'a1'`);
    expect(await count('public.exam_attempt_questions')).toBe(0);
  });

  it('AC-B.2 constraints reject inconsistent progress', async () => {
    await asUser(ALICE);
    const insert = (attempts: number, correct: number, result: string, lastIncorrect: string) =>
      db.query(
        `insert into public.question_progress (exam_id, question_id, attempts, correct,
           last_result, first_answered_at, last_answered_at, last_incorrect_at, last_session_id)
         values ($1, 'bad', $2, $3, $4, now(), now(), ${lastIncorrect}, 's')`,
        [EXAM_ID, attempts, correct, result],
      );
    await expect(insert(1, 2, 'correct', 'null')).rejects.toThrow(/check constraint/);
    await expect(insert(1, 0, 'correct', 'null')).rejects.toThrow(/check constraint/);
    await expect(insert(1, 0, 'incorrect', 'null')).rejects.toThrow(/check constraint/);
    await expect(insert(1, 1, 'unknown', 'null')).rejects.toThrow(/check constraint/);
  });

  it("AC-B.23 the app's sync writes rows the schema accepts, and reads them back unchanged", async () => {
    await asAdmin();
    await db.query(`insert into auth.users (id) values ($1)`, [CAROL]);
    await asUser(CAROL);
    const tables = pgUserTables();
    const remote = createUserDataRemote(tables, CAROL, EXAM_ID);
    const T0 = Date.UTC(2026, 9, 1, 9, 0, 0, 123);

    const laptop = createAppStore({ driver: createMemoryDriver(), persistent: true });
    const sync = createSyncEngine({ store: laptop, remote, driver: createMemoryDriver() });
    laptop.recordAnswer({ questionId: 'q-1', isCorrect: true, at: T0, sessionId: 's-1' });
    laptop.recordAnswer({ questionId: 'q-2', isCorrect: false, at: T0 + 1, sessionId: 's-1' });
    laptop.toggleBookmark('q-1', T0 + 2);
    laptop.addSessionSummary({
      id: 's-1',
      label: 'Domain 1',
      startedAt: T0,
      finishedAt: T0 + 3,
      total: 2,
      answered: 2,
      correct: 1,
      byDomain: { D1: { answered: 2, correct: 1 } },
      incorrectQuestionIds: ['q-2'],
    });
    laptop.setPreferences({ theme: 'light' });
    const first = examQuestion(0);
    const exam = makeExam({
      id: 'exam-1',
      startedAt: T0,
      actions: [
        { type: 'select', questionId: first.id, optionId: first.correctOptionIds[0] ?? '', at: T0 },
        { type: 'logIntegrity', event: { type: 'tab-hidden', at: T0 + 5 } },
      ],
    });
    laptop.startExam(exam);
    laptop.completeExam(makeAttempt(exam), EXAM_QUESTIONS);
    laptop.startExam(makeExam({ id: 'exam-2', startedAt: T0 + 60_000 }));
    expect(await sync.flush()).toBe(true);

    const phone = createAppStore({ driver: createMemoryDriver(), persistent: true });
    const phoneSync = createSyncEngine({ store: phone, remote, driver: createMemoryDriver() });
    expect(await phoneSync.pull()).toBe(true);
    const pick = (store: typeof laptop) => {
      const { progress, bookmarks, sessions, attempts, activeExam, preferenceOverrides } =
        store.getSnapshot().data;
      return { progress, bookmarks, sessions, attempts, activeExam, preferenceOverrides };
    };
    expect(pick(phone)).toEqual(pick(laptop));

    // Sending the same data again updates rows instead of failing on their keys.
    laptop.clearIntegrityLog('exam-1');
    expect(await sync.flush()).toBe(true);
    laptop.resetAll();
    expect(await sync.flush()).toBe(true);
    for (const table of [
      'question_progress',
      'bookmarks',
      'practice_sessions',
      'exam_attempts',
      'exam_attempt_questions',
      'active_exams',
      'user_preferences',
    ]) {
      expect(await count(`public.${table}`)).toBe(0);
    }
    sync.dispose();
    phoneSync.dispose();
    await asAdmin();
    await db.query('delete from auth.users where id = $1', [CAROL]);
  });

  it('AC-R.4 review levels: stored, range-checked, and estimated for rows without one', async () => {
    const DAVE = '00000000-0000-4000-8000-00000000000d';
    await asAdmin();
    await db.query(`insert into auth.users (id) values ($1)`, [DAVE]);
    await asUser(DAVE);
    const insert = (id: string, result: string, correct: number, level: string) =>
      db.query(
        `insert into public.question_progress (exam_id, question_id, attempts, correct,
           last_result, first_answered_at, last_answered_at, last_incorrect_at, last_session_id,
           review_level)
         values ($1, $2, 3, $3, $4, now(), now(), now(), 's', ${level})`,
        [EXAM_ID, id, correct, result],
      );
    await expect(insert('high', 'correct', 2, '5')).rejects.toThrow(/check constraint/);
    await expect(insert('negative', 'correct', 2, '-1')).rejects.toThrow(/check constraint/);
    await insert('stored', 'correct', 2, '3');
    // Written before the column existed, or by an app version from before it.
    await insert('noLevel', 'correct', 2, 'null');
    await insert('staleLevel', 'incorrect', 2, '2');

    const pulled = await createUserDataRemote(pgUserTables(), DAVE, EXAM_ID).pull();
    const levels = Object.fromEntries(
      Object.entries(parseRemote(pulled).progress ?? {}).map(([id, e]) => [id, e.reviewLevel]),
    );
    expect(levels).toEqual({ stored: 3, noLevel: 1, staleLevel: 0 });

    await asAdmin();
    await db.query('delete from auth.users where id = $1', [DAVE]);
  });

  it('AC-A.2 only admins can list users, and nobody can read or change the admin list', async () => {
    const ERIN = '00000000-0000-4000-8000-0000000000e1';
    const FRANK = '00000000-0000-4000-8000-0000000000f1';
    await asAdmin();
    await db.query(
      `insert into auth.users (id, email, raw_user_meta_data, raw_app_meta_data, last_sign_in_at)
       values ($1, 'erin@example.com', '{"full_name": "Erin"}', '{"provider": "google"}', now()),
              ($2, 'frank@example.com', '{}', '{"provider": "email"}', null)`,
      [ERIN, FRANK],
    );
    await db.query('insert into public.admins (user_id) values ($1)', [ERIN]);

    // Frank's activity: two answers, one practice session, a normal and a proctor-ended exam.
    await asUser(FRANK);
    for (const id of ['clf-d1-0001', 'clf-d1-0002']) {
      await db.query(
        `insert into public.question_progress (exam_id, question_id, attempts, correct,
           last_result, first_answered_at, last_answered_at, last_session_id)
         values ($1, $2, 1, 1, 'correct', now(), now(), 's1')`,
        [EXAM_ID, id],
      );
    }
    await db.query(
      `insert into public.practice_sessions (id, exam_id, label, started_at, finished_at, total,
         answered, correct) values ('p1', $1, 'Mixed', now(), now(), 2, 2, 2)`,
      [EXAM_ID],
    );
    for (const [id, reason, percent] of [
      ['x1', 'manual', 72.5],
      ['x2', 'proctor_ended', 95],
    ] as const) {
      await db.query(
        `insert into public.exam_attempts (id, exam_id, kind, bank_version, started_at, ends_at,
           duration_ms, submitted_at, submit_reason, time_used_ms, benchmark_percent,
           benchmark_met, summary)
         values ($1, $2, 'short', 'v1', now() - interval '10 min', now(), 600000, now(), $3,
           600000, 70, true, $4)`,
        [id, EXAM_ID, reason, JSON.stringify({ percent })],
      );
    }

    // Not an admin: refused, and the admin list is out of reach.
    await expect(db.query('select * from public.admin_user_overview()')).rejects.toThrow(
      /Admins only/,
    );
    expect((await db.query<{ ok: boolean }>('select public.is_admin() as ok')).rows[0]?.ok).toBe(
      false,
    );
    await expect(count('public.admins')).rejects.toThrow(/permission denied/);
    await expect(
      db.query('insert into public.admins (user_id) values ($1)', [FRANK]),
    ).rejects.toThrow(/permission denied/);

    await asAnon();
    await expect(db.query('select * from public.admin_user_overview()')).rejects.toThrow(
      /permission denied/,
    );

    // An admin sees every account with its totals.
    await asUser(ERIN);
    expect((await db.query<{ ok: boolean }>('select public.is_admin() as ok')).rows[0]?.ok).toBe(
      true,
    );
    const { rows } = await db.query<Record<string, unknown>>(
      'select * from public.admin_user_overview() where user_id = any($1)',
      [[ERIN, FRANK]],
    );
    const byId: Record<string, Record<string, unknown>> = Object.fromEntries(
      rows.map((row) => [String(row['user_id']), row]),
    );
    expect(byId[ERIN]).toMatchObject({
      email: 'erin@example.com',
      display_name: 'Erin',
      provider: 'google',
      questions_answered: 0,
      exam_attempts: 0,
      best_exam_percent: null,
    });
    expect(byId[FRANK]).toMatchObject({
      email: 'frank@example.com',
      display_name: null,
      provider: 'email',
      questions_answered: 2,
      practice_sessions: 1,
      exam_attempts: 2,
    });
    // The proctor-ended 95% is void, so the best score is 72.5.
    expect(Number(byId[FRANK]?.['best_exam_percent'])).toBe(72.5);
    // Admins still can't read or change the admin list through the API.
    await expect(count('public.admins')).rejects.toThrow(/permission denied/);

    await asAdmin();
    await db.query('delete from auth.users where id = any($1)', [[ERIN, FRANK]]);
    expect(await count('public.admins')).toBe(0);
  });

  it('AC-B.2 deleting an account removes all of its data', async () => {
    await asAdmin();
    await db.query('delete from auth.users where id = $1', [ALICE]);
    for (const table of ['profiles', 'question_progress', 'bookmarks', 'user_preferences']) {
      expect(await count(`public.${table}`)).toBe(table === 'profiles' ? 1 : 0);
    }
  });
});
