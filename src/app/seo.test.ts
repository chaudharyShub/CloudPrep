import { describe, expect, it } from 'vitest';
import { BLOCKED_PATHS, INDEXED_PATHS, robotsTxt, sitemapXml } from './seo';

const ORIGIN = 'https://cloudprep.example';
const INDEX_HTML =
  Object.values(
    import.meta.glob<string>('/index.html', { query: '?raw', import: 'default', eager: true }),
  )[0] ?? '';
// The build writes these two files; a copy in public/ would clash with it.
const VERCEL_JSON =
  Object.values(
    import.meta.glob<string>('/vercel.json', { query: '?raw', import: 'default', eager: true }),
  )[0] ?? '{}';
const PUBLIC_SEO_FILES = Object.keys(import.meta.glob('/public/{robots.txt,sitemap.xml}'));

describe('Search engine files', () => {
  it('AC-S.1 robots.txt allows the site, blocks private areas and points to the sitemap', () => {
    const robots = robotsTxt(ORIGIN);
    expect(robots).toMatch(/^User-agent: \*\nAllow: \/\n/);
    for (const path of ['/admin', '/dashboard', '/exam', '/auth/']) {
      expect(robots).toContain(`Disallow: ${path}\n`);
    }
    expect(robots).toContain(`Sitemap: ${ORIGIN}/sitemap.xml\n`);
  });

  it('AC-S.1 robots.txt leaves out the sitemap line when the address is unknown', () => {
    expect(robotsTxt('')).not.toContain('Sitemap:');
  });

  it('AC-S.2 the sitemap lists only the public pages, with absolute addresses', () => {
    const xml = sitemapXml(ORIGIN);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    expect(locs).toEqual(INDEXED_PATHS.map((path) => `${ORIGIN}${path}`));
  });

  it('AC-S.2 no listed page is also blocked', () => {
    for (const path of INDEXED_PATHS) {
      if (path === '/') continue;
      expect(BLOCKED_PATHS.some((blocked) => path.startsWith(blocked))).toBe(false);
    }
  });

  it('AC-S.3 the page title and description name the exam before the app loads', () => {
    const title = /<title>([^<]+)<\/title>/.exec(INDEX_HTML)?.[1] ?? '';
    expect(title).toContain('AWS Cloud Practitioner');
    expect(title).toContain('CLF-C02');
    expect(INDEX_HTML).toMatch(/<meta\s+name="description"\s+content="[^"]*CLF-C02[^"]*"/);
  });

  it('AC-S.1 robots.txt and sitemap.xml come only from the build, not public/', () => {
    expect(PUBLIC_SEO_FILES).toEqual([]);
  });

  it('AC-S.4 Vercel redirects addresses with a trailing slash to the form without it', () => {
    const config = JSON.parse(VERCEL_JSON) as { trailingSlash?: unknown };
    expect(config.trailingSlash).toBe(false);
    for (const path of INDEXED_PATHS) {
      if (path !== '/') expect(path.endsWith('/')).toBe(false);
    }
  });
});
