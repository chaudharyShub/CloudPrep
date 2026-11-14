import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';

/** Collects console errors and uncaught errors, such as React failing to take a page over. */
function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

test.describe('as a guest', () => {
  test.use({ signedIn: false });

  // What a link-preview bot or Google's first look gets: the raw HTML, without JavaScript.
  const PAGES = [
    {
      path: '/saa-c03',
      title: 'Practice for the AWS Solutions Architect exam · SAA-C03 · CloudPrep',
      heading: /Sit the exam/,
      content: 'Solutions Architect',
    },
    {
      path: '/dva-c03/practice',
      title: 'Learning mode · DVA-C03 · CloudPrep',
      heading: 'Learning mode',
      content: null,
    },
    {
      path: '/privacy',
      title: 'Privacy · CloudPrep',
      heading: 'Privacy',
      content: 'Usage statistics',
    },
  ] as const;

  for (const page of PAGES) {
    test(`AC-S.11 ${page.path} serves its own head${page.content ? ' and content' : ''} without JavaScript, and the app starts`, async ({
      page: browser,
      request,
    }) => {
      const response = await request.get(page.path);
      expect(response.status()).toBe(200);
      const html = await response.text();
      expect(html).toContain(`<title>${page.title}</title>`);
      expect(html).toContain(`<meta property="og:title" content="${page.title}" />`);
      expect(html).toContain(`<meta property="og:url" content="${page.path}" />`);
      expect(html).not.toContain('application/ld+json');
      if (page.content) {
        // AC-S.12: the page's text is in the HTML itself (D-068).
        expect(html).toMatch(/<div id="root" data-prerendered="[a-z0-9-]+"><.+<h1/s);
        expect(html).toContain(page.content);
      } else {
        expect(html).toContain('<div id="root"></div>');
      }

      const errors = watchErrors(browser);
      await browser.goto(page.path);
      await expect(browser.getByRole('heading', { level: 1, name: page.heading })).toBeVisible();
      await expect(browser).toHaveTitle(page.title);
      expect(errors).toEqual([]);
    });
  }

  test('AC-S.13 the browser takes a pre-rendered page over: no errors, and it responds', async ({
    page,
  }) => {
    const errors = watchErrors(page);
    await page.goto('/dva-c03');
    // The demo exam picks an answer once React runs the page.
    await expect(page.locator('figure li').filter({ hasText: 'AWS Secrets Manager' })).toHaveClass(
      /bg-highlight/,
    );
    await page
      .getByRole('link', { name: /Start practising/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/dva-c03\/practice$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Learning mode' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('AC-S.11 the home page is pre-rendered; other addresses get the empty app page', async ({
    request,
  }) => {
    const home = await (await request.get('/')).text();
    expect(home).toContain('application/ld+json');
    expect(home).toContain('<div id="root" data-prerendered="clf-c02">');
    for (const path of ['/saa-c03/dashboard', '/settings', '/does-not-exist']) {
      const html = await (await request.get(path)).text();
      expect(html, path).toContain(
        '<title>CloudPrep: free AWS practice exams for CLF-C02, SAA-C03 and DVA-C03</title>',
      );
      expect(html, path).toContain('<div id="root"></div>');
    }
  });
});

test('AC-S.14 a signed-in visitor to a pre-rendered page gets their dashboard, without errors', async ({
  page,
}) => {
  const errors = watchErrors(page);
  await page.goto('/saa-c03');
  await expect(page).toHaveURL(/\/saa-c03\/dashboard$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
  expect(errors).toEqual([]);
});
