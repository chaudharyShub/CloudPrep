import { describe, expect, it, vi } from 'vitest';
import { staticQuestionSource } from '@/backend/questionSource';
import { createMemoryQuestionCache } from '@/storage/questionCache';
import { TEST_BANK } from '@/test/bank';
import { createQuestionLoader } from './questionLoader';

const questions = TEST_BANK.practice.questions.slice(0, 4);

function sourceAt(version: string) {
  const source = staticQuestionSource(questions, version);
  return {
    fetchVersion: vi.fn(() => source.fetchVersion()),
    fetchBank: vi.fn(() => source.fetchBank()),
  };
}

describe('question loader', () => {
  it('AC-B.13 downloads and caches the bank on the first visit', async () => {
    const cache = createMemoryQuestionCache();
    const source = sourceAt('v1');
    const loader = createQuestionLoader(source, cache, 'clf-c02', () => 42);
    expect(await loader.cached()).toBe(null);
    expect(await loader.latest(null)).toEqual({ version: 'v1', questions });
    expect(await cache.read('clf-c02')).toEqual({ bankVersion: 'v1', savedAt: 42, questions });
  });

  it('AC-B.13 only checks the version while the cached bank is current', async () => {
    const cache = createMemoryQuestionCache();
    await cache.write('clf-c02', { bankVersion: 'v1', savedAt: 1, questions });
    const source = sourceAt('v1');
    const loader = createQuestionLoader(source, cache, 'clf-c02');
    const cached = await loader.cached();
    expect(cached?.version).toBe('v1');
    expect(await loader.latest(cached)).toBe(cached);
    expect(source.fetchVersion).toHaveBeenCalledTimes(1);
    expect(source.fetchBank).not.toHaveBeenCalled();
  });

  it('AC-B.13 downloads again when a newer bank is published', async () => {
    const cache = createMemoryQuestionCache();
    await cache.write('clf-c02', { bankVersion: 'v1', savedAt: 1, questions });
    const loader = createQuestionLoader(sourceAt('v2'), cache, 'clf-c02');
    expect((await loader.latest(await loader.cached())).version).toBe('v2');
    expect((await cache.read('clf-c02'))?.bankVersion).toBe('v2');
  });
});
