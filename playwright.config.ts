import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, grepInvert: /@real-models/ },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, grepInvert: /@real-models/ },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, grepInvert: /@real-models/ },
    // The real AI models use a lot of CPU, which slows parallel tests down, so they run
    // last, on their own.
    {
      name: 'real-models',
      use: { ...devices['Desktop Chrome'] },
      grep: /@real-models/,
      dependencies: ['chromium', 'webkit', 'mobile'],
    },
  ],
  // Tests run against a production build made in `e2e` mode (fake sign-in instead of
  // Supabase, see tests/e2e/support/fixtures.ts), served by `vite preview`.
  webServer: {
    command: 'npm run build:e2e && npm run preview:e2e',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env['CI'],
    timeout: 180_000,
  },
});
