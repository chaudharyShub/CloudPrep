import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

/**
 * Link previews need absolute URLs (D-050). On Vercel the production address comes from its
 * system variable; elsewhere the tags fall back to site-relative paths.
 */
function siteUrl(): Plugin {
  const host = process.env['VERCEL_PROJECT_PRODUCTION_URL'];
  const origin = host ? `https://${host}` : '';
  return {
    name: 'cloudprep-site-url',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', origin),
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), siteUrl()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  preview: { port: 4173, strictPort: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Page tests load lazy route chunks and render the whole app in jsdom; with the suite
    // running in parallel on a 4-core machine they routinely take 2-4 s, so the default
    // 5 s limit made random tests time out (D-049). Assertions are unchanged.
    testTimeout: 15_000,
    include: ['src/**/*.test.{ts,tsx}'],
    // Let the token contrast test read the real stylesheet (Vitest blanks other CSS).
    css: { include: [/src\/styles\/index\.css/] },
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx'],
    },
  },
});
