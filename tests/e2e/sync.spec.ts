import type { Page } from '@playwright/test';
import { E2E_AUTH_KEY, E2E_REMOTE_KEY, expect, test } from './support/fixtures';

// The E2E build syncs with a fake server kept in localStorage (D-047).
test.use({ sync: true });

test.beforeEach(async ({ page }) => {
  await page.goto('/settings');
  await page.evaluate(() => {
    window.localStorage.clear();
  });
});

/** Bookmarks the first question of a Learning mode session. */
async function bookmarkFirstQuestion(page: Page) {
  await page.goto('/practice');
  await page.getByRole('button', { name: 'Start practice' }).click();
  await page.getByRole('button', { name: 'Bookmark' }).click();
}

/** Like opening CloudPrep on another device: only the server (and the sign-in) remain. */
async function forgetThisBrowser(page: Page) {
  await page.evaluate(
    ({ keep }) => {
      for (const key of Object.keys(window.localStorage)) {
        if (!keep.includes(key)) window.localStorage.removeItem(key);
      }
    },
    { keep: [E2E_REMOTE_KEY, E2E_AUTH_KEY] },
  );
}

test('AC-B.18 progress is saved to the account and appears on another device', async ({ page }) => {
  await bookmarkFirstQuestion(page);
  await page.goto('/settings');
  await expect(
    page.getByText('Your progress, exam history and settings are saved to your account.'),
  ).toBeVisible();

  await forgetThisBrowser(page);
  await page.goto('/bookmarks');
  await expect(page.getByRole('button', { name: /^Remove bookmark:/ })).toHaveCount(1);
});

test.describe('as a guest first', () => {
  test.use({ signedIn: false });

  test('AC-B.20 AC-B.21 guest progress is added on request; signing out removes the copy', async ({
    page,
  }) => {
    await bookmarkFirstQuestion(page);

    await page.goto('/sign-in?next=%2Fbookmarks');
    await page.getByRole('button', { name: 'Continue with Google' }).click();
    const dialog = page.getByRole('dialog', {
      name: "Add this browser's progress to your account?",
    });
    await expect(dialog).toContainText('1 bookmark');
    await dialog.getByRole('button', { name: 'Add to my account' }).click();
    await expect(page.getByRole('button', { name: /^Remove bookmark:/ })).toHaveCount(1);

    // The bookmark reached the server.
    await page.goto('/settings');
    await expect(
      page.getByText('Your progress, exam history and settings are saved to your account.'),
    ).toBeVisible();

    // The Account card's button (the navigation has one too).
    await page.getByRole('button', { name: 'Sign out' }).filter({ visible: true }).last().click();
    await expect(page.getByText('Signed out')).toBeVisible();
    const accountKeys = await page.evaluate(() =>
      Object.keys(window.localStorage).filter((key) => key.startsWith('cloudprep-account:')),
    );
    expect(accountKeys).toEqual([]);
    // The guest's own bookmark is still here, and signing in again doesn't ask twice.
    await page.goto('/bookmarks');
    await expect(page.getByRole('button', { name: /^Remove bookmark:/ })).toHaveCount(1);
  });
});
