import { test as base } from '@playwright/test';

/** Same key and user as the E2E build's fake sign-in (src/backend/fakeAuth.ts). */
export const E2E_AUTH_KEY = 'cloudprep-e2e-auth';
export const E2E_SIGNED_OUT_KEY = 'cloudprep-e2e-signed-out';
export const E2E_USER = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'learner@example.com',
  name: 'Test Learner',
};

/**
 * Playwright `test` with a signed-in fake user by default. The E2E build (`vite build
 * --mode e2e`) reads the session from localStorage instead of Supabase. Use
 * `test.use({ signedIn: false })` to test as a guest.
 */
export const test = base.extend<{ signedIn: boolean }>({
  signedIn: [true, { option: true }],
  // On the page, not the context: a context-wide init script breaks `clock.install` on pages
  // opened later in WebKit. Later pages share the saved session through localStorage.
  page: async ({ page, signedIn }, provide) => {
    if (signedIn) {
      await page.addInitScript(
        ({ key, signedOutKey, user }) => {
          // Re-seeded on every load (tests often clear localStorage), unless the test signed
          // out in this tab.
          if (window.sessionStorage.getItem(signedOutKey)) return;
          window.localStorage.setItem(key, JSON.stringify(user));
        },
        { key: E2E_AUTH_KEY, signedOutKey: E2E_SIGNED_OUT_KEY, user: E2E_USER },
      );
    }
    await provide(page);
  },
});

export { expect } from '@playwright/test';
