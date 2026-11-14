import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  installReloadAfterUpdate,
  isStaleAssetError,
  pageReloader,
  RELOAD_GUARD_KEY,
  RELOAD_GUARD_MS,
  reloadOnce,
  resetReloadForUpdate,
} from './reloadAfterUpdate';

const originalReload = pageReloader.reload;
let reload: ReturnType<typeof vi.fn<() => void>>;

function memoryStorage() {
  const items = new Map<string, string>();
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => {
      items.set(key, value);
    },
  };
}

beforeEach(() => {
  reload = vi.fn<() => void>();
  pageReloader.reload = reload;
  resetReloadForUpdate();
  window.sessionStorage.clear();
});

afterEach(() => {
  pageReloader.reload = originalReload;
  resetReloadForUpdate();
});

describe('isStaleAssetError', () => {
  it('AC-U.1 recognises a page file that failed to load, in every browser', () => {
    const url = 'https://example.com/assets/SignInPage-BdN5STt1.js';
    expect(
      isStaleAssetError(new TypeError(`Failed to fetch dynamically imported module: ${url}`)),
    ).toBe(true);
    expect(
      isStaleAssetError(new TypeError(`error loading dynamically imported module: ${url}`)),
    ).toBe(true);
    expect(isStaleAssetError(new TypeError('Importing a module script failed.'))).toBe(true);
    expect(isStaleAssetError(new Error(`Unable to preload CSS for ${url}`))).toBe(true);
  });

  it('AC-U.1 ignores other errors', () => {
    expect(isStaleAssetError(new Error('Cannot read properties of undefined'))).toBe(false);
    expect(isStaleAssetError('Failed to fetch dynamically imported module')).toBe(false);
    expect(isStaleAssetError(null)).toBe(false);
  });
});

describe('reloadOnce', () => {
  it('AC-U.2 reloads once, then not again within the guard time', () => {
    const storage = memoryStorage();
    expect(reloadOnce(storage, 1_000)).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(storage.getItem(RELOAD_GUARD_KEY)).toBe('1000');

    // The new page loads, and its page file fails too: show the error instead of a loop.
    resetReloadForUpdate();
    expect(reloadOnce(storage, 1_000 + RELOAD_GUARD_MS - 1)).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('AC-U.2 reloads again for a later update', () => {
    const storage = memoryStorage();
    reloadOnce(storage, 1_000);
    resetReloadForUpdate();
    expect(reloadOnce(storage, 1_000 + RELOAD_GUARD_MS)).toBe(true);
    expect(reload).toHaveBeenCalledTimes(2);
  });

  it('AC-U.2 reports a reload already under way without starting another', () => {
    const storage = memoryStorage();
    reloadOnce(storage, 1_000);
    expect(reloadOnce(storage, 1_001)).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('AC-U.2 never reloads when it cannot keep the guard', () => {
    expect(reloadOnce(null, 1_000)).toBe(false);
    const broken = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    expect(reloadOnce(broken, 1_000)).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });

  it('AC-U.2 treats an unreadable or future guard value as no recent reload', () => {
    const storage = memoryStorage();
    storage.setItem(RELOAD_GUARD_KEY, 'not a time');
    expect(reloadOnce(storage, 1_000)).toBe(true);
    resetReloadForUpdate();
    storage.setItem(RELOAD_GUARD_KEY, String(10 * RELOAD_GUARD_MS));
    expect(reloadOnce(storage, 2_000)).toBe(true);
  });
});

describe('installReloadAfterUpdate', () => {
  it("AC-U.3 reloads when Vite reports a failed file, without cancelling Vite's error", () => {
    const target = new EventTarget() as Window;
    installReloadAfterUpdate(target);
    const event = new Event('vite:preloadError', { cancelable: true });
    target.dispatchEvent(event);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(false);
    expect(window.sessionStorage.getItem(RELOAD_GUARD_KEY)).not.toBeNull();
  });

  it('AC-U.3 ignores files cancelled because the page is navigating away', () => {
    const target = new EventTarget() as Window;
    installReloadAfterUpdate(target);
    target.dispatchEvent(new Event('beforeunload'));
    target.dispatchEvent(new Event('vite:preloadError', { cancelable: true }));
    expect(reload).not.toHaveBeenCalled();

    // Restored from the back/forward cache: a later failure counts again.
    target.dispatchEvent(new Event('pageshow'));
    target.dispatchEvent(new Event('vite:preloadError', { cancelable: true }));
    expect(reload).toHaveBeenCalledTimes(1);

    resetReloadForUpdate();
    window.sessionStorage.clear();
    target.dispatchEvent(new Event('pagehide'));
    target.dispatchEvent(new Event('vite:preloadError', { cancelable: true }));
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
