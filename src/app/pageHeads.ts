/**
 * Each public page's own HTML head (D-068). The site is a single-page app, so every address
 * gets the same index.html, and tools that don't run JavaScript (link previews, Google's
 * first look) see one title and description for all pages. The build writes a copy of
 * index.html for each public page with that page's title, description and link-preview tags;
 * the body is unchanged, so the app starts exactly as before.
 *
 * Pure functions with no React, so the build (vite.config.ts) and the tests can both use them.
 */

import { EXAMS } from '../domain/exam-guide/index.ts';
import type { ExamGuide } from '../domain/exam-guide/types.ts';
import { landingContent } from '../features/landing/landingContent.ts';
import { formatDocumentTitle } from '../lib/documentTitle.ts';

/** A page rendered by the build (src/app/prerender.tsx). */
export interface RenderedPage {
  /** The HTML that goes inside `#root`. */
  readonly html: string;
  /** The exam the page was rendered for, written on `#root` (see hydration.ts). */
  readonly exam: string;
}

export interface PageHead {
  /** The address, e.g. "/saa-c03/practice". */
  readonly path: string;
  /** The tab title, the same one the app sets once it loads. */
  readonly title: string;
  /** For search results and link previews: 160 characters or fewer, or Google cuts it off. */
  readonly description: string;
}

function examPages(exam: ExamGuide): PageHead[] {
  const questions = landingContent(exam.id).bankSize;
  const bank = questions ? `${questions} original questions` : 'original questions';
  return [
    {
      path: `/${exam.id}`,
      // LandingPage.tsx sets this title; ExamScope adds the exam's code.
      title: formatDocumentTitle(`Practice for the AWS ${exam.shortName} exam`, exam.code),
      description:
        `Free, unofficial practice for the ${exam.name} (${exam.code}) exam: ${bank}, ` +
        'timed mock exams, progress tracking.',
    },
    {
      path: `/${exam.id}/practice`,
      // PracticePage.tsx's PageHeader title.
      title: formatDocumentTitle('Learning mode', exam.code),
      description:
        `Practise for the AWS ${exam.shortName} (${exam.code}) exam by domain, with an ` +
        `explanation for every option. Free, no sign-in needed.`,
    },
  ];
}

/**
 * The public pages that get their own head: every page in the sitemap except "/", which
 * keeps index.html as it is. Unlaunched exams are left out, as in the sitemap.
 */
export const PAGE_HEADS: readonly PageHead[] = [
  {
    path: '/privacy',
    title: formatDocumentTitle('Privacy'),
    description:
      'What CloudPrep stores, where it keeps it, and what strict practice and the AI proctor ' +
      'monitor. Your answers and progress are never sold or shared.',
  },
  ...EXAMS.filter((exam) => exam.launched).flatMap(examPages),
];

/** Where the build writes a page: "/saa-c03/practice" → "saa-c03/practice/index.html". */
export function pageFileName(path: string): string {
  return path === '/' ? 'index.html' : `${path.replace(/^\//, '')}/index.html`;
}

/**
 * The single-page-app fallback: index.html as Vite builds it, with nothing in `#root`, for
 * every address that isn't a public page (D-068). index.html itself becomes the home page.
 */
export const APP_SHELL_FILE = 'spa.html';

/**
 * Pages whose content the build also writes into `#root` (D-068): the home page, Privacy and
 * each launched exam's own page. They look the same for every first-time guest. Learning mode
 * is left out: it shows the question bank and the visitor's progress, which load in the
 * browser, so its HTML would never match what the browser draws.
 */
export const PRERENDERED_PATHS: readonly string[] = [
  '/',
  '/privacy',
  ...EXAMS.filter((exam) => exam.launched).map((exam) => `/${exam.id}`),
];

/** A page's file with its rendered content in `#root`, marked with the exam it used. */
export function withRenderedRoot(html: string, content: string, exam: string): string {
  return replaceOnce(
    html,
    /<div id="root"><\/div>/,
    `<div id="root" data-prerendered="${escapeHtml(exam)}">${content}</div>`,
    'empty <div id="root">',
  );
}

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

/** Replaces one tag, and fails the build if index.html no longer has it. */
function replaceOnce(html: string, pattern: RegExp, replacement: string, what: string): string {
  if (!pattern.test(html)) throw new Error(`index.html has no ${what}; update pageHeads.ts.`);
  return html.replace(pattern, () => replacement);
}

/**
 * index.html (as built, with the site address filled in) rewritten for one page. `origin` is
 * the live address, or '' for local builds (the same rule as the other link-preview tags).
 */
export function pageHtml(indexHtml: string, page: PageHead, origin: string): string {
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  let html = indexHtml;
  html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${title}</title>`, '<title>');
  html = replaceOnce(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${description}" />`,
    'description',
  );
  html = replaceOnce(
    html,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${title}" />`,
    'og:title',
  );
  html = replaceOnce(
    html,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${description}" />`,
    'og:description',
  );
  html = replaceOnce(
    html,
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${origin}${page.path}" />`,
    'og:url',
  );
  // The site name data (D-067) belongs on the home page only.
  html = replaceOnce(
    html,
    /\s*<!--[^>]*\(D-067\)[^>]*-->\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    '',
    'site name data',
  );
  return html;
}
