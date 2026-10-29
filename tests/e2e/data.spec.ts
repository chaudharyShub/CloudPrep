import { readFile } from 'node:fs/promises';
import { expect, test } from './support/fixtures';

test.beforeEach(async ({ page }) => {
  await page.goto('/settings');
  await page.evaluate(() => {
    window.localStorage.clear();
  });
});

test('settings persist across reloads', async ({ page }) => {
  await page.goto('/settings');
  // Dark, because the default theme is light.
  await page.getByRole('radio', { name: 'Dark' }).check();
  await page.getByRole('combobox', { name: 'Practice benchmark' }).selectOption('80');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('combobox', { name: 'Practice benchmark' })).toHaveValue('80');
});

test('export, reset everything, import: data comes back', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'Download handling is covered in Chromium');
  // Create some data: a bookmark.
  await page.goto('/practice');
  await page.getByRole('button', { name: 'Start practice' }).click();
  await page.getByRole('button', { name: 'Bookmark' }).click();

  await page.goto('/settings');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export data' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^cloudprep-export-.*\.json$/);
  const path = await download.path();
  const content = await readFile(path, 'utf8');

  await page.getByRole('button', { name: 'Reset everything' }).click();
  const dialog = page.getByRole('dialog', { name: 'Reset all CloudPrep data?' });
  await dialog.getByRole('textbox').fill('RESET');
  await dialog.getByRole('button', { name: 'Reset everything' }).click();
  await page.goto('/bookmarks');
  await expect(page.getByRole('heading', { name: 'No bookmarks yet' })).toBeVisible();

  await page.goto('/settings');
  await page.getByLabel('Import data').setInputFiles({
    name: 'export.json',
    mimeType: 'application/json',
    buffer: Buffer.from(content),
  });
  const preview = page.getByRole('region', { name: /Ready to import/ });
  await expect(preview).toBeVisible();
  await preview.getByRole('button', { name: 'Merge data' }).click();
  await page
    .getByRole('dialog', { name: 'Merge this data?' })
    .getByRole('button', { name: 'Merge data' })
    .click();

  await page.goto('/bookmarks');
  await expect(page.getByRole('button', { name: /^Remove bookmark:/ })).toHaveCount(1);
});

test('a malformed import file is rejected with an explanation', async ({ page }) => {
  await page.goto('/settings');
  await page.getByLabel('Import data').setInputFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from('<script>alert(1)</script>'),
  });
  await expect(page.getByText("This file can't be imported")).toBeVisible();
  await expect(page.getByText(/isn't valid JSON/)).toBeVisible();
});
