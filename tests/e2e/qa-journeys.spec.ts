import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// QA pass: the critical user journeys that other spec files don't already cover.

async function expectNoSeriousA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const serious = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  );
  expect(serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
}

async function startFullExam(page: Page) {
  await page.goto('/exam');
  await page.getByRole('button', { name: 'Start full exam' }).click();
  await page.getByRole('button', { name: 'Start exam' }).click();
  await expect(page.getByRole('heading', { level: 1, name: /^Question 1 of \d+$/ })).toBeVisible();
}

async function answerCurrent(page: Page) {
  await page.getByText(/^Select (one answer|\w+ answers)\./).waitFor();
  const radios = page.getByRole('radio');
  if ((await radios.count()) > 0) {
    await radios.first().check();
    return;
  }
  const counter = await page.getByText(/\(\d+ of \d+ selected\)/).textContent();
  const needed = Number(/of (\d+) selected/.exec(counter ?? '')?.[1] ?? '2');
  for (let i = 0; i < needed; i++) await page.getByRole('checkbox').nth(i).check();
}

async function submitExam(page: Page) {
  await page.getByRole('button', { name: 'Finish exam' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Submit exam' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Exam results' })).toBeVisible();
}

test.beforeEach(async ({ page, isMobile }) => {
  test.skip(isMobile, 'Desktop journeys; phone layouts are covered in the other spec files');
  await page.goto('/dashboard');
  await page.evaluate(() => {
    window.localStorage.clear();
  });
});

test('A. first visit: dashboard empty states, navigation, settings survive a refresh', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'No mock exams yet' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'No attempts yet' })).toBeVisible();
  await expect(page.getByText('No practice answers yet').first()).toBeVisible();

  const nav = page.getByRole('navigation', { name: 'Main' }).first();
  const destinations: [RegExp, RegExp][] = [
    [/^Learning/, /Learning mode/i],
    [/^Mock exam/, /exam/i],
    [/^Progress/, /Progress/],
    [/^Exam history/, /^Exam history$/],
    [/^Bookmarks/, /Bookmarks/],
    [/^Settings/, /Settings/],
  ];
  for (const [link, heading] of destinations) {
    await nav.getByRole('link', { name: link }).click();
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
  }
  await page.goto('/history');
  await expect(page.getByText(/No (exam )?attempts yet|No exams yet/).first()).toBeVisible();
  await page.goto('/progress');
  await expect(page.getByText('Not enough data yet')).toBeVisible();

  await page.goto('/settings');
  await page.getByRole('radio', { name: 'Light' }).check();
  await page.getByRole('radio', { name: /Reduce/ }).check();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduce');
  await expect(page.getByRole('radio', { name: 'Light' })).toBeChecked();
});

