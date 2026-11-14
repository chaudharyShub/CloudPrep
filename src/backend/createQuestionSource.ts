import {
  staticQuestionSource,
  supabaseQuestionSource,
  type QuestionSource,
} from './questionSource';
import type { Question } from '@/domain/questions/types';
import { getSupabase, readSupabaseConfig } from './supabaseClient';

interface BundledBank {
  readonly version: string;
  readonly questions: readonly Question[];
}

// The real questions live in a private repo checked out at src/content/ (D-072). The glob is
// empty when that checkout is missing, so the public repo still builds.
const privateBanks = import.meta.glob<Readonly<Record<string, BundledBank>>>(
  '/src/content/banks.ts',
  { import: 'BANKS' },
);

/**
 * Loads one exam's bundled questions, as a separate chunk: the public sample bank in E2E
 * builds (stable tests), else the private bank when it is checked out, else the sample bank.
 */
async function loadBundledBanks(): Promise<Readonly<Record<string, BundledBank>>> {
  const loadPrivate = privateBanks['/src/content/banks.ts'];
  if (import.meta.env.MODE !== 'e2e' && loadPrivate) return loadPrivate();
  return (await import('@/sample-content')).SAMPLE_BANKS;
}

function bundledQuestionSource(examId: string): QuestionSource {
  const load = async () => {
    const bank = (await loadBundledBanks())[examId];
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
