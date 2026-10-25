// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { LOGO_CLOUD_PATH, LOGO_TRACES_PATH } from '@/components/brand/logoPaths';

// Text files read through Vite (the app's TypeScript has no Node types), and the files in
// public/.
const TEXT = import.meta.glob<string>(
  [
    '/index.html',
    '/public/favicon.svg',
    '/public/manifest.webmanifest',
    '/scripts/generate-brand-assets.mjs',
  ],
  { query: '?raw', import: 'default', eager: true },
);
const PUBLIC = new Set(
  Object.keys(import.meta.glob('/public/*.{png,svg,webmanifest}')).map((path) =>
    path.slice('/public'.length),
  ),
);
const read = (path: string) => TEXT[`/${path}`] ?? '';
const inPublic = (href: string) => PUBLIC.has(href);

describe('brand assets (D-050)', () => {
  it('the favicon and the icon script draw the same logo as the app', () => {
    // The favicon is the small form (cloud and dots); the icon script draws the full mark.
    expect(read('public/favicon.svg')).toContain(LOGO_CLOUD_PATH);
    const script = read('scripts/generate-brand-assets.mjs');
    expect(script).toContain(LOGO_CLOUD_PATH);
    expect(script).toContain(LOGO_TRACES_PATH);
  });

  it('index.html links an icon, a manifest and a link preview that all exist', () => {
    const html = read('index.html');
    const hrefs = [
      ...html.matchAll(/<link rel="(?:icon|apple-touch-icon|manifest)"[^>]*href="([^"]+)"/g),
    ].map((m) => m[1] ?? '');
    expect(hrefs).toEqual(['/favicon.svg', '/apple-touch-icon.png', '/manifest.webmanifest']);
    for (const href of hrefs) expect(inPublic(href)).toBe(true);
    expect(html).toContain('<meta property="og:image" content="%SITE_URL%/og-image.png" />');
    expect(inPublic('/og-image.png')).toBe(true);
  });

  it('the manifest names the app and lists icons that exist, including a maskable one', () => {
    const manifest = JSON.parse(read('public/manifest.webmanifest')) as {
      short_name: string;
      start_url: string;
      icons: { src: string; sizes: string; purpose?: string }[];
    };
    expect(manifest.short_name).toBe('CloudPrep');
    expect(manifest.start_url).toBe('/');
    expect(manifest.icons.map((icon) => icon.sizes)).toEqual(['192x192', '512x512', '512x512']);
    expect(manifest.icons.some((icon) => icon.purpose === 'maskable')).toBe(true);
    for (const icon of manifest.icons) expect(inPublic(icon.src)).toBe(true);
  });
});
