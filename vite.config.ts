import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { createServer, type Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import {
  APP_SHELL_FILE,
  PAGE_HEADS,
  PRERENDERED_PATHS,
  pageFileName,
  pageHtml,
  withRenderedRoot,
} from './src/app/pageHeads.ts';
import { robotsTxt, SITE_ORIGIN, sitemapXml } from './src/app/seo.ts';

/**
 * Link previews need absolute URLs (D-050). Builds on Vercel use the live address (SITE_ORIGIN,
 * D-064); elsewhere the tags fall back to site-relative paths. The same address goes into
 * robots.txt and sitemap.xml (D-063).
 */
function siteUrl(): Plugin {
  const origin = process.env['VERCEL'] ? SITE_ORIGIN : '';
  return {
    name: 'cloudprep-site-url',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', origin),
    // Search engine files (D-063). The sitemap needs absolute addresses, so local builds skip it.
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt(origin) });
      if (origin) {
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml(origin) });
      }
    },
  };
}

/**
 * Public pages written by the build (D-068):
 * - A copy of the built index.html for each public page, with that page's title, description
 *   and link-preview tags (PAGE_HEADS).
 * - The home page, Privacy and each exam's own page also get their content in `#root`,
 *   rendered by React in Node as a first-time guest sees it (PRERENDERED_PATHS,
 *   src/app/prerender.tsx); the browser takes it over (src/main.tsx).
 * - spa.html: index.html with an empty `#root`, for every other address.
 * vercel.json rewrites each page's address to its file (/saa-c03 → saa-c03/index.html) and
 * everything else to spa.html. `vite preview` does the same, so E2E tests see what Vercel
 * serves.
 */
function publicPages(): Plugin {
  const origin = process.env['VERCEL'] ? SITE_ORIGIN : '';
  const pagePaths = new Set(PAGE_HEADS.map((page) => page.path));
  let mode = 'production';
  let configFile: string | false = false;
  return {
    name: 'cloudprep-public-pages',
    configResolved(config) {
      mode = config.mode;
      configFile = config.configFile ?? false;
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        const [path = '', query] = (req.url ?? '').split('?');
        const search = query === undefined ? '' : `?${query}`;
        if (pagePaths.has(path)) {
          req.url = `/${pageFileName(path)}${search}`;
        } else if (path !== '/' && !path.includes('.')) {
          req.url = `/${APP_SHELL_FILE}${search}`;
        }
        next();
      });
    },
    generateBundle: {
      // After Vite has written index.html into the bundle (asset links and %SITE_URL% filled in).
      order: 'post',
      handler(_options, bundle) {
        const index = bundle['index.html'];
        if (index?.type !== 'asset' || typeof index.source !== 'string') {
          this.error('index.html is missing from the build.');
        }
        this.emitFile({ type: 'asset', fileName: APP_SHELL_FILE, source: index.source });
        for (const page of PAGE_HEADS) {
          this.emitFile({
            type: 'asset',
            fileName: pageFileName(page.path),
            source: pageHtml(index.source, page, origin),
          });
        }
      },
    },
    async writeBundle(options) {
      const outDir = options.dir;
      if (!outDir) this.error('The build has no output folder.');
      // A Vite instance in Node loads the app's code the way the browser build does (aliases,
      // TypeScript, JSX), so the page renders with the same modules.
      const server = await createServer({
        configFile,
        mode,
        logLevel: 'error',
        appType: 'custom',
        server: { middlewareMode: true, hmr: false, ws: false },
        optimizeDeps: { noDiscovery: true, include: [] },
      });
      try {
        const { renderPage } = (await server.ssrLoadModule('/src/app/prerender.tsx')) as {
          renderPage: (path: string) => Promise<{ html: string; exam: string }>;
        };
        for (const path of PRERENDERED_PATHS) {
          const file = join(outDir, pageFileName(path));
          const page = await renderPage(path);
          const html = await readFile(file, 'utf8');
          await writeFile(file, withRenderedRoot(html, page.html, page.exam));
        }
      } finally {
        await server.close();
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), siteUrl(), publicPages()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  preview: { port: 4173, strictPort: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Renders the pre-rendered pages once for src/app/prerender.test.tsx (D-068).
    globalSetup: ['./tests/setup/renderPages.ts'],
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
