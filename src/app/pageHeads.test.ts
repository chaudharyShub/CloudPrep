import { describe, expect, it } from 'vitest';
import {
  APP_SHELL_FILE,
  PAGE_HEADS,
  PRERENDERED_PATHS,
  pageFileName,
  pageHtml,
  withRenderedRoot,
} from './pageHeads';
import { BLOCKED_PATHS, INDEXED_PATHS } from './seo';

const INDEX_HTML =
  Object.values(
    import.meta.glob<string>('/index.html', { query: '?raw', import: 'default', eager: true }),
  )[0] ?? '';
const VERCEL_JSON =
  Object.values(
    import.meta.glob<string>('/vercel.json', { query: '?raw', import: 'default', eager: true }),
  )[0] ?? '{}';
const ORIGIN = 'https://cloudprep.example';

/** Reads one tag's content attribute (or the <title> text) from a page. */
function tag(html: string, pattern: RegExp): string | undefined {
  return pattern.exec(html)?.[1];
}

describe('Page heads (D-068)', () => {
  it('AC-S.8 every page in the sitemap except the home page gets its own head', () => {
    const paths = PAGE_HEADS.map((page) => page.path);
    expect([...paths].sort()).toEqual(INDEXED_PATHS.filter((path) => path !== '/').sort());
    expect(new Set(paths).size).toBe(paths.length);
    for (const path of paths) {
      expect(
        BLOCKED_PATHS.some((rule) => path.startsWith(rule)),
        path,
      ).toBe(false);
    }
  });

  it('AC-S.8 titles and descriptions are short enough for search results', () => {
    for (const page of PAGE_HEADS) {
      expect(page.title.endsWith(' · CloudPrep'), page.path).toBe(true);
      expect(page.description.length, page.path).toBeLessThanOrEqual(160);
      expect(page.description.length, page.path).toBeGreaterThan(50);
    }
    const descriptions = PAGE_HEADS.map((page) => page.description);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it('AC-S.8 each exam page names its exam', () => {
    const saa = PAGE_HEADS.find((page) => page.path === '/saa-c03');
    expect(saa?.title).toBe('Practice for the AWS Solutions Architect exam · SAA-C03 · CloudPrep');
    expect(saa?.description).toContain('1,000 original questions');
    expect(PAGE_HEADS.find((page) => page.path === '/dva-c03/practice')?.title).toBe(
      'Learning mode · DVA-C03 · CloudPrep',
    );
  });

  it('AC-S.9 a page file is index.html with that page’s title, description and preview tags', () => {
    const page = PAGE_HEADS.find((p) => p.path === '/saa-c03/practice');
    if (!page) throw new Error('missing page');
    const html = pageHtml(INDEX_HTML.replaceAll('%SITE_URL%', ORIGIN), page, ORIGIN);

    expect(tag(html, /<title>([^<]*)<\/title>/)).toBe(page.title);
    expect(tag(html, /<meta name="description" content="([^"]*)"/)).toBe(page.description);
    expect(tag(html, /<meta property="og:title" content="([^"]*)"/)).toBe(page.title);
    expect(tag(html, /<meta property="og:description" content="([^"]*)"/)).toBe(page.description);
    expect(tag(html, /<meta property="og:url" content="([^"]*)"/)).toBe(
      `${ORIGIN}/saa-c03/practice`,
    );
    // The rest is unchanged: the app, the theme script and the shared preview image.
    expect(html).toContain('<div id="root"></div>');
    expect(html).toContain('<script type="module" src="/src/main.tsx"></script>');
    expect(html).toContain("localStorage.getItem('cloudprep-account:owner')");
    expect(html).toContain(`<meta property="og:image" content="${ORIGIN}/og-image.png" />`);
    // The site name data stays on the home page only (D-067).
    expect(html).not.toContain('application/ld+json');
    expect(INDEX_HTML).toContain('application/ld+json');
  });

  it('AC-S.9 text is escaped for HTML', () => {
    const html = pageHtml(
      INDEX_HTML,
      { path: '/x', title: 'A & B "C" <D>', description: 'E & F' },
      '',
    );
    expect(html).toContain('<title>A &amp; B &quot;C&quot; &lt;D&gt;</title>');
    expect(html).toContain('<meta name="description" content="E &amp; F" />');
    expect(html).toContain('<meta property="og:url" content="/x" />');
  });

  it('AC-S.9 the build fails if index.html loses a tag it rewrites', () => {
    const [page] = PAGE_HEADS;
    if (!page) throw new Error('no pages');
    expect(() => pageHtml(INDEX_HTML.replace(/<title>[^<]*<\/title>/, ''), page, '')).toThrow(
      /no <title>/,
    );
  });

  it('AC-S.9 pages are written as folders with an index.html', () => {
    expect(pageFileName('/privacy')).toBe('privacy/index.html');
    expect(pageFileName('/saa-c03/practice')).toBe('saa-c03/practice/index.html');
    expect(pageFileName('/')).toBe('index.html');
  });

  it('AC-S.9 vercel.json sends each page’s address to its file, and the rest to the app page', () => {
    const { rewrites = [] } = JSON.parse(VERCEL_JSON) as {
      rewrites?: { source: string; destination: string }[];
    };
    const fallback = rewrites.findIndex((rule) => rule.destination === `/${APP_SHELL_FILE}`);
    expect(fallback).toBe(rewrites.length - 1);
    expect(rewrites.slice(0, fallback)).toEqual(
      PAGE_HEADS.map((page) => ({
        source: page.path,
        destination: `/${pageFileName(page.path)}`,
      })),
    );
  });
});

describe('Pre-rendered content (D-068)', () => {
  it('AC-S.12 the home page, Privacy and each launched exam’s own page are pre-rendered', () => {
    expect(PRERENDERED_PATHS).toEqual(['/', '/privacy', '/clf-c02', '/saa-c03', '/dva-c03']);
    // Learning mode depends on the question bank and the visitor’s progress.
    expect(PRERENDERED_PATHS.some((path) => path.endsWith('/practice'))).toBe(false);
  });

  it('AC-S.12 the content goes into #root, marked with the exam it was rendered for', () => {
    const html = withRenderedRoot(INDEX_HTML, '<main>Hello</main>', 'saa-c03');
    expect(html).toContain('<div id="root" data-prerendered="saa-c03"><main>Hello</main></div>');
    expect(() => withRenderedRoot(html, 'x', 'clf-c02')).toThrow(/no empty <div id="root">/);
  });
});
