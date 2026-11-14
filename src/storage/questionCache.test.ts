import { describe, expect, it } from 'vitest';
import { TEST_BANK } from '@/test/bank';
import {
  createIndexedDbQuestionCache,
  createMemoryQuestionCache,
  parseCachedBank,
  QUESTION_CACHE_SCHEMA_VERSION,
} from './questionCache';

const questions = TEST_BANK.practice.questions.slice(0, 3);
const entry = {
  schemaVersion: QUESTION_CACHE_SCHEMA_VERSION,
  bankVersion: 'v1',
  savedAt: 1,
  questions,
};

describe('question cache', () => {
  it('AC-B.13 reads back a valid entry', () => {
    expect(parseCachedBank(entry)).toEqual({ bankVersion: 'v1', savedAt: 1, questions });
  });

  it('AC-B.13 discards unreadable entries so the bank is downloaded again', () => {
    expect(parseCachedBank(null)).toBe(null);
    expect(parseCachedBank({ ...entry, schemaVersion: 2 })).toBe(null);
    expect(parseCachedBank({ ...entry, bankVersion: '' })).toBe(null);
    expect(parseCachedBank({ ...entry, savedAt: -1 })).toBe(null);
    expect(parseCachedBank({ ...entry, questions: [] })).toBe(null);
    expect(parseCachedBank({ ...entry, questions: [...questions, { id: 'broken' }] })).toBe(null);
  });

  it('AC-B.13 keeps one bank per exam', async () => {
    const cache = createMemoryQuestionCache();
    expect(await cache.read('clf-c02')).toBe(null);
    await cache.write('clf-c02', { bankVersion: 'v1', savedAt: 5, questions });
    await cache.write('other', { bankVersion: 'v9', savedAt: 6, questions });
    expect((await cache.read('clf-c02'))?.bankVersion).toBe('v1');
    await cache.write('clf-c02', { bankVersion: 'v2', savedAt: 7, questions });
    expect((await cache.read('clf-c02'))?.bankVersion).toBe('v2');
  });

  it('is skipped where IndexedDB is missing, and treats IndexedDB errors as a cache miss', async () => {
    expect(createIndexedDbQuestionCache(undefined)).toBe(null);
    const broken = {
      open: () => {
        throw new Error('blocked');
      },
    } as unknown as IDBFactory;
    const cache = createIndexedDbQuestionCache(broken);
    expect(cache).not.toBe(null);
    expect(await cache?.read('clf-c02')).toBe(null);
    await expect(
      cache?.write('clf-c02', { bankVersion: 'v1', savedAt: 1, questions }),
    ).resolves.toBeUndefined();
  });
});
