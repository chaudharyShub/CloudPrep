/**
 * Minimal key-value storage interface. The only place in the app that touches
 * `window.localStorage` is `createLocalStorageDriver` below.
 */
export interface StorageDriver {
  readonly kind: 'local' | 'memory';
  getItem(key: string): string | null;
  /** Throws if the value can't be stored (e.g. quota exceeded). */
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  keys(): string[];
  /**
   * Maps a key from a browser `storage` event to this driver's own key, or null if the key
   * isn't one of its own. Drivers without it see every key as their own.
   */
  ownKey?(physicalKey: string): string | null;
}

/**
 * A driver that keeps its keys under `prefix` in `base`, so two stores can share one
 * localStorage (guest data and the signed-in account's copy, D-047).
 */
export function createScopedDriver(base: StorageDriver, prefix: string): StorageDriver {
  return {
    kind: base.kind,
    getItem: (key) => base.getItem(prefix + key),
    setItem: (key, value) => {
      base.setItem(prefix + key, value);
    },
    removeItem: (key) => {
      base.removeItem(prefix + key);
    },
    keys: () =>
      base
        .keys()
        .filter((key) => key.startsWith(prefix))
        .map((key) => key.slice(prefix.length)),
    ownKey: (physicalKey) =>
      physicalKey.startsWith(prefix) ? physicalKey.slice(prefix.length) : null,
  };
}

export function createMemoryDriver(initial: Record<string, string> = {}): StorageDriver {
  const map = new Map(Object.entries(initial));
  return {
    kind: 'memory',
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
    keys: () => [...map.keys()],
  };
}

/**
 * Returns a driver backed by localStorage, or `null` if it is unavailable
 * (disabled, blocked in a private window, or throwing on access).
 */
export function createLocalStorageDriver(): StorageDriver | null {
  let storage: Storage;
  try {
    storage = window.localStorage;
    const probe = '__cloudprep_probe__';
    storage.setItem(probe, probe);
    storage.removeItem(probe);
  } catch {
    return null;
  }
  return {
    kind: 'local',
    getItem: (key) => storage.getItem(key),
    setItem: (key, value) => {
      storage.setItem(key, value);
    },
    removeItem: (key) => {
      storage.removeItem(key);
    },
    keys: () => {
      const result: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key !== null) result.push(key);
      }
      return result;
    },
  };
}

export function isQuotaError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  );
}
