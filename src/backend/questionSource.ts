import type { SupabaseClient } from '@supabase/supabase-js';
import type { Question } from '@/domain/questions/types';
import { validateQuestion } from '@/domain/questions/validate';
import { rowsToQuestion, type QuestionKeyRow, type QuestionRow } from './contentRows';

/** Where the app gets its questions (D-046). */
export interface QuestionSource {
  /** The published bank version (cheap; used to decide whether a cached bank is current). */
  fetchVersion(): Promise<string>;
  /** Every visible question of the exam, validated. */
  fetchBank(): Promise<LoadedQuestions>;
}

export interface LoadedQuestions {
  readonly version: string;
  readonly questions: readonly Question[];
  /** Rows that failed validation and were left out. */
  readonly dropped: number;
}

/** A fixed set of questions (tests, and the bundled bank in E2E and local development). */
export function staticQuestionSource(
  questions: readonly Question[],
  version: string,
): QuestionSource {
  return {
    fetchVersion: () => Promise.resolve(version),
    fetchBank: () => Promise.resolve({ version, questions, dropped: 0 }),
  };
}

const PAGE_SIZE = 1000;

const QUESTION_COLUMNS =
  'id, exam_id, revision, type, domain_id, topic_id, difficulty, status, stem, options, ' +
  'required_selections, tags, last_verified, ' +
  'question_keys (question_id, revision, correct_option_ids, explanation, option_explanations, references, review_notes)';

type FetchedRow = QuestionRow & { question_keys: QuestionKeyRow | QuestionKeyRow[] | null };

/** Turns one fetched row into a valid question, or null. Database values aren't trusted. */
export function parseFetchedRow(row: unknown): Question | null {
  try {
    const { question_keys: embedded, ...question } = row as FetchedRow;
    const key = Array.isArray(embedded) ? embedded[0] : embedded;
    if (!key) return null;
    const rebuilt = rowsToQuestion(question, key);
    return rebuilt && validateQuestion(rebuilt).length === 0 ? rebuilt : null;
  } catch {
    return null;
  }
}

export function supabaseQuestionSource(
  getClient: () => Promise<SupabaseClient>,
  examId: string,
): QuestionSource {
  const fetchVersion = async () => {
    const supabase = await getClient();
    const { data, error } = await supabase
      .from('exams')
      .select('bank_version')
      .eq('id', examId)
      .maybeSingle<{ bank_version: string | null }>();
    if (error) throw new Error(error.message);
    if (!data?.bank_version) throw new Error('This exam has no published questions yet.');
    return data.bank_version;
  };

  return {
    fetchVersion,
    async fetchBank() {
      const version = await fetchVersion();
      const supabase = await getClient();
      const questions: Question[] = [];
      let dropped = 0;
      for (let from = 0; ; from += PAGE_SIZE) {
        const { data, error } = await supabase
          .from('questions')
          .select(QUESTION_COLUMNS)
          .eq('exam_id', examId)
          .order('id')
          .range(from, from + PAGE_SIZE - 1);
        if (error) throw new Error(error.message);
        const rows: unknown[] = data;
        for (const row of rows) {
          const question = parseFetchedRow(row);
          if (question) questions.push(question);
          else dropped++;
        }
        if (rows.length < PAGE_SIZE) break;
      }
      if (questions.length === 0) throw new Error('No questions could be loaded.');
      return { version, questions, dropped };
    },
  };
}
