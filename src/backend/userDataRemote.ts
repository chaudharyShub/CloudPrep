import type { SupabaseClient } from '@supabase/supabase-js';
import { MAX_SESSION_SUMMARIES } from '@/storage/areas';
import { MAX_EXAM_ATTEMPTS } from '@/storage/attemptsArea';
import type { RemoteUserData, SyncChanges, UserDataRemote } from '@/storage/sync';
import {
  activeExamToRow,
  attemptToRows,
  bookmarkToRow,
  preferencesToRow,
  progressToRow,
  rowsToAttempt,
  rowsToBookmarks,
  rowsToProgress,
  rowToSession,
  sessionToRow,
  type AttemptQuestionRow,
  type AttemptRow,
  type PracticeSessionRow,
} from './userRows';

export type UserTable =
  | 'question_progress'
  | 'bookmarks'
  | 'practice_sessions'
  | 'exam_attempts'
  | 'exam_attempt_questions'
  | 'active_exams'
  | 'user_preferences';

export type Row = Record<string, unknown>;

export interface SelectQuery {
  readonly eq?: Readonly<Record<string, string>>;
  readonly in?: { readonly column: string; readonly values: readonly string[] };
  readonly order?: { readonly column: string; readonly ascending: boolean };
  readonly limit?: number;
}

/**
 * The few table operations sync needs, always limited to the signed-in user's rows (RLS
 * does that on the server). Implementations: Supabase below, and an in-memory fake.
 */
export interface UserTables {
  select(table: UserTable, query: SelectQuery): Promise<Row[]>;
  upsert(table: UserTable, rows: readonly Row[], onConflict: string): Promise<void>;
  delete(table: UserTable, query: Pick<SelectQuery, 'eq' | 'in'>): Promise<void>;
}

/** Ids per `in (...)` filter, so request URLs stay short. */
const IN_CHUNK = 100;
const UPSERT_CHUNK = 500;

function chunks<T>(items: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
}

/** Sync's server side for one user and exam, on top of `UserTables` (D-047). */
export function createUserDataRemote(
  tables: UserTables,
  userId: string,
  examId: string,
): UserDataRemote {
  const byExam = { exam_id: examId };

  async function upsert(table: UserTable, rows: readonly Row[], onConflict: string) {
    for (const part of chunks(rows, UPSERT_CHUNK)) await tables.upsert(table, part, onConflict);
  }
  async function deleteKeys(table: UserTable, column: string, keys: readonly string[]) {
    for (const part of chunks(keys, IN_CHUNK)) {
      await tables.delete(table, { eq: byExam, in: { column, values: part } });
    }
  }

  return {
    async pull(): Promise<RemoteUserData> {
      const [progress, bookmarks, sessions, attempts, active, preferences] = await Promise.all([
        tables.select('question_progress', { eq: byExam }),
        tables.select('bookmarks', { eq: byExam }),
        tables.select('practice_sessions', {
          eq: byExam,
          order: { column: 'finished_at', ascending: false },
          limit: MAX_SESSION_SUMMARIES,
        }),
        tables.select('exam_attempts', {
          eq: byExam,
          order: { column: 'submitted_at', ascending: false },
          limit: MAX_EXAM_ATTEMPTS,
        }),
        tables.select('active_exams', { eq: byExam }),
        tables.select('user_preferences', {}),
      ]);
      const attemptIds = attempts.map((row) => String(row['id']));
      const questionRows: Row[] = [];
      for (const part of chunks(attemptIds, IN_CHUNK)) {
        questionRows.push(
          ...(await tables.select('exam_attempt_questions', {
            in: { column: 'attempt_id', values: part },
          })),
        );
      }
      const questionsByAttempt = new Map<string, Row[]>();
      for (const row of questionRows) {
        const id = String(row['attempt_id']);
        questionsByAttempt.set(id, [...(questionsByAttempt.get(id) ?? []), row]);
      }
      return {
        progress: rowsToProgress(progress),
        bookmarks: rowsToBookmarks(bookmarks),
        sessions: sessions.map((row) => rowToSession(row as Partial<PracticeSessionRow>)),
        attempts: attempts.map((row) =>
          rowsToAttempt(
            row as Partial<AttemptRow>,
            (questionsByAttempt.get(String(row['id'])) ?? []) as Partial<AttemptQuestionRow>[],
          ),
        ),
        activeExam: active[0]?.['session'] ?? null,
        preferences: preferences[0]?.['preferences'] ?? {},
      };
    },

    async push(changes: SyncChanges): Promise<void> {
      const { preferenceOverrides, progress, bookmarks, sessions, attempts, activeExam } = changes;

      if (preferenceOverrides) {
        if (preferenceOverrides.clear) await tables.delete('user_preferences', {});
        const latest = preferenceOverrides.upsert.at(-1);
        if (latest) {
          await upsert('user_preferences', [preferencesToRow(userId, latest)], 'user_id');
        }
      }

      if (progress) {
        if (progress.clear) await tables.delete('question_progress', { eq: byExam });
        await deleteKeys('question_progress', 'question_id', progress.delete);
        await upsert(
          'question_progress',
          progress.upsert.map((item) => progressToRow(userId, examId, item.questionId, item.entry)),
          'user_id,question_id',
        );
      }

      if (bookmarks) {
        if (bookmarks.clear) await tables.delete('bookmarks', { eq: byExam });
        await deleteKeys('bookmarks', 'question_id', bookmarks.delete);
        await upsert(
          'bookmarks',
          bookmarks.upsert.map((item) =>
            bookmarkToRow(userId, examId, item.questionId, item.addedAt),
          ),
          'user_id,question_id',
        );
      }

      if (sessions) {
        if (sessions.clear) await tables.delete('practice_sessions', { eq: byExam });
        await deleteKeys('practice_sessions', 'id', sessions.delete);
        await upsert(
          'practice_sessions',
          sessions.upsert.map((session) => sessionToRow(userId, examId, session)),
          'user_id,id',
        );
      }

      if (attempts) {
        // Deleting an attempt deletes its questions too (foreign key cascade).
        if (attempts.clear) await tables.delete('exam_attempts', { eq: byExam });
        await deleteKeys('exam_attempts', 'id', attempts.delete);
        const rows = attempts.upsert.map((attempt) => attemptToRows(userId, examId, attempt));
        await upsert(
          'exam_attempts',
          rows.map((row) => row.attempt),
          'user_id,id',
        );
        await upsert(
          'exam_attempt_questions',
          rows.flatMap((row) => row.questions),
          'user_id,attempt_id,position',
        );
      }

      if (activeExam) {
        if (activeExam.clear || activeExam.delete.length > 0) {
          await tables.delete('active_exams', { eq: byExam });
        }
        const session = activeExam.upsert.at(-1);
        if (session) {
          await upsert(
            'active_exams',
            [activeExamToRow(userId, examId, session)],
            'user_id,exam_id',
          );
        }
      }
    },
  };
}

