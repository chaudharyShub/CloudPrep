import { describe, expect, it, vi } from 'vitest';
import {
  ACCOUNT_PREFIX,
  accountOwner,
  accountPreferences,
  closeAccountCopy,
  hasGuestData,
  markAskedToImport,
  openAccountDriver,
  signedInOwner,
  wasAskedToImport,
} from './account';
import { createMemoryDriver, createScopedDriver } from './driver';
import { createAppStore } from './store';

describe('scoped storage', () => {
  it('AC-B.20 keeps guest data and the account copy apart in one localStorage', () => {
    const base = createMemoryDriver();
    const guest = createAppStore({ driver: base, persistent: true });
    const account = createAppStore({ driver: openAccountDriver(base, 'u1'), persistent: true });
    guest.toggleBookmark('guest-q', 1);
    account.toggleBookmark('account-q', 2);

    expect(base.getItem('cloudprep:bookmarks')).toContain('guest-q');
    expect(base.getItem(`${ACCOUNT_PREFIX}cloudprep:bookmarks`)).toContain('account-q');
    // Re-reading each from storage gives each its own data back.
    expect(
      Object.keys(createAppStore({ driver: base, persistent: true }).getSnapshot().data.bookmarks),
    ).toEqual(['guest-q']);
    expect(
      Object.keys(
        createAppStore({ driver: openAccountDriver(base, 'u1'), persistent: true }).getSnapshot()
          .data.bookmarks,
      ),
    ).toEqual(['account-q']);
    // Resetting guest data leaves the account copy alone.
    guest.resetAll();
    expect(base.getItem(`${ACCOUNT_PREFIX}cloudprep:bookmarks`)).toContain('account-q');
  });

  it('maps storage events to the right store', () => {
    const base = createMemoryDriver();
    const scoped = createScopedDriver(base, ACCOUNT_PREFIX);
    expect(scoped.ownKey?.(`${ACCOUNT_PREFIX}cloudprep:progress`)).toBe('cloudprep:progress');
    expect(scoped.ownKey?.('cloudprep:progress')).toBeNull();

    const account = createAppStore({ driver: scoped, persistent: true });
    const listener = vi.fn();
    account.subscribe(listener);
    account.handleExternalChange('cloudprep:bookmarks'); // a guest key: not ours
    expect(listener).not.toHaveBeenCalled();
    createAppStore({ driver: scoped, persistent: true }).toggleBookmark('q', 1);
    account.handleExternalChange(`${ACCOUNT_PREFIX}cloudprep:bookmarks`);
    expect(Object.keys(account.getSnapshot().data.bookmarks)).toEqual(['q']);
  });
});

describe('account copy', () => {
  it("AC-B.20 opening another user's copy removes the previous one", () => {
    const base = createMemoryDriver();
    createAppStore({ driver: openAccountDriver(base, 'u1'), persistent: true }).toggleBookmark(
      'q',
      1,
    );
    expect(accountOwner(base)).toBe('u1');
    const second = createAppStore({ driver: openAccountDriver(base, 'u2'), persistent: true });
    expect(second.getSnapshot().data.bookmarks).toEqual({});
    expect(accountOwner(base)).toBe('u2');
  });

  it('AC-B.20 sign-out removes the copy, or keeps unsent changes without showing them early', () => {
    const base = createMemoryDriver();
    const store = createAppStore({ driver: openAccountDriver(base, 'u1'), persistent: true });
    store.setPreferences({ theme: 'light' });
    expect(signedInOwner(base)).toBe('u1');
    expect(accountPreferences(base)).toEqual({ theme: 'light' });

    closeAccountCopy(base, 'u1', true);
    expect(accountOwner(base)).toBe('u1');
    expect(signedInOwner(base)).toBeNull();
    expect(accountPreferences(base)).toBeNull();
    // Signing in again picks the kept copy back up.
    const again = createAppStore({ driver: openAccountDriver(base, 'u1'), persistent: true });
    expect(again.getSnapshot().data.preferenceOverrides).toEqual({ theme: 'light' });

    closeAccountCopy(base, 'someone-else', false); // not theirs: nothing happens
    expect(accountOwner(base)).toBe('u1');
    closeAccountCopy(base, 'u1', false);
    expect(base.keys().filter((key) => key.startsWith(ACCOUNT_PREFIX))).toEqual([]);
  });

  it('AC-B.21 remembers who was asked about guest data, per user', () => {
    const base = createMemoryDriver();
    expect(wasAskedToImport(base, 'u1')).toBe(false);
    markAskedToImport(base, 'u1');
    markAskedToImport(base, 'u1');
    expect(wasAskedToImport(base, 'u1')).toBe(true);
    expect(wasAskedToImport(base, 'u2')).toBe(false);
  });

  it('AC-B.21 counts only learning data and exams as guest data worth adding', () => {
    const store = createAppStore({ driver: createMemoryDriver(), persistent: true });
    store.setPreferences({ theme: 'light' });
    expect(hasGuestData(store.getSnapshot().data)).toBe(false);
    store.toggleBookmark('q', 1);
    expect(hasGuestData(store.getSnapshot().data)).toBe(true);
  });
});

describe('store change hooks', () => {
  it('reports local changes but not data applied from the server or other tabs', () => {
    const store = createAppStore({ driver: createMemoryDriver(), persistent: true });
    const changes: string[] = [];
    store.onLocalChange((change) => changes.push(change.area));
    store.toggleBookmark('q', 1);
    store.applyRemote({ bookmarks: { other: { addedAt: 2 } } });
    store.handleExternalChange(null);
    store.clearExamHistory();
    expect(changes).toEqual(['bookmarks', 'attempts', 'questionArchive']);
    expect(Object.keys(store.getSnapshot().data.bookmarks)).toEqual(['other']);
  });
});
