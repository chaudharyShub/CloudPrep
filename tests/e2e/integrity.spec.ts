import { expect, test, type Page } from '@playwright/test';

// Camera tests need Chromium's fake camera; other browsers are covered by unit tests.
test.use({
  launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] },
  permissions: ['camera'],
});

test.beforeEach(async ({ page, browserName, isMobile }) => {
  test.skip(browserName !== 'chromium' || isMobile, 'Uses Chromium fake media devices');
  await page.goto('/exam');
  await page.evaluate(() => {
    window.localStorage.clear();
  });
});

async function startShortExam(page: Page, mode: RegExp) {
  await page.goto('/exam');
  await page.getByRole('radio', { name: mode }).check();
  await page.getByRole('button', { name: 'Start shorter exam' }).click();
  await page.getByRole('button', { name: 'Start exam' }).click();
  await expect(page.getByRole('heading', { level: 1, name: /^Question 1 of/ })).toBeVisible();
}

test('strict practice: fullscreen on start, exit warning, recovery, and a neutral report', async ({
  page,
}) => {
  await startShortExam(page, /^Strict practice(?! with)/);
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

test('webcam checks: indicator shown, camera released when the exam ends', async ({ page }) => {
  // Stand in for the browser's built-in FaceDetector (not enabled by default in Chromium),
  // and record camera tracks so we can check they are stopped.
  await page.addInitScript(() => {
    (window as unknown as { FaceDetector: unknown }).FaceDetector = class {
      detect() {
        return Promise.resolve([{}]);
      }
    };
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    const tracks: MediaStreamTrack[] = [];
    (window as unknown as { __tracks: MediaStreamTrack[] }).__tracks = tracks;
    navigator.mediaDevices.getUserMedia = async (constraints) => {
      const stream = await original(constraints);
      tracks.push(...stream.getTracks());
      return stream;
    };
  });
  await startShortExam(page, /^Strict practice with webcam/);
  await expect(page.getByText(/Camera on/)).toBeVisible();
  await expect(page.getByText(/face visible/)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/nothing is recorded/)).toBeVisible();

  await page.getByRole('button', { name: 'Finish exam' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Submit exam' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Exam results' })).toBeVisible();

  const states = await page.evaluate(() =>
    (window as unknown as { __tracks: MediaStreamTrack[] }).__tracks.map((t) => t.readyState),
  );
  expect(states.length).toBeGreaterThan(0);
  expect(states.every((state) => state === 'ended')).toBe(true);
  await expect(
    page.getByRole('table', { name: 'Integrity events in time order' }).getByText('Camera on'),
  ).toBeVisible();
});

test('turning the camera off stops it immediately and the exam continues', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { FaceDetector: unknown }).FaceDetector = class {
      detect() {
        return Promise.resolve([]);
      }
    };
  });
  await startShortExam(page, /^Strict practice with webcam/);
  await expect(page.getByText(/Camera on/)).toBeVisible();
  await page.getByRole('button', { name: 'Turn camera off' }).click();
  await expect(page.getByText('Camera off')).toBeVisible();
  // The exam carries on normally without the camera.
  await page.getByRole('button', { name: 'Next', exact: true }).first().click();
  await expect(page.getByRole('heading', { level: 1, name: /^Question 2 of/ })).toBeVisible();
});
