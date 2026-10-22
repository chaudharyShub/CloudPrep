import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// Chromium's fake camera and a silent fake microphone (its default fake audio beeps).
const silence = path.resolve('tests/e2e/fixtures/silence.wav');
test.use({
  launchOptions: {
    args: [
      '--use-fake-device-for-media-stream',
      '--use-fake-ui-for-media-stream',
      `--use-file-for-fake-audio-capture=${silence}`,
    ],
  },
  permissions: ['camera', 'microphone'],
});

test.beforeEach(async ({ page, browserName, isMobile }) => {
  test.skip(browserName !== 'chromium' || isMobile, 'Uses Chromium fake media devices');
  await page.goto('/exam');
  await page.evaluate(() => {
    window.localStorage.clear();
  });
});

async function startStrictExam(page: Page) {
  await page.goto('/exam');
  await page.getByRole('radio', { name: /^Strict practice/ }).check();
  await page.getByRole('button', { name: 'Start full exam' }).click();
  await page.getByRole('button', { name: 'Start exam' }).click();
  await expect(page.getByRole('heading', { level: 1, name: /^Question 1 of/ })).toBeVisible();
}

test('strict practice: fullscreen on start, exit warning, recovery, and a neutral report', async ({
  page,
}) => {
  await startStrictExam(page);
  await expect(page.getByText('Strict practice: focus monitoring on')).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement !== null)).toBe(true);

  await page.evaluate(() => document.exitFullscreen());
  await expect(page.getByText('You left fullscreen')).toBeVisible();
  await page.getByRole('button', { name: 'Return to fullscreen' }).click();
  await expect(page.getByText('You left fullscreen')).toBeHidden();

  await page.getByRole('button', { name: 'Finish exam' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Submit exam' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Exam results' })).toBeVisible();
  // Monitoring ends with the exam: fullscreen is released.
  await expect.poll(() => page.evaluate(() => document.fullscreenElement === null)).toBe(true);

  const table = page.getByRole('table', { name: 'Integrity events in time order' });
  await expect(table.getByText('Fullscreen exited')).toBeVisible();
  await expect(table.getByText('Fullscreen on').first()).toBeVisible();
  await expect(page.getByText(/cheat/i)).toHaveCount(0);
});

// ── AI proctor with scripted model output ──────────────────────────────────────────────

interface Scenario {
  faces: number;
  yaw: number;
  phone: boolean;
  persons: number;
  items: number;
}

/**
 * Replaces the AI models with a scripted stand-in (window.__scenario) and records every
 * camera and microphone track, so the test can check they are all stopped.
 */
async function installScriptedProctor(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as {
      __scenario: Scenario;
      __tracks: MediaStreamTrack[];
      __cloudprepProctorAnalyzer: () => unknown;
    };
    w.__scenario = { faces: 1, yaw: 0, phone: false, persons: 1, items: 0 };
    w.__cloudprepProctorAnalyzer = () => ({
      analyzeFrame: () => {
        const s = w.__scenario;
        return {
          faces: s.faces,
          face:
            s.faces > 0
              ? {
                  yaw: s.yaw,
                  pitch: 0,
                  gazeSide: 0.1,
                  gazeUp: 0,
                  gazeDown: 0.1,
                  blink: 0.1,
                  jawOpen: 0.02,
                }
              : null,
          brightness: 120,
        };
      },
      detectObjects: () => {
        const s = w.__scenario;
        return { phone: s.phone, persons: s.persons, items: s.items };
      },
      close: () => undefined,
    });
    w.__tracks = [];
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async (constraints) => {
      const stream = await original(constraints);
      w.__tracks.push(...stream.getTracks());
      return stream;
    };
  });
}

const setScenario = (page: Page, patch: Partial<Scenario>) =>
  page.evaluate((p) => {
    const w = window as unknown as { __scenario: Scenario };
    Object.assign(w.__scenario, p);
  }, patch);

const trackStates = (page: Page) =>
  page.evaluate(() =>
    (window as unknown as { __tracks: MediaStreamTrack[] }).__tracks.map((t) => t.readyState),
  );

async function checkIn(page: Page) {
  await page.goto('/exam');
  await page.getByRole('radio', { name: /AI-proctored exam/ }).check();
  await page.getByRole('button', { name: 'Start full exam' }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Proctored exam check-in' }),
  ).toBeVisible();

  const agree = page.getByRole('button', { name: 'Agree and allow camera and microphone' });
  await expect(agree).toBeDisabled();
  await expect(page.getByRole('checkbox')).toHaveCount(6);
  for (const box of await page.getByRole('checkbox').all()) await box.check();
  await agree.click();
}

