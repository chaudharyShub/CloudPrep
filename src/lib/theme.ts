/** Themes the page can actually render. */
export const THEMES = ['dark', 'light'] as const;
export type Theme = (typeof THEMES)[number];

/** What the learner can choose: a theme, or follow the operating system. */
export const THEME_PREFERENCES = ['dark', 'light', 'system'] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

export const DEFAULT_THEME: Theme = 'dark';

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (THEME_PREFERENCES as readonly string[]).includes(value);
}

/** Resolves a preference to a concrete theme. */
export function resolveTheme(preference: ThemePreference, systemPrefersLight: boolean): Theme {
  if (preference === 'system') return systemPrefersLight ? 'light' : 'dark';
  return preference;
}

export function systemPrefersLight(): boolean {
  return typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: light)').matches
    : false;
}

/** Reads the theme currently applied to <html>. */
export function getAppliedTheme(root: HTMLElement = document.documentElement): Theme {
  const value = root.dataset['theme'];
  return isTheme(value) ? value : DEFAULT_THEME;
}

/** Applies a theme by setting `data-theme` on <html>; all colours follow from CSS tokens. */
export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
  root.dataset['theme'] = theme;
}

export const MOTION_PREFERENCES = ['system', 'reduce'] as const;
export type MotionPreference = (typeof MOTION_PREFERENCES)[number];

/** `reduce` forces reduced motion; `system` follows the OS setting via CSS media queries. */
export function applyMotion(
  preference: MotionPreference,
  root: HTMLElement = document.documentElement,
): void {
  if (preference === 'reduce') root.dataset['motion'] = 'reduce';
  else delete root.dataset['motion'];
}
