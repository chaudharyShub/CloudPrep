/** Control characters (e.g. a newline) are never part of a real path. */
function hasControlCharacter(value: string): boolean {
  for (let i = 0; i < value.length; i++) if (value.charCodeAt(i) < 32) return true;
  return false;
}

/** Where people land after signing in when no other page was requested. */
export const DEFAULT_AFTER_SIGN_IN = '/dashboard';

/**
 * Returns `next` if it is a path on this site, otherwise the dashboard. Stops sign-in links
 * from sending people to another site (open redirect).
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) {
    return DEFAULT_AFTER_SIGN_IN;
  }
  if (hasControlCharacter(next)) return DEFAULT_AFTER_SIGN_IN;
  // Never return to the sign-in pages themselves.
  if (next.startsWith('/sign-in') || next.startsWith('/auth/')) return DEFAULT_AFTER_SIGN_IN;
  return next;
}

/** The URL that sign-in links and Google return to. */
export function callbackUrl(origin: string, next: string): string {
  return `${origin}/auth/callback?next=${encodeURIComponent(safeNextPath(next))}`;
}

export function signInPath(next: string): string {
  const safe = safeNextPath(next);
  return safe === DEFAULT_AFTER_SIGN_IN ? '/sign-in' : `/sign-in?next=${encodeURIComponent(safe)}`;
}

/**
 * The error a failed sign-in link or Google sign-in reports in the callback URL
 * (`?error_description=…` or `#error_description=…`), if any.
 */
export function callbackError(search: string, hash: string): string | null {
  for (const source of [search, hash.replace(/^#/, '')]) {
    const params = new URLSearchParams(source);
    const description = params.get('error_description') ?? params.get('error');
    if (description) return description.replace(/\+/g, ' ');
  }
  return null;
}
