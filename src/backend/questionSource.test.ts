import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { EXAM_ID } from '@/domain/exam-guide/clf-c02';
import { TEST_BANK } from '@/test/bank';
import { questionToRows } from './contentRows';
import { parseFetchedRow, supabaseQuestionSource } from './questionSource';

const sample = TEST_BANK.practice.questions;

function fetchedRow(index: number, embedAsArray = false) {
  const question = sample[index];
  if (!question) throw new Error('not enough questions');
  const rows = questionToRows(question, EXAM_ID);
  return { ...rows.question, question_keys: embedAsArray ? [rows.key] : rows.key };
}

/** Just enough of the Supabase query builder for the source. */
function fakeSupabase(options: {
  version?: string | null;
  rows?: unknown[];
  failQuestions?: string;
}) {
  const ranges: [number, number][] = [];
  const client = {
    from(table: string) {
      const builder = {
        select: () => builder,
        eq: () => builder,
        order: () => builder,
        maybeSingle: () =>
          Promise.resolve(
            table === 'exams'
              ? {
                  data: options.version === undefined ? null : { bank_version: options.version },
                  error: null,
                }
              : { data: null, error: { message: 'unexpected' } },
          ),
        range: (from: number, to: number) => {
          ranges.push([from, to]);
          if (options.failQuestions) {
            return Promise.resolve({ data: null, error: { message: options.failQuestions } });
          }
          return Promise.resolve({ data: (options.rows ?? []).slice(from, to + 1), error: null });
        },
      };
      return builder;
    },
  };
  return { supabase: client as unknown as SupabaseClient, ranges };
}

describe('question source', () => {
  it('AC-B.12 rebuilds valid questions from fetched rows, however the key is embedded', () => {
    expect(parseFetchedRow(fetchedRow(0))).toEqual(sample[0]);
    expect(parseFetchedRow(fetchedRow(1, true))).toEqual(sample[1]);
  });

  it('AC-B.12 rejects rows without a key, with bad content, or of the wrong shape', () => {
    expect(parseFetchedRow({ ...fetchedRow(0), question_keys: null })).toBe(null);
    expect(parseFetchedRow({ ...fetchedRow(0), stem: '' })).toBe(null);
    expect(parseFetchedRow({ ...fetchedRow(0), options: 'nope' })).toBe(null);
    expect(parseFetchedRow({ ...fetchedRow(0), domain_id: 'D9' })).toBe(null);
    expect(parseFetchedRow(null)).toBe(null);
    expect(parseFetchedRow('row')).toBe(null);
  });

  it('AC-B.12 downloads every page and leaves out invalid rows', async () => {
    const rows: unknown[] = Array.from({ length: 1200 }, (_, i) => fetchedRow(i));
    rows[5] = { ...fetchedRow(5), question_keys: null };
    const { supabase, ranges } = fakeSupabase({ version: 'v7', rows });
    const loaded = await supabaseQuestionSource(
      () => Promise.resolve(supabase),
      EXAM_ID,
    ).fetchBank();
    expect(loaded.version).toBe('v7');
    expect(loaded.questions).toHaveLength(1199);
    expect(loaded.dropped).toBe(1);
    expect(ranges).toEqual([
      [0, 999],
      [1000, 1999],
    ]);
  });

  it('reports an unpublished exam, a failed request and an empty bank', async () => {
    const source = (options: Parameters<typeof fakeSupabase>[0]) =>
      supabaseQuestionSource(() => Promise.resolve(fakeSupabase(options).supabase), EXAM_ID);
    await expect(source({}).fetchVersion()).rejects.toThrow(/no published questions/);
    await expect(source({ version: null }).fetchVersion()).rejects.toThrow(/no published/);
    await expect(source({ version: 'v1', failQuestions: 'timeout' }).fetchBank()).rejects.toThrow(
      'timeout',
    );
    await expect(source({ version: 'v1', rows: [] }).fetchBank()).rejects.toThrow(
      /No questions could be loaded/,
    );
  });
});
