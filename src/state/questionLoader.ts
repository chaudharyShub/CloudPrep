import type { QuestionSource } from '@/backend/questionSource';
import type { Question } from '@/domain/questions/types';
import type { QuestionCache } from '@/storage/questionCache';

export interface BankSnapshot {
  readonly version: string;
  readonly questions: readonly Question[];
}

export interface QuestionLoader {
  /** The cached bank (any version), for an instant start. */
  cached(): Promise<BankSnapshot | null>;
  /**
   * The current bank: the cached one if its version is still the published one, otherwise
   * a fresh download (which is then cached).
   */
  latest(cached: BankSnapshot | null): Promise<BankSnapshot>;
}

export function createQuestionLoader(
  source: QuestionSource,
  cache: QuestionCache,
  examId: string,
  now: () => number = Date.now,
): QuestionLoader {
  return {
    async cached() {
      const entry = await cache.read(examId);
      return entry ? { version: entry.bankVersion, questions: entry.questions } : null;
    },
    async latest(cached) {
      if (cached && (await source.fetchVersion()) === cached.version) return cached;
      const loaded = await source.fetchBank();
      await cache.write(examId, {
        bankVersion: loaded.version,
        savedAt: now(),
        questions: loaded.questions,
      });
      return { version: loaded.version, questions: loaded.questions };
    },
  };
}
