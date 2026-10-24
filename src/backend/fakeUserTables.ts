import {
  KEY_COLUMNS,
  type Row,
  type SelectQuery,
  type UserTable,
  type UserTables,
} from './userDataRemote';

/**
 * In-memory `UserTables` for tests and E2E builds. Rows are keyed by primary key like the
 * real tables; `save` (E2E) persists them so a reload sees the same "server".
 */
export interface FakeUserTables extends UserTables {
  rows(table: UserTable): Row[];
  /** Makes every call fail with this message until set back to null (simulates offline). */
  failWith: string | null;
  /** Number of upsert and delete calls so far. */
  readonly writes: number;
}

type Tables = Partial<Record<UserTable, Record<string, Row>>>;

/** Removes the entries for which `drop` is true. */
function removeWhere(rows: Record<string, Row>, drop: (row: Row) => boolean): void {
  for (const [key, row] of Object.entries(rows)) {
    if (drop(row)) Reflect.deleteProperty(rows, key);
  }
}

export function createFakeUserTables(
  initial: Tables = {},
  save?: (tables: Tables) => void,
): FakeUserTables {
  const tables: Tables = structuredClone(initial);
  let writes = 0;
  const keyOf = (table: UserTable, row: Row) =>
    [row['user_id'], ...KEY_COLUMNS[table].map((column) => row[column])].join('|');
  const matches = (row: Row, query: Pick<SelectQuery, 'eq' | 'in'>) =>
    Object.entries(query.eq ?? {}).every(([column, value]) => row[column] === value) &&
    (!query.in || query.in.values.includes(String(row[query.in.column])));

  const fake: FakeUserTables = {
    failWith: null,
    get writes() {
      return writes;
    },
    rows: (table) => Object.values(tables[table] ?? {}).map((row) => structuredClone(row)),
    select(table, query) {
      if (fake.failWith !== null) return Promise.reject(new Error(fake.failWith));
      let rows = fake.rows(table).filter((row) => matches(row, query));
      if (query.order) {
        const { column, ascending } = query.order;
        rows.sort((a, b) => {
          const order = String(a[column]).localeCompare(String(b[column]));
          return ascending ? order : -order;
        });
      }
      if (query.limit !== undefined) rows = rows.slice(0, query.limit);
      return Promise.resolve(rows);
    },
    upsert(table, rows) {
      if (fake.failWith !== null) return Promise.reject(new Error(fake.failWith));
      writes++;
      const target = (tables[table] ??= {});
      for (const row of rows) target[keyOf(table, row)] = structuredClone(row);
      save?.(tables);
      return Promise.resolve();
    },
    delete(table, query) {
      if (fake.failWith !== null) return Promise.reject(new Error(fake.failWith));
      writes++;
      const target = tables[table] ?? {};
      removeWhere(target, (row) => matches(row, query));
      if (table === 'exam_attempts') {
        // Like the foreign key's `on delete cascade`.
        const ids = new Set(Object.values(target).map((row) => row['id']));
        removeWhere(tables.exam_attempt_questions ?? {}, (row) => !ids.has(row['attempt_id']));
      }
      save?.(tables);
      return Promise.resolve();
    },
  };
  return fake;
}
