import { EXAM_ID } from '@/domain/exam-guide/clf-c02';
import {
  staticQuestionSource,
  supabaseQuestionSource,
  type QuestionSource,
} from './questionSource';
import { getSupabase, readSupabaseConfig } from './supabaseClient';

/** A source that loads the questions bundled in the repo, as a separate chunk. */
function bundledQuestionSource(): QuestionSource {
  const load = async () => {
    const { BANK_VERSION, QUESTION_BANK } = await import('@/content/questions');
    return staticQuestionSource(QUESTION_BANK, BANK_VERSION);
  };
  return {
    fetchVersion: async () => (await load()).fetchVersion(),
    fetchBank: async () => (await load()).fetchBank(),
  };
}

/**
 * Where the app loads questions from (D-046):
 * - E2E builds, and development without Supabase settings or with
 *   `VITE_QUESTIONS_SOURCE=local`: the bundled bank (these branches are removed from
 *   production builds, so the bank isn't shipped there);
 * - otherwise Supabase; null if the site has no Supabase settings.
 */
export function createQuestionSource(): QuestionSource | null {
  const config = readSupabaseConfig(import.meta.env);
  if (import.meta.env.MODE === 'e2e') return bundledQuestionSource();
  if (import.meta.env.DEV && (!config || import.meta.env['VITE_QUESTIONS_SOURCE'] === 'local')) {
    return bundledQuestionSource();
  }
  if (!config) return null;
  return supabaseQuestionSource(() => getSupabase(config), EXAM_ID);
}
