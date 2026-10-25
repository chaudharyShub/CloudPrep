// Draws CloudPrep's icons and link-preview image into public/ (D-050). Run after changing the
// logo: `npm run brand:assets`. Uses the Chromium that Playwright installs for the E2E tests.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = (name) => `${root}public/${name}`;

// Same paths as src/components/brand/logoPaths.ts (48-unit grid).
const CLOUD = 'M13.5 38h21a8.4 8.4 0 0 0 1.4-16.7A12 12 0 0 0 13.6 19.6a9.2 9.2 0 0 0-.1 18.4Z';
const TRACES = 'M24 27.4V19.2l5-5.2M16.5 27.4v3.1l3 3V38M31.5 27.4v3.1l-3 3V38';
const NODES = [
  [16.5, 24.9],
  [31.5, 24.9],
  [24, 29.9],
];
// Dark theme tokens (src/styles/index.css). Icons are the mark in dark on the accent tile.
const BG = '#0b0d10';
const ACCENT = '#4c8dff';
const MARK = '#0b0d10';
const FG = '#e6e9ee';
const MUTED = '#a3abb8';

const mark = (size) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" stroke="${MARK}" stroke-linecap="round" stroke-linejoin="round"><path d="${CLOUD}" stroke-width="3.4"/><path d="${TRACES}" stroke-width="2.4"/>${NODES.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${MARK}" stroke="none"/>`).join('')}</svg>`;

const inter = readFileSync(
  `${root}node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2`,
).toString('base64');
const page = (body, width, height, background = 'transparent') => `<!doctype html>
<html><head><style>
@font-face { font-family: Inter; src: url(data:font/woff2;base64,${inter}) format('woff2'); font-weight: 100 900; }
html, body { margin: 0; width: ${width}px; height: ${height}px; background: ${background}; overflow: hidden; }
body { font-family: Inter, system-ui, sans-serif; }
</style></head><body>${body}</body></html>`;

/** A square icon: the mark on a tile; `fullBleed` fills the square (iOS and maskable icons). */
const icon = (size, { fullBleed = false, markScale = 0.86 } = {}) => {
  const radius = fullBleed ? 0 : Math.round(size * 0.22);
  return page(
    `<div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;background:${ACCENT};border-radius:${radius}px">${mark(Math.round(size * markScale))}</div>`,
    size,
    size,
    fullBleed ? ACCENT : 'transparent',
  );
};

const og = page(
  `<div style="width:1200px;height:630px;box-sizing:border-box;padding:96px;display:flex;flex-direction:column;justify-content:center;gap:40px;background:${BG};color:${FG}">
    <div style="display:flex;align-items:center;gap:28px">
      <div style="width:128px;height:128px;display:flex;align-items:center;justify-content:center;background:${ACCENT};border-radius:30px">${mark(116)}</div>
      <div style="font-size:84px;font-weight:700;letter-spacing:-0.03em">CloudPrep</div>
    </div>
    <div style="font-size:40px;line-height:1.3;font-weight:500;max-width:960px">Practice for the AWS Certified Cloud Practitioner (CLF-C02) exam</div>
    <div style="font-size:26px;color:${MUTED}">Learning mode · timed mock exams · progress tracking · Unofficial practice tool</div>
  </div>`,
  1200,
  630,
  BG,
);

const ASSETS = [
  {
    file: 'apple-touch-icon.png',
    html: icon(180, { fullBleed: true, markScale: 0.8 }),
    w: 180,
    h: 180,
  },
  { file: 'icon-192.png', html: icon(192), w: 192, h: 192 },
  { file: 'icon-512.png', html: icon(512), w: 512, h: 512 },
  // Maskable: launchers crop to a circle or squircle, so the mark stays inside the safe zone.
  {
    file: 'icon-maskable-512.png',
    html: icon(512, { fullBleed: true, markScale: 0.66 }),
    w: 512,
    h: 512,
  },
  { file: 'og-image.png', html: og, w: 1200, h: 630 },
];

const browser = await chromium.launch();
try {
  for (const asset of ASSETS) {
    const tab = await browser.newPage({ viewport: { width: asset.w, height: asset.h } });
    await tab.setContent(asset.html);
    await tab.evaluate(() => document.fonts.ready);
    writeFileSync(out(asset.file), await tab.screenshot({ omitBackground: true }));
    await tab.close();
    console.log(`public/${asset.file}`);
  }
} finally {
  await browser.close();
}
