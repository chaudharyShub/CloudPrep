import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createFakeAuthClient, FAKE_USER } from '@/backend/fakeAuth';
import { createFakeUserTables, type FakeUserTables } from '@/backend/fakeUserTables';
import { createUserDataRemote } from '@/backend/userDataRemote';
import { EXAM_ID } from '@/domain/exam-guide/clf-c02';
import { ACCOUNT_PREFIX, accountOwner, openAccountDriver } from '@/storage/account';
import { createMemoryDriver, type StorageDriver } from '@/storage/driver';
import { createAppStore } from '@/storage/store';
import { examQuestion } from '@/test/exam';
import { renderApp } from '@/test/renderApp';
import { createAccountManager } from './accounts';

const GUEST_QUESTION = examQuestion(0);
const ACCOUNT_QUESTION = examQuestion(1);
const T0 = Date.UTC(2026, 9, 1);

/** A browser with guest data and real accounts syncing with `tables`. */
function browser(tables: FakeUserTables, base: StorageDriver = createMemoryDriver()) {
  const guest = createAppStore({ driver: base, persistent: true });
  const accounts = createAccountManager({
    base,
    persistent: true,
    createRemote: (userId) => createUserDataRemote(tables, userId, EXAM_ID),
  });
  return { base, guest, accounts };
}

/** Saves a bookmark for FAKE_USER on the "server". */
async function serverBookmark(tables: FakeUserTables, questionId: string) {
  await tables.upsert(
    'bookmarks',
    [
      {
        user_id: FAKE_USER.id,
        exam_id: EXAM_ID,
        question_id: questionId,
        added_at: new Date(T0).toISOString(),
      },
    ],
    'user_id,question_id',
  );
}

const accountKeys = (base: StorageDriver) =>
  base.keys().filter((key) => key.startsWith(ACCOUNT_PREFIX));

describe('guest data and the account copy', () => {
  it('AC-B.20 signed in, pages show the account data; signing out shows guest data and removes the copy', async () => {
    const tables = createFakeUserTables();
    await serverBookmark(tables, ACCOUNT_QUESTION.id);
    const { base, guest, accounts } = browser(tables);
    guest.toggleBookmark(GUEST_QUESTION.id, T0);
    accounts.markAskedToImport(FAKE_USER.id);

    const { user } = renderApp('/bookmarks', { store: guest, accounts });
    expect(await screen.findByText(ACCOUNT_QUESTION.stem)).toBeVisible();
    expect(screen.queryByText(GUEST_QUESTION.stem)).toBeNull();
    expect(accountOwner(base)).toBe(FAKE_USER.id);

    await user.click(screen.getAllByRole('button', { name: 'Sign out' })[0] as HTMLElement);
    await user.click(
      within(await screen.findByRole('dialog', { name: 'Sign out of CloudPrep?' })).getByRole(
        'button',
        { name: 'Sign out' },
      ),
    );
    expect(await screen.findByText(GUEST_QUESTION.stem)).toBeVisible();
    expect(screen.queryByText(ACCOUNT_QUESTION.stem)).toBeNull();
    await waitFor(() => {
      expect(accountKeys(base)).toEqual([]);
    });
    // Guest data is untouched.
    expect(Object.keys(guest.getSnapshot().data.bookmarks)).toEqual([GUEST_QUESTION.id]);
  });

  it("AC-B.20 never shows another user's copy", async () => {
    const tables = createFakeUserTables();
    const base = createMemoryDriver();
    const other = createAppStore({
      driver: openAccountDriver(base, 'someone-else'),
      persistent: true,
    });
    other.toggleBookmark(GUEST_QUESTION.id, T0);
    const { guest, accounts } = browser(tables, base);
    accounts.markAskedToImport(FAKE_USER.id);

    renderApp('/bookmarks', { store: guest, accounts });
    expect(await screen.findByText('No bookmarks yet')).toBeVisible();
    expect(screen.queryByText(GUEST_QUESTION.stem)).toBeNull();
    expect(accountOwner(base)).toBe(FAKE_USER.id);
  });

  it('AC-B.24 signing out sends unsaved changes first', async () => {
    const tables = createFakeUserTables();
    const { guest, accounts } = browser(tables);
    accounts.markAskedToImport(FAKE_USER.id);
    const { user } = renderApp('/settings', { store: guest, accounts });
    await screen.findByRole('heading', { name: 'Account' });
    // Sign out straight after a change, before the batched send would run.
    await user.click(screen.getByRole('radio', { name: 'Dark' })); // Light is the default
    await user.click(screen.getAllByRole('button', { name: 'Sign out' })[0] as HTMLElement);
    await user.click(
      within(await screen.findByRole('dialog', { name: 'Sign out of CloudPrep?' })).getByRole(
        'button',
        { name: 'Sign out' },
      ),
    );
    expect(await screen.findByText('Signed out')).toBeVisible();
    expect(tables.rows('user_preferences').map((row) => row['preferences'])).toEqual([
      { theme: 'dark' },
    ]);
  });
});

