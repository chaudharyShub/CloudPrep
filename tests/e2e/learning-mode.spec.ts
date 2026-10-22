import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';

async function expectNoSeriousA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const serious = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  );
  expect(serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

/** Selects enough options to enable "Check answer" (first option, or first N checkboxes). */
async function answerCurrentQuestion(page: Page) {
  // Wait until the question has rendered before deciding between radios and checkboxes.
  await page.getByText(/^Select (one answer|\w+ answers)\./).waitFor();
  const radios = page.getByRole('radio');
  if ((await radios.count()) > 0) {
    await radios.first().check();
  } else {
    // The instructions say e.g. "(0 of 2 selected)".
    const counter = await page.getByText(/\(\d+ of \d+ selected\)/).textContent();
    const needed = Number(/of (\d+) selected/.exec(counter ?? '')?.[1] ?? '2');
    const boxes = page.getByRole('checkbox');
    for (let i = 0; i < needed; i++) await boxes.nth(i).check();
  }
}

test.beforeEach(async ({ page }) => {
  // Each test starts with empty storage.
  await page.goto('/practice');
  await page.evaluate(() => {
    window.localStorage.clear();
  });
});

test('practise a domain, check answers, bookmark, and keep progress after reload', async ({
  page,
}) => {
  await page.goto('/practice');
  await expectNoSeriousA11yViolations(page);

  await page.getByRole('combobox', { name: 'Domain' }).selectOption('D1');
  await page.getByRole('radio', { name: '5', exact: true }).check();
  await page.getByRole('button', { name: 'Start practice' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Cloud Concepts' })).toBeVisible();
  await expect(page.getByText('Question 1 of 5')).toBeVisible();
  const check = page.getByRole('button', { name: 'Check answer' });
  await expect(check).toBeDisabled();
  await expectNoSeriousA11yViolations(page);

  await answerCurrentQuestion(page);
  await check.click();
  const feedback = page.getByRole('heading', { name: /^(Correct|Incorrect)$/ });
  await expect(feedback).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Sources' })).toBeVisible();
  await expectNoSeriousA11yViolations(page);

  await page.getByRole('button', { name: 'Bookmark' }).click();
  await expect(page.getByRole('button', { name: 'Bookmarked' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  // Reload the Learning page: progress and bookmark were saved.
  await page.goto('/practice');
  const domainCard = page.getByRole('listitem').filter({ hasText: 'Domain 1' }).first();
  await expect(domainCard.getByText(/^1 of \d+$/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Practise bookmarks (1)' })).toBeEnabled();

  await page.goto('/bookmarks');
  await expect(page.getByRole('button', { name: /^Remove bookmark:/ })).toHaveCount(1);
});

test('finish a session and see the summary', async ({ page }) => {
  await page.goto('/practice');
  await page.getByRole('combobox', { name: 'Domain' }).selectOption('D4');
  await page.getByRole('combobox', { name: 'Topic' }).selectOption('4.3');
  await expect(page.getByText(/^\d+ questions? match/)).toBeVisible();
  await page.getByRole('radio', { name: '5', exact: true }).check();
  await page.getByRole('button', { name: 'Start practice' }).click();

  // Work through the 5-question session; "Finish session" appears after the last check.
  for (let i = 0; i < 5; i++) {
    await answerCurrentQuestion(page);
    await page.getByRole('button', { name: 'Check answer' }).click();
    if (i < 4) await page.getByRole('button', { name: 'Next question' }).click();
  }
  await page.getByRole('button', { name: 'Finish session' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Session complete' })).toBeFocused();
  await expectNoSeriousA11yViolations(page);
  await page.getByRole('link', { name: 'Back to Learning mode' }).click();
  await expect(page.getByRole('heading', { name: 'Recent sessions' })).toBeVisible();
  await expect(page.getByText(/correct$/).first()).toBeVisible();
});

test('answer options work with the keyboard only', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKit skips some controls on Tab by default');
  await page.goto('/practice');
  await page.getByRole('combobox', { name: 'Domain' }).selectOption('D1');
  await page.getByRole('combobox', { name: 'Topic' }).selectOption('1.4');
  await page.getByRole('button', { name: 'Start practice' }).click();
  await expect(page.getByText(/Question 1 of/)).toBeVisible();
  // Questions are random: skip multiple-response ones (checkboxes) to reach a radio group.
  for (let i = 0; i < 9; i++) {
    await page.getByText(/^Select (one answer|\w+ answers)\./).waitFor();
    if ((await page.getByRole('radio').count()) > 0) break;
    await page.getByRole('button', { name: 'Skip' }).click();
  }

  // Focus the first option and choose with the keyboard.
  await page.getByRole('radio').first().focus();
  await page.keyboard.press('Space');
  await expect(page.getByRole('radio').first()).toBeChecked();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('radio').nth(1)).toBeChecked();

  await page.getByRole('button', { name: 'Check answer' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: /^(Correct|Incorrect)$/ })).toBeFocused();
});

test('practice pages fit a phone screen', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/practice');
  await expectNoHorizontalOverflow(page);
  await page.getByRole('button', { name: 'Start practice' }).click();
  await expect(page.getByText(/Question 1 of/)).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await answerCurrentQuestion(page);
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expectNoHorizontalOverflow(page);
});

test('recovers from corrupted saved progress without crashing', async ({ page }) => {
  await page.goto('/practice');
  await page.evaluate(() => {
    window.localStorage.setItem('cloudprep:progress', '{not valid json');
  });
  await page.goto('/practice');
  await expect(page.getByText(/Some saved practice progress couldn't be read/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start practice' })).toBeEnabled();
  const backups = await page.evaluate(() =>
    Object.keys(window.localStorage).filter((key) => key.startsWith('cloudprep:backup:progress:')),
  );
  expect(backups).toHaveLength(1);
});
