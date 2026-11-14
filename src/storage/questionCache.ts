import type { Question } from '@/domain/questions/types';
import { validateQuestion } from '@/domain/questions/validate';
import { isNonEmptyString, isRecord, isTimestamp } from './guards';

/**
 * Downloaded question banks, cached in IndexedDB per exam (D-046). It's a copy of server
 * data, so anything unreadable is discarded and downloaded again rather than backed up.
 * IndexedDB is used because a bank (about 1.6 MB) would crowd out user data in localStorage.
 */

export const QUESTION_CACHE_SCHEMA_VERSION = 1;

export interface CachedBank {
  readonly bankVersion: string;
  readonly savedAt: number;
  readonly questions: readonly Question[];
}

export interface QuestionCache {
  read(examId: string): Promise<CachedBank | null>;
  write(examId: string, bank: CachedBank): Promise<void>;
}

/** Envelope check plus full validation of every question; any problem rejects the entry. */
export function parseCachedBank(value: unknown): CachedBank | null {
  if (!isRecord(value) || value['schemaVersion'] !== QUESTION_CACHE_SCHEMA_VERSION) return null;
  const { bankVersion, savedAt, questions } = value;
  if (!isNonEmptyString(bankVersion) || !isTimestamp(savedAt) || !Array.isArray(questions)) {
    return null;
  }
  const items: unknown[] = questions;
  if (items.length === 0 || items.some((q) => validateQuestion(q).length > 0)) return null;
  return { bankVersion, savedAt, questions: items as Question[] };
}

export function createMemoryQuestionCache(): QuestionCache {
  const entries = new Map<string, unknown>();
  return {
    read: (examId) => Promise.resolve(parseCachedBank(entries.get(examId))),
    write: (examId, bank) => {
      entries.set(examId, { schemaVersion: QUESTION_CACHE_SCHEMA_VERSION, ...bank });
      return Promise.resolve();
    },
  };
}

const DB_NAME = 'cloudprep';
const STORE = 'questionBanks';

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => {
      resolve(req.result);
    };
    req.onerror = () => {
      reject(req.error ?? new Error('IndexedDB request failed'));
    };
  });
}

function openDb(factory: IDBFactory): Promise<IDBDatabase> {
  const req = factory.open(DB_NAME, 1);
  req.onupgradeneeded = () => {
    if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
  };
  return request(req);
}

/**
 * IndexedDB cache, or null where IndexedDB is unavailable. Failures (private mode, quota)
 * are ignored: the cache is only a speed-up.
 */
export function createIndexedDbQuestionCache(
  factory: IDBFactory | undefined = 'indexedDB' in globalThis ? globalThis.indexedDB : undefined,
): QuestionCache | null {
  if (factory === undefined) return null;
  let db: Promise<IDBDatabase> | null = null;
  const getDb = () => (db ??= openDb(factory));
  return {
    async read(examId) {
      try {
        const store = (await getDb()).transaction(STORE, 'readonly').objectStore(STORE);
        return parseCachedBank(await request(store.get(examId)));
      } catch {
        return null;
      }
    },
    async write(examId, bank) {
      try {
        const store = (await getDb()).transaction(STORE, 'readwrite').objectStore(STORE);
        await request(store.put({ schemaVersion: QUESTION_CACHE_SCHEMA_VERSION, ...bank }, examId));
      } catch {
        // Not cached; the bank is downloaded again next time.
      }
    },
  };
}
