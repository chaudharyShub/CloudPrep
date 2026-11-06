import {
  staticQuestionSource,
  supabaseQuestionSource,
  type QuestionSource,
} from './questionSource';
import { getSupabase, readSupabaseConfig } from './supabaseClient';

/** A source that loads one exam's questions bundled in the repo, as a separate chunk. */
function bundledQuestionSource(examId: string): QuestionSource {
  const load = async () => {
    const { BANKS } = await import('@/content/banks');
    const bank = BANKS[examId];
    if (!bank || bank.questions.length === 0) {
      throw new Error('This exam has no published questions yet.');
    }
    return staticQuestionSource(bank.questions, bank.version);
  };
  return {
    fetchVersion: async () => (await load()).fetchVersion(),
    fetchBank: async () => (await load()).fetchBank(),
  };
}

/**
 * Where the app loads an exam's questions from (D-046, D-066):
 * - E2E builds, and development without Supabase settings or with
 *   `VITE_QUESTIONS_SOURCE=local`: the bundled bank (these branches are removed from
 *   production builds, so the bank isn't shipped there);
 * - otherwise Supabase; null if the site has no Supabase settings.
 */
export function createQuestionSource(examId: string): QuestionSource | null {
  const config = readSupabaseConfig(import.meta.env);
  if (import.meta.env.MODE === 'e2e') return bundledQuestionSource(examId);
  if (import.meta.env.DEV && (!config || import.meta.env['VITE_QUESTIONS_SOURCE'] === 'local')) {
    return bundledQuestionSource(examId);
  }
  if (!config) return null;
  return supabaseQuestionSource(() => getSupabase(config), examId);
}
