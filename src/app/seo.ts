/**
 * Search engine files (D-063), written into the production build by vite.config.ts.
 * Pure functions with no React, so the build and the tests can both use them.
 */

/** Public pages worth listing in search results. Everything else needs sign-in or is a flow. */
export const INDEXED_PATHS = ['/', '/practice', '/privacy'] as const;

/** Pages search engines shouldn't crawl: signed-in areas, sign-in flow, exam and admin screens. */
export const BLOCKED_PATHS = [
  '/admin',
  '/auth/',
  '/sign-in',
  '/dashboard',
  '/exam',
  '/results/',
  '/progress',
  '/history',
  '/settings',
  '/bookmarks',
  '/practice/session',
] as const;

/**
 * robots.txt. `origin` is the production address (for example https://example.vercel.app);
 * without one (local builds) the sitemap line is left out, because it must be absolute.
 */
export function robotsTxt(origin: string): string {
  const lines = ['User-agent: *', 'Allow: /', ...BLOCKED_PATHS.map((path) => `Disallow: ${path}`)];
  if (origin) lines.push('', `Sitemap: ${origin}/sitemap.xml`);
  return `${lines.join('\n')}\n`;
}

/** sitemap.xml listing INDEXED_PATHS under `origin` (which must be absolute). */
export function sitemapXml(origin: string): string {
  const urls = INDEXED_PATHS.map((path) => `  <url><loc>${origin}${path}</loc></url>`);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}
