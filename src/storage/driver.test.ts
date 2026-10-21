import { afterEach, describe, expect, it, vi } from 'vitest';
import { createLocalStorageDriver, createMemoryDriver, isQuotaError } from './driver';

describe('createLocalStorageDriver', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('reads, writes, lists and removes keys, and leaves no probe key behind', () => {
    const driver = createLocalStorageDriver();
    expect(driver?.kind).toBe('local');
    driver?.setItem('cloudprep:a', '1');
    driver?.setItem('cloudprep:b', '2');
    expect(driver?.getItem('cloudprep:a')).toBe('1');
    expect(driver?.keys().sort()).toEqual(['cloudprep:a', 'cloudprep:b']);
    driver?.removeItem('cloudprep:a');
    expect(driver?.getItem('cloudprep:a')).toBeNull();
  });

  it('returns null when storage throws on access (e.g. blocked in a private window)', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    expect(createLocalStorageDriver()).toBeNull();
  });

  it('returns null when storage refuses writes', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    expect(createLocalStorageDriver()).toBeNull();
  });
});

describe('createMemoryDriver', () => {
  it('starts from initial values and behaves like storage', () => {
    const driver = createMemoryDriver({ x: '1' });
    expect(driver.kind).toBe('memory');
    expect(driver.getItem('x')).toBe('1');
    driver.removeItem('x');
    expect(driver.keys()).toEqual([]);
  });
});

describe('isQuotaError', () => {
  it('recognises quota errors only', () => {
    expect(isQuotaError(new DOMException('full', 'QuotaExceededError'))).toBe(true);
    expect(isQuotaError(new DOMException('x', 'SecurityError'))).toBe(false);
    expect(isQuotaError(new Error('QuotaExceededError'))).toBe(false);
  });
});
