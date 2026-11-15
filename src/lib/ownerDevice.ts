import { createLocalStorageDriver, type StorageDriver } from '@/storage/driver';

/**
 * Keeps the site owner's own visits out of Vercel Analytics and Speed Insights (D-073), the same
 * way on every Shubham Works site (`docs/SHUBHAM_WORKS.md`).
 *
 * Opening the site with the owner's secret token after `#` marks that browser as the owner's;
 * adding `.on` undoes it. Only the token's SHA-256 is here, and the browser keeps the token
 * itself (checked on every visit), so a hand-made storage value doesn't count. The part after
 * `#` never reaches a server.
 */
export const OWNER_TOKEN_SHA256 =
  '00ad41f213985ec4c69bf6fd3eb60c220399829190ca21e5c4001ddfc9dbe05b';
export const OWNER_DEVICE_KEY = 'cloudprep-owner-device';
const TURN_ON_SUFFIX = '.on';

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function matchesToken(token: string, hash: string): Promise<boolean> {
  return token.length > 0 && (await sha256Hex(token)) === hash;
}

let pending: Promise<boolean> | null = null;

/**
 * True when this browser belongs to the owner. Handles the secret link first, if present.
 * Checks running at the same time share one result, so the link is handled once.
 * Throws when it can't tell (no `crypto.subtle`, storage blocked); callers count the visit.
 */
export function isOwnerDevice(
  hash: string = OWNER_TOKEN_SHA256,
  storage: StorageDriver | null = createLocalStorageDriver(),
): Promise<boolean> {
  pending ??= checkDevice(hash, storage).finally(() => {
    pending = null;
  });
  return pending;
}

async function checkDevice(hash: string, storage: StorageDriver | null): Promise<boolean> {
  if (!storage) throw new Error('No storage: the browser counts as a visitor.');
  const fromLink = decodeURIComponent(window.location.hash.slice(1));
  if (fromLink) {
    const turnOn = fromLink.endsWith(TURN_ON_SUFFIX);
    const token = turnOn ? fromLink.slice(0, -TURN_ON_SUFFIX.length) : fromLink;
    if (await matchesToken(token, hash)) {
      // Take the token out of the address bar (and so out of history and anything shared).
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      if (turnOn) {
        storage.removeItem(OWNER_DEVICE_KEY);
        window.alert('Analytics is back on for this browser.');
        return false;
      }
      storage.setItem(OWNER_DEVICE_KEY, token);
      window.alert("This browser won't be counted in analytics.");
      return true;
    }
  }
  const saved = storage.getItem(OWNER_DEVICE_KEY);
  return saved !== null && (await matchesToken(saved, hash));
}
