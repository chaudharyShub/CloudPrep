import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './support/fixtures';

test.use({ signedIn: false });

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test('AC-V.9 the landing page animates in, then shows everything and passes axe', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: /Sit the exam/ })).toBeVisible();
  // The demo exam picks an answer after a moment.
  await expect(page.locator('figure li').filter({ hasText: 'AWS Lambda' })).toHaveClass(
    /bg-highlight/,
  );

  // Scroll to each section like a reader; each fades in once it's in view, and the domain
  // bars fill to their weight.
  for (const target of [
    page.getByText('no ads, no paywall, no upsell'),
    page.getByRole('heading', { name: 'The real thing, minus the fee.' }),
    page.locator('#covered li').last(),
  ]) {
    await target.scrollIntoViewIfNeeded();
  }
  // Nothing is left in its hidden starting state.
  await expect(page.locator('main .opacity-0')).toHaveCount(0);
  const bar = page.locator('#covered li').first().locator('span[aria-hidden] > span');
  await expect(bar).toHaveAttribute('style', /width: 24%/);
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => animation.playState !== 'running'),
  );

  const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
  expect(
    results.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => v.id),
  ).toEqual([]);
});

test('AC-V.9 with reduced motion everything shows at once, with the answer already picked', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: /Sit the exam/ })).toBeVisible();
  await expect(page.locator('figure li').filter({ hasText: 'AWS Lambda' })).toHaveClass(
    /bg-highlight/,
  );
  const bar = page.locator('#covered li').first().locator('span[aria-hidden] > span');
  await expect(bar).toHaveAttribute('style', /width: 24%/);
  await expect(page.getByText('no ads, no paywall, no upsell')).toHaveCSS('opacity', '1');
});