test('AC-7.1 AC-7.4 AC-7.7 proctored exam: check-in, warning, then ended by a phone', async ({
  page,
}) => {
  await installScriptedProctor(page);
  // A phone on the desk blocks check-in until it is removed.
  await page.addInitScript(() => {
    (window as unknown as { __scenario: Scenario }).__scenario.phone = true;
  });
  await checkIn(page);
  const roomCheck = page.getByRole('list', { name: 'Room check' });
  await expect(roomCheck.getByText(/A phone is visible/)).toBeVisible({ timeout: 15_000 });
  const calibrate = page.getByRole('button', { name: 'Look at the screen and calibrate' });
  await expect(calibrate).toBeDisabled();

  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(
    axe.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => v.id),
  ).toEqual([]);

  await setScenario(page, { phone: false });
  await expect(roomCheck.getByText('Room check passed.')).toBeVisible({ timeout: 10_000 });
  await calibrate.click();
  await page.getByRole('button', { name: 'Start proctored exam' }).click({ timeout: 10_000 });

  await expect(page.getByRole('heading', { level: 1, name: /^Question 1 of 65/ })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement !== null)).toBe(true);
  const panel = page.getByRole('status', { name: 'AI proctor' });
  await expect(panel.getByText('AI proctor on: camera and microphone')).toBeVisible();
  await expect(
    panel.getByRole('img', { name: /Your camera/ }).or(panel.locator('video')),
  ).toBeVisible();
  expect((await trackStates(page)).every((s) => s === 'live')).toBe(true);

  // Looking away for more than 2 seconds: first warning.
  await setScenario(page, { yaw: 45 });
  const warning = page.getByRole('dialog', { name: 'Proctor warning 1 of 2' });
  await expect(warning).toBeVisible({ timeout: 10_000 });
  await expect(warning.getByText(/Head turned away/)).toBeVisible();
  await setScenario(page, { yaw: 0 });
  await warning.getByRole('button', { name: 'I understand' }).click();
  await expect(panel.getByText('Warnings 1 of 2')).toBeVisible();

  // A phone ends the exam at once.
  await setScenario(page, { phone: true });
  await expect(page.getByRole('heading', { level: 1, name: 'Exam results' })).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.getByText(/Reason: Phone detected/)).toBeVisible();
  await expect.poll(() => trackStates(page)).toEqual(expect.arrayContaining(['ended']));
  expect((await trackStates(page)).every((s) => s === 'ended')).toBe(true);
  await expect.poll(() => page.evaluate(() => document.fullscreenElement === null)).toBe(true);

  const table = page.getByRole('table', { name: 'Integrity events in time order' });
  await expect(table.getByText('Head turned away', { exact: true })).toBeVisible();
  await expect(table.getByText('Exam ended', { exact: true })).toBeVisible();

  await page.goto('/history');
  await expect(page.getByText('Ended by proctor')).toBeVisible();
});

test('AC-7.3 AC-7.5 proctored exam: blocked copy, and a reload needs a proctor restart', async ({
  page,
}) => {
  await installScriptedProctor(page);
  await checkIn(page);
  await expect(page.getByText('Room check passed.')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Look at the screen and calibrate' }).click();
  await page.getByRole('button', { name: 'Start proctored exam' }).click({ timeout: 10_000 });
  await expect(page.getByRole('heading', { level: 1, name: /^Question 1 of/ })).toBeVisible();

  await page.keyboard.press('Control+c');
  const warning = page.getByRole('dialog', { name: 'Proctor warning 1 of 2' });
  await expect(warning.getByText(/Blocked action/)).toBeVisible();
  await warning.getByRole('button', { name: 'I understand' }).click();

  // Wait past the 3-second window in which violations count as one incident.
  await page.waitForTimeout(3500);
  await page.reload();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Restart the AI proctor' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: /^Question 1 of/ })).toHaveCount(0);
  const final = page.getByRole('dialog', { name: 'Final warning from the proctor' });
  await expect(final.getByText(/Exam interrupted/)).toBeVisible();
  await final.getByRole('button', { name: 'I understand' }).click();

  await page.getByRole('button', { name: 'Restart proctor and continue' }).click();
  await expect(page.getByRole('heading', { level: 1, name: /^Question 1 of/ })).toBeVisible({
    timeout: 15_000,
  });
  await expect.poll(() => page.evaluate(() => document.fullscreenElement !== null)).toBe(true);
});

test('AC-7.1 the real AI models load and analyse the camera during check-in @real-models', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await checkIn(page);
  // Chromium's fake camera shows a test pattern, not a person: the real face model must
  // report that no face is visible.
  const roomCheck = page.getByRole('list', { name: 'Room check' });
  await expect(roomCheck).toBeVisible({ timeout: 90_000 });
  await expect(roomCheck.getByText(/Your face isn’t visible|too dark/)).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByText(/couldn’t load/)).toHaveCount(0);
});
