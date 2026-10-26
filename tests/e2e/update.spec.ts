import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';

/**
 * A deploy renames the page files and removes the old ones, so a tab opened before it can't
 * load pages it hasn't visited yet (D-053). These tests make the Settings page's file fail.
 */

async function openSettingsFromMenu(page: Page, isMobile: boolean) {
  if (isMobile) await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('link', { name: 'Settings' }).filter({ visible: true }).click();
}

/** A removed file. Not cacheable, like Vercel's 404 for a missing asset. */
const MISSING = { status: 404, headers: { 'cache-control': 'no-store' }, body: 'Not found' };

/**
 * Simulates a deploy while the tab is open: the Settings page's file under its old name is
 * gone, and the new version (what a reload downloads) links to it under a new name. With
 * `newFileWorks: false` the new file fails too, like being offline.
 */
async function deployNewVersion(page: Page, { newFileWorks }: { newFileWorks: boolean }) {
  const requests = { oldName: 0, newName: 0 };
  let deployed = false;
  let reloaded = false;
  page.on('request', (request) => {
    if (deployed && request.isNavigationRequest()) reloaded = true;
  });
  await page.route(/\/assets\/[^/]+\.js(\?.*)?$/, async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.includes('/SettingsPage-')) {
      if (url.search === '') {
        requests.oldName += 1;
        deployed = true;
        await route.fulfill(MISSING);
        return;
      }
      requests.newName += 1;
      await (newFileWorks ? route.continue() : route.fulfill(MISSING));
      return;
    }
    if (!reloaded) {
      await route.continue();
      return;
    }
    // The new version's code refers to the page file by its new name.
    try {
      const response = await route.fetch();
      const body = (await response.text()).replace(/(SettingsPage-[\w-]+\.js)/g, '$1?v=2');
      await route.fulfill({ response, body });
    } catch {
      // A request from the old page, cancelled by the reload.
    }
  });
  return requests;
}

function countPageLoads(page: Page) {
  const loads = { count: 0 };
  page.on('load', () => {
    loads.count += 1;
  });
  return loads;
}

test('AC-U.5 a page file missing after a deploy reloads once and opens the page', async ({
  page,
  isMobile,
}) => {
  await page.goto('/practice');
  await expect(page.getByRole('heading', { level: 1, name: 'Learning mode' })).toBeVisible();

  const requests = await deployNewVersion(page, { newFileWorks: true });
  const loads = countPageLoads(page);

  await openSettingsFromMenu(page, isMobile);
  await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
  await expect(page).toHaveURL(/\/settings$/);
  expect(requests).toEqual({ oldName: 1, newName: 1 });
  expect(loads.count).toBe(1);
  await expect(page.getByRole('heading', { name: 'Something went wrong' })).toBeHidden();
});

test('AC-U.5 a file that keeps failing shows the error after one reload, not a loop', async ({
  page,
  isMobile,
}) => {
  await page.goto('/practice');
  await expect(page.getByRole('heading', { level: 1, name: 'Learning mode' })).toBeVisible();

  const requests = await deployNewVersion(page, { newFileWorks: false });
  const loads = countPageLoads(page);

  await openSettingsFromMenu(page, isMobile);
  await expect(page.getByRole('heading', { name: 'Something went wrong' })).toBeVisible();
  await expect(page.getByText(/may have just been updated/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reload' })).toBeVisible();
  // Give a second reload time to happen if the guard were broken.
  await page.waitForTimeout(1_000);
  expect(loads.count).toBe(1);
  expect(requests.oldName).toBe(1);
});
