/**
 * Search engine files (D-063), written into the production build by vite.config.ts.
 * Pure functions with no React, so the build and the tests can both use them.
 */

import { EXAMS } from '../domain/exam-guide/index.ts';

/**
 * The live address (D-064). Set by hand: Vercel's own production-address variable picks the
 * project's shortest domain, which is the old address that now redirects here.
 */
export const SITE_ORIGIN = 'https://aws-cloud-prepare.vercel.app';

/** Exams the live site offers (D-066); unlaunched exams stay out of search results. */
const LAUNCHED_EXAM_IDS = EXAMS.filter((exam) => exam.launched).map((exam) => exam.id);

/**
 * Public pages worth listing in search results: the front page, privacy, and each launched
 * exam's own page and Learning mode (D-066). Everything else needs sign-in or is a flow.
 */
export const INDEXED_PATHS: readonly string[] = [
  '/',
  '/privacy',
  ...LAUNCHED_EXAM_IDS.flatMap((id) => [`/${id}`, `/${id}/practice`]),
];

/** Exam pages (under any exam id) that need sign-in or are part of a flow. */
const EXAM_BLOCKED_PAGES = [
  '/dashboard',
  '/exam',
  '/results/',
  '/progress',
  '/history',
  '/bookmarks',
  '/practice/session',
] as const;

/**
 * Pages search engines shouldn't crawl: signed-in areas, sign-in flow, exam and admin
 * screens. Exam pages are blocked under every exam id (a `*` wildcard for the id) and at
 * their old addresses from before D-066, which now redirect.
 */
export const BLOCKED_PATHS: readonly string[] = [
  '/admin',
  '/auth/',
  '/sign-in',
  '/settings',
  ...EXAM_BLOCKED_PAGES,
  ...EXAM_BLOCKED_PAGES.map((page) => `/*${page}`),
];

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
