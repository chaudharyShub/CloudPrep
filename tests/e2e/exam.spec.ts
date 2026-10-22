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

function clockSeconds(text: string | null): number {
  const parts = (text ?? '').split(':').map(Number);
  return parts.reduce((total, part) => total * 60 + part, 0);
}

async function startFullExam(page: Page) {
  await page.goto('/exam');
  await page.getByRole('button', { name: 'Start full exam' }).click();
  await page.getByRole('button', { name: 'Start exam' }).click();
  await expect(page.getByRole('heading', { level: 1, name: /^Question 1 of \d+$/ })).toBeVisible();
}

/** Answers the current question with its first option(s). */
async function answerCurrent(page: Page) {
  // Wait until the question has rendered before deciding between radios and checkboxes.
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

// The flows below use desktop controls; phone-sized layouts have their own test at the end.
test.beforeEach(async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name === 'mobile' && !testInfo.title.startsWith('mobile:'),
    'Desktop flow; covered on phones by the mobile test',
  );
  await page.clock.install({ time: new Date('2026-10-21T09:00:00Z') });
  await page.goto('/exam');
  await page.evaluate(() => {
    window.localStorage.clear();
  });
});

test('take the full exam: answer, flag, review, confirm and see results', async ({ page }) => {
  // Several full-page accessibility scans (the results page is long) are slow in WebKit.
  test.setTimeout(90_000);
  await page.goto('/exam');
  await expect(page.getByRole('button', { name: 'Start full exam' })).toBeVisible();
  await expectNoSeriousA11yViolations(page);
  await startFullExam(page);
  // The clock runs in real time, so allow for the first seconds ticking away.
  await expect(page.getByRole('timer')).toHaveText(/^1:(30:00|29:\d\d)$/);
  await expectNoSeriousA11yViolations(page);

  await answerCurrent(page);
  await page.getByRole('button', { name: 'Flag for review' }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).first().click();
  await expect(page.getByRole('heading', { level: 1, name: /^Question 2 of/ })).toBeFocused();
  await answerCurrent(page);

  await page.getByRole('link', { name: 'Review all' }).first().click();
  await expect(page.getByRole('heading', { level: 1, name: 'Review your answers' })).toBeVisible();
  await expectNoSeriousA11yViolations(page);
  await page.getByRole('radio', { name: /^Flagged \(1\)$/ }).check();
  await page.getByRole('button', { name: /^1\./ }).click();
  await expect(page.getByRole('heading', { level: 1, name: /^Question 1 of/ })).toBeVisible();

  await page.getByRole('button', { name: 'Finish exam' }).click();
  const dialog = page.getByRole('dialog', { name: 'Submit your exam?' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/1 question is flagged/)).toBeVisible();
  await expectNoSeriousA11yViolations(page);
  await dialog.getByRole('button', { name: 'Submit exam' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Exam results' })).toBeVisible();
  await expect(page.getByText(/of 65 questions correct/)).toBeVisible();
  await expect(page.getByText('Official AWS result not predicted or guaranteed.')).toBeVisible();
  await expectNoSeriousA11yViolations(page);

  // Answer review: unanswered questions are reviewable, with explanations and sources.
  await page.getByRole('link', { name: 'Review all answers' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Answer review' })).toBeVisible();
  // The filter follows the URL, which React Router updates as a transition; click and wait
  // for the result rather than using check(), which reads the state immediately.
  const unanswered = page.getByRole('radio', { name: /^Unanswered \(63\)$/ });
  await unanswered.click();
  await expect(unanswered).toBeChecked();
  await expect(page.getByRole('heading', { level: 2, name: /· Not answered$/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sources' })).toBeVisible();
  await expectNoSeriousA11yViolations(page);

  await page.goto('/progress');
  await expect(page.getByText('Not enough data yet')).toBeVisible();
  await expectNoSeriousA11yViolations(page);

  await page.goto('/history');
  await expect(page.getByRole('link', { name: /Full exam · 65 questions/ })).toBeVisible();
});

test('restores the exam after a reload and keeps timing from the absolute end time', async ({
  page,
}) => {
  await startFullExam(page);
  await answerCurrent(page);
  await page.getByRole('button', { name: 'Flag for review' }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).first().click();
  await page.getByRole('button', { name: 'Next', exact: true }).first().click();
  await expect(page.getByRole('heading', { level: 1, name: /^Question 3 of/ })).toBeVisible();

  await page.clock.fastForward('10:00');
  const before = clockSeconds(await page.getByRole('timer').textContent());
  await page.reload();

  await expect(page.getByRole('heading', { level: 1, name: /^Question 3 of/ })).toBeVisible();
  const after = clockSeconds(await page.getByRole('timer').textContent());
  expect(Math.abs(before - after)).toBeLessThanOrEqual(1);
  expect(after).toBeLessThanOrEqual(80 * 60);
  const panel = page.getByRole('complementary', { name: 'Question navigation' });
  await expect(panel.getByRole('button', { name: 'Question 1: answered, flagged' })).toBeVisible();
});

test('warns when time is low and submits automatically at zero', async ({ page }) => {
  await startFullExam(page);
  await answerCurrent(page);

  await page.clock.fastForward('01:21:00'); // 9 minutes left
  await expect(page.getByText('Less than 10 minutes remaining.')).toBeAttached();
  await page.clock.fastForward('05:00'); // 4 minutes left
  await expect(page.getByText('Less than 5 minutes remaining.')).toBeAttached();

  await page.clock.fastForward('04:05'); // past the end
  await expect(page.getByRole('heading', { level: 1, name: 'Exam results' })).toBeVisible();
  await expect(
    page.getByText('The exam was submitted automatically when the timer reached zero.'),
  ).toBeVisible();
  // Only one attempt was stored.
  const attempts = await page.evaluate(
    () =>
      (
        JSON.parse(window.localStorage.getItem('cloudprep:examAttempts') ?? '{}') as {
          data: unknown[];
        }
      ).data.length,
  );
  expect(attempts).toBe(1);
});

test('an exam that expired while the browser was closed is submitted on return', async ({
  page,
  context,
}) => {
  await startFullExam(page);
  await answerCurrent(page);
  await page.close();

  const reopened = await context.newPage();
  await reopened.clock.install({ time: new Date('2026-10-21T11:00:00Z') }); // 2 hours later
  await reopened.goto('/exam/session');
  await expect(reopened.getByRole('heading', { level: 1, name: 'Exam results' })).toBeVisible();
  await expect(reopened.getByText(/ended while CloudPrep was closed/)).toBeVisible();
});

test('mobile: timer stays visible, navigator opens in a dialog, controls never cover answers', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await startFullExam(page);
  await expect(page.getByRole('timer')).toBeVisible();

  // Scroll to the bottom: the last option must sit above the fixed bottom bar.
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  const bar = await page.getByRole('navigation', { name: 'Exam navigation' }).boundingBox();
  const lastOption = await page.locator('main li label').last().boundingBox();
  expect(bar && lastOption && lastOption.y + lastOption.height <= bar.y).toBe(true);
  await expect(page.getByRole('timer')).toBeInViewport();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);

  await page.getByRole('button', { name: /open question list/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Questions' });
  await expect(dialog).toBeVisible();
  await expectNoSeriousA11yViolations(page);
  await dialog.getByRole('button', { name: /^Question 5:/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: /^Question 5 of/ })).toBeVisible();
});