test('B. learning mode: single and multiple-response questions, explanations, bookmark, persistence', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.goto('/practice');
  await page.getByRole('combobox', { name: 'Domain' }).selectOption('D2');
  await page.getByRole('radio', { name: 'All', exact: true }).check();
  await page.getByRole('button', { name: 'Start practice' }).click();

  let sawSingle = false;
  let sawMulti = false;
  let checked = 0;
  for (let i = 0; i < 25 && !(sawSingle && sawMulti); i++) {
    await page.getByText(/^Select (one answer|\w+ answers)\./).waitFor();
    const isMulti = (await page.getByRole('checkbox').count()) > 0;
    if ((isMulti && sawMulti) || (!isMulti && sawSingle)) {
      await page.getByRole('button', { name: 'Skip' }).click();
      continue;
    }
    await answerCurrent(page);
    await page.getByRole('button', { name: 'Check answer' }).click();
    await expect(page.getByRole('heading', { name: /^(Correct|Incorrect)$/ })).toBeFocused();
    // The overall explanation, per-option explanations and sources are shown.
    await expect(page.getByRole('heading', { name: 'Sources' })).toBeVisible();
    await expect(page.getByRole('link', { name: /\(opens in a new tab\)$/ }).first()).toBeVisible();
    if (isMulti) sawMulti = true;
    else sawSingle = true;
    checked++;
    if (checked === 1) await page.getByRole('button', { name: 'Bookmark' }).click();
    if (!(sawSingle && sawMulti)) await page.getByRole('button', { name: 'Next question' }).click();
  }
  expect(sawSingle && sawMulti).toBe(true);

  await page.reload();
  await page.goto('/practice');
  const card = page.getByRole('listitem').filter({ hasText: 'Domain 2' }).first();
  await expect(card.getByText(/^2 of \d+$/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Practise bookmarks (1)' })).toBeEnabled();
});

test('E. results: a previous attempt still opens correctly after a new attempt', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await startFullExam(page);
  await answerCurrent(page);
  await submitExam(page);
  const firstUrl = page.url();
  const firstScore = await page.getByText(/of 65 questions correct/).textContent();

  await startFullExam(page);
  await submitExam(page);
  await expect(page.getByText('0 of 65 questions correct')).toBeVisible();
  expect(page.url()).not.toBe(firstUrl);

  await page.goto('/history');
  const links = page.getByRole('link', { name: /Full exam · 65 questions/ });
  await expect(links).toHaveCount(2);
  await links.last().click(); // newest first, so the last link is the first attempt
  await expect(page).toHaveURL(firstUrl);
  await expect(page.getByText(firstScore ?? '')).toBeVisible();
  await page.getByRole('link', { name: 'Review all answers' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Answer review' })).toBeVisible();
});

test('F. data: old-format saved data is migrated, and one category can be cleared on its own', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await startFullExam(page);
  await answerCurrent(page);
  await submitExam(page);
  const score = await page.getByText(/of 65 questions correct/).textContent();
  await page.goto('/practice');
  await page.getByRole('button', { name: 'Start practice' }).click();
  await page.getByRole('button', { name: 'Bookmark' }).click();

  // Rewrite saved data in the version 1 formats (attempts without summaries, full settings).
  await page.evaluate(() => {
    type Q = { outcome: string } & Record<string, unknown>;
    const key = 'cloudprep:examAttempts';
    const stored = JSON.parse(window.localStorage.getItem(key) ?? '{}') as {
      data: ({ questions: Q[] } & Record<string, unknown>)[];
    };
    const v1 = stored.data.map((attempt) => {
      const copy: Record<string, unknown> = { ...attempt };
      delete copy['summary'];
      delete copy['timeUsedMs'];
      delete copy['benchmarkMet'];
      copy['questions'] = attempt.questions.map(({ outcome, ...rest }) => ({
        ...rest,
        isCorrect: outcome === 'correct',
      }));
      return copy;
    });
    window.localStorage.setItem(
      key,
      JSON.stringify({ app: 'cloudprep', schemaVersion: 1, savedAt: 'x', data: v1 }),
    );
    window.localStorage.setItem(
      'cloudprep:preferences',
      JSON.stringify({
        app: 'cloudprep',
        schemaVersion: 1,
        savedAt: 'x',
        data: {
          theme: 'light',
          benchmarkPercent: 70,
          shuffleOptions: true,
          practiceSessionLength: '10',
        },
      }),
    );
  });

  await page.goto('/history');
  await page
    .getByRole('link', { name: /Full exam · 65 questions/ })
    .first()
    .click();
  await expect(page.getByText(score ?? '')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByText(/couldn't be read/)).toHaveCount(0);

  // Clear exam history only: bookmarks stay.
  await page.goto('/settings');
  await page.getByRole('button', { name: 'Clear history' }).click();
  await page
    .getByRole('dialog', { name: 'Clear exam history?' })
    .getByRole('button', { name: 'Clear history' })
    .click();
  await page.goto('/history');
  await expect(page.getByRole('link', { name: /Full exam/ })).toHaveCount(0);
  await page.goto('/bookmarks');
  await expect(page.getByRole('button', { name: /^Remove bookmark:/ })).toHaveCount(1);
});

test.describe('G. practice integrity', () => {
  test.beforeEach(({ browserName }) => {
    test.skip(browserName !== 'chromium', 'Uses Chromium fullscreen and media behaviour');
  });

  test('camera permission declined at proctored check-in: explained, nothing starts', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = () =>
        Promise.reject(new DOMException('Permission denied', 'NotAllowedError'));
    });
    await page.goto('/exam');
    await page.getByRole('radio', { name: /AI-proctored exam/ }).check();
    await page.getByRole('button', { name: 'Start full exam' }).click();
    // The check-in page loads on demand: wait for its six rules.
    await expect(page.getByRole('checkbox')).toHaveCount(6);
    for (const box of await page.getByRole('checkbox').all()) await box.check();
    await page.getByRole('button', { name: 'Agree and allow camera and microphone' }).click();
    await expect(page.getByText(/Camera or microphone access was blocked/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Look at the screen and calibrate' }),
    ).toBeDisabled();
    // No exam was started.
    await page.getByRole('link', { name: 'Cancel' }).click();
    await expect(page.getByText('You have an exam in progress')).toHaveCount(0);
  });

  test('strict practice logs focus changes in a neutral report', async ({ page }) => {
    await page.goto('/exam');
    await page.getByRole('radio', { name: /^Strict practice/ }).check();
    await page.getByRole('button', { name: 'Start full exam' }).click();
    await page.getByRole('button', { name: 'Start exam' }).click();
    await expect(page.getByRole('heading', { level: 1, name: /^Question 1 of/ })).toBeVisible();
    await answerCurrent(page);
    await page.evaluate(() => {
      window.dispatchEvent(new Event('blur'));
      window.dispatchEvent(new Event('focus'));
    });
    await submitExam(page);
    const table = page.getByRole('table', { name: 'Integrity events in time order' });
    await expect(table.getByText('Window lost focus')).toBeVisible();
    await expect(table.getByText('Window focused again')).toBeVisible();
    await expect(page.getByText(/cheat/i)).toHaveCount(0);
  });
});

test.describe('accessibility and motion', () => {
  test('reduced motion from the operating system is respected', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/dashboard');
    const duration = await page.evaluate(() => {
      const probe = document.createElement('div');
      probe.className = 'transition-colors duration-300';
      document.body.append(probe);
      return getComputedStyle(probe).transitionDuration;
    });
    expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.01);
  });

  test('exam can be taken with the keyboard, and focus is always visible', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === 'webkit', 'WebKit skips some controls on Tab by default');
    await startFullExam(page);
    // The first question may be single answer (radios) or multiple response (checkboxes).
    const firstOption = page
      .locator('main input[type="radio"], main input[type="checkbox"]')
      .first();
    await page.keyboard.press('Tab'); // keyboard modality, so :focus-visible applies
    await firstOption.focus();
    await page.keyboard.press('Space');
    await expect(firstOption).toBeChecked();
    // The focus ring is drawn on the option's label.
    const outline = await page.evaluate(() => {
      const label = (document.activeElement as Element).closest('label');
      return label ? getComputedStyle(label).outlineStyle : 'none';
    });
    expect(outline).not.toBe('none');

    await page.getByRole('button', { name: 'Finish exam' }).focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Submit your exam?' });
    await expect(dialog).toBeVisible();
    // Focus moves into the dialog and Escape returns it to the trigger.
    await expect(dialog.locator(':focus')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('button', { name: 'Finish exam' })).toBeFocused();
  });

  test('tablet: exam and results fit without horizontal scrolling and pass axe', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 768, height: 1024 });
    await startFullExam(page);
    const overflow = () =>
      page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
    expect(await overflow()).toBeLessThanOrEqual(0);
    await expect(page.getByRole('timer')).toBeInViewport();
    await expectNoSeriousA11yViolations(page);
    await submitExam(page);
    expect(await overflow()).toBeLessThanOrEqual(0);
  });
});
