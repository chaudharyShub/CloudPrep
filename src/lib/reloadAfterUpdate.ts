/**
 * Reload once when a page's file is missing because CloudPrep was redeployed (D-053).
 *
 * Each deploy gives the page files new names and removes the old ones. A tab opened before
 * the deploy still asks for the old names, so moving to a page it hasn't loaded yet fails.
 * Reloading fetches the new version. A short guard in sessionStorage allows one reload at a
 * time, so a real outage (offline, files really missing) shows the error page instead of a loop.
 */

export const RELOAD_GUARD_KEY = 'cloudprep-reload-after-update';
/** A second failure within this time after a reload shows the error page instead. */
export const RELOAD_GUARD_MS = 30_000;

/** Browser messages for a module script that failed to load (Chromium, Firefox, WebKit, Vite). */
const STALE_ASSET_MESSAGES = [
  'failed to fetch dynamically imported module',
  'error loading dynamically imported module',
  'importing a module script failed',
  'unable to preload css',
];

export function isStaleAssetError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return STALE_ASSET_MESSAGES.some((text) => message.includes(text));
}

type GuardStorage = Pick<Storage, 'getItem' | 'setItem'>;

/** Replaced in tests: jsdom can't reload. */
export const pageReloader = {
  reload: (): void => {
    window.location.reload();
  },
};

let reloading = false;
/** The page is navigating away. WebKit then fails the files still loading; that's no update. */
let leaving = false;

/** Tests only. */
export function resetReloadForUpdate(): void {
  reloading = false;
  leaving = false;
}

function sessionStore(): GuardStorage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/**
 * Reloads the page unless it already reloaded for this reason within `RELOAD_GUARD_MS`.
 * Returns whether a reload is under way (started now or earlier). Without sessionStorage it never reloads, because
 * it couldn't tell a second failure from the first.
 */
export function reloadOnce(
  storage: GuardStorage | null = sessionStore(),
  now: number = Date.now(),
): boolean {
  if (reloading) return true;
  if (leaving || !storage) return false;
  try {
    const last = Number(storage.getItem(RELOAD_GUARD_KEY));
    if (Number.isFinite(last) && last > 0 && now - last >= 0 && now - last < RELOAD_GUARD_MS) {
      return false;
    }
    storage.setItem(RELOAD_GUARD_KEY, String(now));
  } catch {
    return false;
  }
  reloading = true;
  pageReloader.reload();
  return true;
}

/**
 * Vite fires `vite:preloadError` when a lazily loaded file fails, including files loaded
 * outside the routes (the Supabase library, the AI proctor). The error still goes on as
 * usual (cancelling it would hand the caller an empty module); the route's error page
 * shows "loading the latest version" while the reload runs.
 */
export function installReloadAfterUpdate(target: Window = window): void {
  target.addEventListener('vite:preloadError', () => {
    reloadOnce();
  });
  target.addEventListener('beforeunload', () => {
    leaving = true;
  });
  target.addEventListener('pagehide', () => {
    leaving = true;
  });
  // Back in view from the browser's back/forward cache.
  target.addEventListener('pageshow', () => {
    leaving = false;
  });
}
