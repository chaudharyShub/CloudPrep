import { describe, expect, it } from 'vitest';
import { BLOCKED_PATHS, INDEXED_PATHS, robotsTxt, SITE_ORIGIN, sitemapXml } from './seo';
import { EXAMS } from '@/domain/exam-guide';

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
const README =
  Object.values(
    import.meta.glob<string>('/README.md', { query: '?raw', import: 'default', eager: true }),
  )[0] ?? '';
const PUBLIC_SEO_FILES = Object.keys(import.meta.glob('/public/{robots.txt,sitemap.xml}'));

/** robots.txt matching: a `Disallow` rule is a path prefix in which `*` matches anything. */
function isBlocked(path: string): boolean {
  return BLOCKED_PATHS.some((rule) =>
    new RegExp(`^${rule.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}`).test(path),
  );
}

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
      expect(isBlocked(path), path).toBe(false);
    }
  });

  it('AC-M.10 lists each launched exam’s own page and Learning mode, and no other exam', () => {
    expect(INDEXED_PATHS).toEqual(
      expect.arrayContaining([
        '/',
        '/privacy',
        '/clf-c02',
        '/clf-c02/practice',
        '/saa-c03',
        '/saa-c03/practice',
        '/dva-c03',
        '/dva-c03/practice',
      ]),
    );
    const launched = EXAMS.filter((exam) => exam.launched).map((exam) => exam.id);
    for (const path of INDEXED_PATHS) {
      const examId = path.split('/')[1];
      if (path === '/' || path === '/privacy') continue;
      expect(launched, path).toContain(examId);
    }
  });

  it('AC-M.10 blocks signed-in and flow pages under every exam and at their old addresses', () => {
    for (const path of [
      '/clf-c02/dashboard',
      '/saa-c03/exam',
      '/dva-c03/exam/session',
      '/clf-c02/results/abc',
      '/saa-c03/practice/session',
      '/dashboard',
      '/practice/session',
    ]) {
      expect(isBlocked(path), path).toBe(true);
    }
    expect(robotsTxt(ORIGIN)).toContain('Disallow: /*/exam\n');
  });

  it('AC-S.3 the page title and description name the exams before the app loads', () => {
    const title = /<title>([^<]+)<\/title>/.exec(INDEX_HTML)?.[1] ?? '';
    const description =
      /<meta\s+name="description"\s+content="([^"]*)"/.exec(INDEX_HTML)?.[1] ?? '';
    for (const exam of EXAMS.filter((e) => e.launched)) {
      expect(title).toContain(exam.code);
      expect(description).toContain(exam.code);
    }
    expect(description).toContain('Cloud Practitioner');
  });

  it('AC-S.7 the home page gives Google the site name as WebSite structured data', () => {
    const json = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(INDEX_HTML)?.[1];
    expect(json).toBeDefined();
    const data = JSON.parse(json ?? '{}') as Record<string, unknown>;
    expect(data).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'CloudPrep',
      url: '%SITE_URL%/',
    });
    expect(INDEX_HTML).toContain('<meta property="og:site_name" content="CloudPrep" />');
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

  it('AC-S.5 the live address is the new one, absolute and without a trailing slash', () => {
    expect(SITE_ORIGIN).toBe('https://aws-cloud-prepare.vercel.app');
    expect(sitemapXml(SITE_ORIGIN)).toContain('<loc>https://aws-cloud-prepare.vercel.app/</loc>');
    expect(README).toContain(`(${SITE_ORIGIN}/)`);
    expect(README).not.toContain('cloud-prep-aws.vercel.app');
  });
});
