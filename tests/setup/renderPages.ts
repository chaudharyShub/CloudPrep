/**
 * Vitest global setup: renders the pre-rendered pages (D-068) the way the build does, once,
 * in Vitest's main process, and hands the HTML to src/app/prerender.test.tsx.
 *
 * It runs here, not in the test, because React's server renderer leaves context values
 * behind in its own process, which a browser never has: taking the HTML over in the same
 * process would fail for the wrong reason.
 */
import type {} from '../../src/test/providedContext';
import { createServer } from 'vite';
import type { TestProject } from 'vitest/node';
import { PRERENDERED_PATHS, type RenderedPage } from '../../src/app/pageHeads.ts';

export default async function setup(project: TestProject): Promise<void> {
  const server = await createServer({
    mode: project.config.mode,
    logLevel: 'error',
    appType: 'custom',
    server: { middlewareMode: true, hmr: false, ws: false },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { renderPage } = (await server.ssrLoadModule('/src/app/prerender.tsx')) as {
      renderPage: (path: string) => Promise<RenderedPage>;
    };
    const pages: Record<string, RenderedPage> = {};
    for (const path of PRERENDERED_PATHS) pages[path] = await renderPage(path);
    project.provide('prerenderedPages', pages);
  } finally {
    await server.close();
  }
}
