import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';

const PAGES = [
  { path: '/dashboard', heading: 'Dashboard' },
  { path: '/practice', heading: 'Learning mode' },
  { path: '/exam', heading: 'Mock exam' },
  { path: '/history', heading: 'Exam history' },
  { path: '/bookmarks', heading: 'Bookmarks' },
  { path: '/settings', heading: 'Settings' },
] as const;

const VIEWPORTS = [
  { name: 'phone', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
] as const;

async function expectNoSeriousA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const serious = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  );
  expect(
    serious.map((violation) => `${violation.id}: ${violation.help} (${violation.nodes.length})`),
  ).toEqual([]);
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe('pages', () => {
  for (const { path, heading } of PAGES) {
    test(`${path} loads directly, has a title and passes axe`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
      await expect(page).toHaveTitle(`${heading} · CloudPrep`);
      await expectNoSeriousA11yViolations(page);
    });
  }

  test('light theme passes axe', async ({ page }) => {
    await page.goto('/settings');
    await page.getByRole('radio', { name: 'Light' }).check();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expectNoSeriousA11yViolations(page);
  });

  // Pages are light by default (D-057, 3.0.1), so check dark too.
  test('dark theme passes axe', async ({ page }) => {
    await page.goto('/settings');
    await page.getByRole('radio', { name: 'Dark' }).check();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expectNoSeriousA11yViolations(page);
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
    await expectNoSeriousA11yViolations(page);
  });

  test('unknown routes show the not-found page', async ({ page }) => {
    await page.goto('/nope');
    await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
  });
});

test.describe('layout', () => {
  for (const viewport of VIEWPORTS) {
    test(`no horizontal overflow on any page at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      for (const { path, heading } of PAGES) {
        await page.goto(path);
        await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
        await expectNoHorizontalOverflow(page);
      }
    });
  }

  test('desktop shows the sidebar and hides the menu button', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dashboard');
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open navigation' })).toBeHidden();
  });

  test('small screens navigate through the menu drawer', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/dashboard');
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeHidden();

    await page.getByRole('button', { name: 'Open navigation' }).click();
    const drawer = page.getByRole('dialog', { name: 'Navigation' });
    await expect(drawer).toBeVisible();
    await expectNoSeriousA11yViolations(page);

    await drawer.getByRole('link', { name: 'Exam history' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Exam history' })).toBeVisible();
    await expect(drawer).toBeHidden();
    await expect(page).toHaveURL(/\/history$/);
  });
});

test.describe('keyboard', () => {
  test('first Tab reaches the skip link, which moves focus to main content', async ({
    page,
    browserName,
  }) => {
    // WebKit only tabs to links when "Press Tab to highlight each item" is enabled.
    test.skip(browserName === 'webkit', 'WebKit skips links on Tab by default');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dashboard');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });

  test('sidebar links are reachable and show the active page', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit skips links on Tab by default');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dashboard');
    const nav = page.getByRole('navigation', { name: 'Main' });
    const examLink = nav.getByRole('link', { name: 'Mock exam' });
    await examLink.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { level: 1, name: 'Mock exam' })).toBeVisible();
    await expect(examLink).toHaveAttribute('aria-current', 'page');
  });

  test('dialog opened from the keyboard closes on Escape and returns focus', async ({ page }) => {
    await page.goto('/settings');
    const resetButton = page.getByRole('button', { name: 'Reset everything' });
    // Open with the keyboard: WebKit doesn't focus buttons on mouse click, so there is
    // nothing to return focus to in that case (same as native Safari behaviour).
    await resetButton.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', { name: 'Reset all CloudPrep data?' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Reset all CloudPrep data?' })).toBeHidden();
    await expect(resetButton).toBeFocused();
  });
});
