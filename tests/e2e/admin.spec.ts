import { expect, test } from './support/fixtures';

const ROWS = [
  {
    user_id: '00000000-0000-4000-8000-00000000000a',
    email: 'friend@example.com',
    display_name: 'A Friend',
    provider: 'google',
    signed_up_at: '2026-10-20T10:00:00Z',
    last_sign_in_at: '2026-10-28T09:00:00Z',
    questions_answered: 64,
    last_answered_at: '2026-10-28T09:30:00Z',
    practice_sessions: 4,
    exam_attempts: 1,
    best_exam_percent: 76,
    last_exam_at: '2026-10-27T18:00:00Z',
  },
];

test.describe('Admin page', () => {
  test('AC-A.2 a signed-in user who is not an admin sees no data', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'No admin access' })).toBeVisible();
    await expect(page.getByRole('table')).toHaveCount(0);
  });

  test('AC-A.3 an admin sees the user list', async ({ page }) => {
    await page.addInitScript((rows) => {
      (window as unknown as { __cloudprepE2EAdmin: unknown[] }).__cloudprepE2EAdmin = rows;
    }, ROWS);
    await page.goto('/admin');
    await expect(page.getByRole('heading', { level: 1, name: 'Admin' })).toBeVisible();
    const row = page.getByRole('row', { name: /A Friend/ });
    await expect(row).toContainText('friend@example.com');
    await expect(row).toContainText('76%');
  });
});

test.describe('Admin page as a guest', () => {
  test.use({ signedIn: false });

  test('AC-A.1 guests are sent to sign-in', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/sign-in/);
  });
});
