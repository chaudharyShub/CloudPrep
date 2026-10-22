import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './support/fixtures';

// Runs against the E2E build, whose fake sign-in stands in for Supabase (D-045).
test.describe('as a guest', () => {
  test.use({ signedIn: false });

  test('AC-B.6 signed-in-only pages lead to sign-in; Learning mode stays open', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Sign in' })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      results.violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => v.id),
    ).toEqual([]);

    await page.getByRole('link', { name: 'Continue as a guest' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Learning mode' })).toBeVisible();

    await page.goto('/exam');
    await expect(page).toHaveURL(/\/sign-in\?next=%2Fexam$/);
    await expect(page.getByText('Sign in to continue')).toBeVisible();
  });

  test('AC-B.7 a sign-in link request is confirmed', async ({ page }) => {
    await page.goto('/sign-in');
    await page.getByLabel('Email address').fill('ada@example.com');
    await page.getByRole('button', { name: 'Email me a sign-in link' }).click();
    await expect(page.getByRole('status')).toContainText('ada@example.com');
  });

  test('AC-B.8 AC-B.9 AC-B.10 Google sign-in returns to the page, and sign-out works', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/history');
    await page.getByRole('button', { name: 'Continue with Google' }).click();
    // The fake goes through /auth/callback like the real redirect.
    await expect(page.getByRole('heading', { level: 1, name: 'Exam history' })).toBeVisible();
    await expect(page).toHaveURL(/\/history$/);

    // Still signed in after a reload.
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: 'Exam history' })).toBeVisible();

    if (isMobile) await page.getByRole('button', { name: 'Open navigation' }).click();
    // The desktop sidebar and the phone drawer both show the account; use the visible one.
    await expect(page.getByText('Test Learner').filter({ visible: true })).toBeVisible();
    await page.getByRole('button', { name: 'Sign out' }).filter({ visible: true }).click();
    await expect(page).toHaveURL(/\/sign-in\?next=%2Fhistory$/);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: 'Sign in' })).toBeVisible();
  });
});
