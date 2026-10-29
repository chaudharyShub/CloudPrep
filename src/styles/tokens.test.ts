import { describe, expect, it } from 'vitest';

// The raw stylesheet text (a plain `import './index.css'` gives an empty module in Vitest).
const css = Object.values(
  import.meta.glob<string>('./index.css', { query: '?raw', import: 'default', eager: true }),
).join('');

/** Reads the --cp-* hex values declared in the block that starts with `selector`. */
function themeTokens(selector: string): Record<string, string> {
  const start = css.indexOf(selector);
  if (start < 0) throw new Error(`No ${selector} block in index.css`);
  const block = css.slice(start, css.indexOf('}', start));
  const tokens: Record<string, string> = {};
  for (const match of block.matchAll(/--cp-([\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)) {
    const [, name, value] = match;
    if (name && value) tokens[name] = value;
  }
  return tokens;
}

function luminance(hex: string): number {
  const channel = (offset: number) => {
    const c = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const THEMES = {
  dark: themeTokens("[data-theme='dark'] {"),
  light: themeTokens("[data-theme='light'] {"),
};

const SURFACES = ['bg', 'surface', 'surface-2'] as const;
const TEXT = [
  'fg',
  'fg-muted',
  'fg-subtle',
  'accent',
  'accent-fg',
  'success',
  'warning',
  'danger',
  'info',
] as const;
const ON_FILLS = [
  ['on-accent', 'accent'],
  ['on-highlight', 'highlight'],
  ['on-highlight', 'highlight-hover'],
  ['on-primary', 'primary'],
  ['on-primary', 'primary-hover'],
  ['on-danger', 'danger'],
  ['on-flag', 'flag'],
] as const;
// Non-text UI parts need 3:1 against what they sit on (WCAG 1.4.11).
const UI_PARTS = [
  ['border-control', 'surface'],
  ['border-control', 'surface-2'],
  ['meter', 'surface-3'],
  ['focus', 'bg'],
  ['focus', 'surface'],
  ['ink', 'surface'],
  ['flag-border', 'surface'],
] as const;

describe.each(Object.entries(THEMES))('AC-V.1 %s theme contrast', (_theme, tokens) => {
  const value = (name: string) => {
    const hex = tokens[name];
    if (!hex) throw new Error(`Missing --cp-${name}`);
    return hex;
  };

  it.each(TEXT.flatMap((text) => SURFACES.map((surface) => [text, surface] as const)))(
    '%s text on %s is at least 4.5:1',
    (text, surface) => {
      expect(contrast(value(text), value(surface))).toBeGreaterThanOrEqual(4.5);
    },
  );

  it.each(ON_FILLS)('%s on %s is at least 4.5:1', (text, fill) => {
    expect(contrast(value(text), value(fill))).toBeGreaterThanOrEqual(4.5);
  });

  it.each(UI_PARTS)('%s against %s is at least 3:1', (part, surface) => {
    expect(contrast(value(part), value(surface))).toBeGreaterThanOrEqual(3);
  });
});
