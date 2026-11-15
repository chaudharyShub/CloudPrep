import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryDriver, type StorageDriver } from '@/storage/driver';
import { isOwnerDevice, OWNER_DEVICE_KEY, OWNER_TOKEN_SHA256, sha256Hex } from './ownerDevice';

// A made-up token for tests; the real one is never written down (docs/SHUBHAM_WORKS.md).
const TOKEN = 'test-token';
let hash: string;
let storage: StorageDriver;
let alert: ReturnType<typeof vi.fn<(message?: string) => void>>;

beforeEach(async () => {
  hash = await sha256Hex(TOKEN);
  alert = vi.fn<(message?: string) => void>();
  vi.spyOn(window, 'alert').mockImplementation(alert);
  storage = createMemoryDriver();
  window.history.replaceState(null, '', '/clf-c02/practice?x=1');
});

afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState(null, '', '/');
});

describe('isOwnerDevice', () => {
  it('AC-O.1 holds the shared hash, never a token', () => {
    expect(OWNER_TOKEN_SHA256).toMatch(/^[0-9a-f]{64}$/);
  });

  it('AC-O.1 a browser without the token is counted', async () => {
    expect(await isOwnerDevice(hash, storage)).toBe(false);
    expect(alert).not.toHaveBeenCalled();
  });

  it('AC-O.2 the secret link marks the browser, saves the token and cleans the address', async () => {
    window.location.hash = `#${TOKEN}`;
    expect(await isOwnerDevice(hash, storage)).toBe(true);
    expect(storage.getItem(OWNER_DEVICE_KEY)).toBe(TOKEN);
    expect(window.location.hash).toBe('');
    expect(window.location.pathname + window.location.search).toBe('/clf-c02/practice?x=1');
    expect(alert).toHaveBeenCalledWith("This browser won't be counted in analytics.");
    // Later visits are still the owner's, without the link.
    expect(await isOwnerDevice(hash, storage)).toBe(true);
  });

  it('AC-O.3 the link with .on turns analytics back on', async () => {
    storage.setItem(OWNER_DEVICE_KEY, TOKEN);
    window.location.hash = `#${TOKEN}.on`;
    expect(await isOwnerDevice(hash, storage)).toBe(false);
    expect(storage.getItem(OWNER_DEVICE_KEY)).toBeNull();
    expect(window.location.hash).toBe('');
    expect(alert).toHaveBeenCalledWith('Analytics is back on for this browser.');
  });

  it('AC-O.4 without storage the check fails, so the visit is counted', async () => {
    window.location.hash = `#${TOKEN}`;
    await expect(isOwnerDevice(hash, null)).rejects.toThrow();
    expect(alert).not.toHaveBeenCalled();
  });

  it('AC-O.4 a wrong token or a hand-made stored value does not count', async () => {
    window.location.hash = '#not-the-token';
    storage.setItem(OWNER_DEVICE_KEY, 'true');
    expect(await isOwnerDevice(hash, storage)).toBe(false);
    expect(window.location.hash).toBe('#not-the-token');
    expect(alert).not.toHaveBeenCalled();
  });
});