describe('adding guest data to the account', () => {
  it('AC-B.21 asks once after signing in, and "Add to my account" merges guest data', async () => {
    const tables = createFakeUserTables();
    const { guest, accounts } = browser(tables);
    guest.toggleBookmark(GUEST_QUESTION.id, T0);
    guest.recordAnswer({ questionId: GUEST_QUESTION.id, isCorrect: true, at: T0, sessionId: 's' });

    const { user, unmount } = renderApp('/bookmarks', { store: guest, accounts });
    const dialog = await screen.findByRole('dialog', {
      name: "Add this browser's progress to your account?",
    });
    expect(dialog).toHaveTextContent('1 practice answer and 1 bookmark');
    await user.click(within(dialog).getByRole('button', { name: 'Add to my account' }));
    expect(await screen.findByText(GUEST_QUESTION.stem)).toBeVisible();
    await waitFor(() => {
      expect(tables.rows('bookmarks').map((row) => row['question_id'])).toEqual([
        GUEST_QUESTION.id,
      ]);
    });
    expect(tables.rows('question_progress')).toHaveLength(1);
    // Guest data stays, and the question isn't asked again.
    expect(Object.keys(guest.getSnapshot().data.bookmarks)).toEqual([GUEST_QUESTION.id]);
    unmount();
    renderApp('/bookmarks', { store: guest, accounts });
    expect(await screen.findByText(GUEST_QUESTION.stem)).toBeVisible();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('AC-B.21 "Not now" adds nothing and Settings offers it again', async () => {
    const tables = createFakeUserTables();
    const { guest, accounts } = browser(tables);
    guest.toggleBookmark(GUEST_QUESTION.id, T0);

    const { user } = renderApp('/settings', { store: guest, accounts });
    const dialog = await screen.findByRole('dialog', {
      name: "Add this browser's progress to your account?",
    });
    await user.click(within(dialog).getByRole('button', { name: 'Not now' }));
    expect(await screen.findByText('You can add it later from Settings.')).toBeVisible();
    expect(accounts.wasAskedToImport(FAKE_USER.id)).toBe(true);
    expect(tables.rows('bookmarks')).toEqual([]);

    await user.click(screen.getByRole('button', { name: 'Add it to my account' }));
    await waitFor(() => {
      expect(tables.rows('bookmarks')).toHaveLength(1);
    });
  });

  it('AC-B.21 does not ask when the browser has no guest data, or a guest', async () => {
    const tables = createFakeUserTables();
    const empty = browser(tables);
    const { unmount } = renderApp('/settings', { store: empty.guest, accounts: empty.accounts });
    await screen.findByRole('heading', { level: 1, name: 'Settings' });
    expect(screen.queryByRole('dialog')).toBeNull();
    unmount();

    const asGuest = browser(tables);
    asGuest.guest.toggleBookmark(GUEST_QUESTION.id, T0);
    renderApp('/settings', {
      store: asGuest.guest,
      accounts: asGuest.accounts,
      auth: createFakeAuthClient(),
    });
    await screen.findByRole('heading', { level: 1, name: 'Settings' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('sync status', () => {
  it('AC-B.25 the sign-out question says whether everything is saved to the account', async () => {
    const tables = createFakeUserTables();
    const { guest, accounts } = browser(tables);
    accounts.markAskedToImport(FAKE_USER.id);
    const { user } = renderApp('/settings', { store: guest, accounts });
    await screen.findByText('Your progress, exam history and settings are saved to your account.');
    await user.click(screen.getAllByRole('button', { name: 'Sign out' })[0] as HTMLElement);
    expect(
      await screen.findByRole('dialog', { name: 'Sign out of CloudPrep?' }),
    ).toHaveAccessibleDescription(/Your progress is saved to your account/);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    tables.failWith = 'Failed to fetch';
    await user.click(screen.getByRole('radio', { name: 'Dark' })); // Light is the default
    await screen.findByText(/1 change is waiting to be saved/, {}, { timeout: 3000 });
    await user.click(screen.getAllByRole('button', { name: 'Sign out' })[0] as HTMLElement);
    expect(
      await screen.findByRole('dialog', { name: 'Sign out of CloudPrep?' }),
    ).toHaveAccessibleDescription(/haven't reached your account yet/);
  });

  it('AC-B.22 Settings shows whether changes are saved to the account', async () => {
    const tables = createFakeUserTables();
    const { guest, accounts } = browser(tables);
    accounts.markAskedToImport(FAKE_USER.id);
    const { user } = renderApp('/settings', { store: guest, accounts });
    expect(
      await screen.findByText(
        'Your progress, exam history and settings are saved to your account.',
      ),
    ).toBeVisible();

    tables.failWith = 'Failed to fetch';
    await user.click(screen.getByRole('radio', { name: 'Dark' })); // Light is the default
    expect(
      await screen.findByText(
        /1 change is waiting to be saved to your account/,
        {},
        { timeout: 3000 },
      ),
    ).toBeVisible();
  });
});
