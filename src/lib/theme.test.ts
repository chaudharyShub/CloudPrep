import { describe, expect, it } from 'vitest';
import { formatDocumentTitle } from '@/hooks/useDocumentTitle';
import { applyTheme, getAppliedTheme, isTheme } from './theme';

describe('theme', () => {
  it('validates theme names', () => {
    expect(isTheme('dark')).toBe(true);
    expect(isTheme('light')).toBe(true);
    expect(isTheme('blue')).toBe(false);
    expect(isTheme(undefined)).toBe(false);
  });

  it('applies and reads the theme from the root element', () => {
    const root = document.createElement('html');
    expect(getAppliedTheme(root)).toBe('dark');
    applyTheme('light', root);
    expect(root.dataset['theme']).toBe('light');
    expect(getAppliedTheme(root)).toBe('light');
  });

  it('falls back to dark for unknown values', () => {
    const root = document.createElement('html');
    root.dataset['theme'] = 'sepia';
    expect(getAppliedTheme(root)).toBe('dark');
  });
});

describe('formatDocumentTitle', () => {
  it('suffixes the app name', () => {
    expect(formatDocumentTitle('Settings')).toBe('Settings · CloudPrep');
    expect(formatDocumentTitle('')).toBe('CloudPrep');
  });
});