/** Rows per request when reading; Supabase returns at most 1,000 by default. */
const PAGE_SIZE = 1000;

/** Primary key columns after `user_id`, for a stable order across pages. */
export const KEY_COLUMNS: Readonly<Record<UserTable, readonly string[]>> = {
  question_progress: ['question_id'],
  bookmarks: ['question_id'],
  practice_sessions: ['id'],
  exam_attempts: ['id'],
  exam_attempt_questions: ['attempt_id', 'position'],
  active_exams: ['exam_id'],
  user_preferences: ['user_id'],
};

/** `UserTables` on Supabase, as the signed-in user (RLS limits every query to their rows). */
export function supabaseUserTables(getClient: () => Promise<SupabaseClient>): UserTables {
  return {
    async select(table, query) {
      const supabase = await getClient();
      const rows: Row[] = [];
      const limit = query.limit ?? Infinity;
      for (let from = 0; from < limit; from += PAGE_SIZE) {
        const to = Math.min(from + PAGE_SIZE, limit) - 1;
        let request = supabase.from(table).select('*');
        for (const [column, value] of Object.entries(query.eq ?? {})) {
          request = request.eq(column, value);
        }
        if (query.in) request = request.in(query.in.column, [...query.in.values]);
        if (query.order) {
          request = request.order(query.order.column, { ascending: query.order.ascending });
        }
        for (const column of KEY_COLUMNS[table]) request = request.order(column);
        const { data, error } = await request.range(from, to);
        if (error) throw new Error(error.message);
        const page = data as Row[];
        rows.push(...page);
        if (page.length < to - from + 1) break;
      }
      return rows;
    },
    async upsert(table, rows, onConflict) {
      if (rows.length === 0) return;
      const supabase = await getClient();
      const { error } = await supabase.from(table).upsert([...rows], { onConflict });
      if (error) throw new Error(error.message);
    },
    async delete(table, query) {
      const supabase = await getClient();
      // Supabase refuses a delete without a filter; RLS already limits it to this user.
      let request = supabase.from(table).delete().not('user_id', 'is', null);
      for (const [column, value] of Object.entries(query.eq ?? {})) {
        request = request.eq(column, value);
      }
      if (query.in) request = request.in(query.in.column, [...query.in.values]);
      const { error } = await request;
      if (error) throw new Error(error.message);
    },
  };
}
