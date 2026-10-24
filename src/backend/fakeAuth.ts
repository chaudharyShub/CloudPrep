import type { AuthClient, AuthResult, AuthUser } from './auth';

/**
 * Fake sign-in for component tests and E2E builds (`vite build --mode e2e`). It never talks
 * to a server. Production builds don't include it.
 */

export const FAKE_USER: AuthUser = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'learner@example.com',
  name: 'Test Learner',
};

export interface FakeAuthOptions {
  user?: AuthUser | null;
  /** Saves the session (E2E builds keep it across reloads). */
  persist?: (user: AuthUser | null) => void;
  /** Called instead of leaving for Google; defaults to signing in immediately. */
  onGoogle?: (redirectTo: string) => void;
  /** Shows the email sign-in form (default true). */
  emailSignIn?: boolean;
  /** Makes every call fail with this message. */
  failWith?: string;
}

export interface FakeAuthClient extends AuthClient {
  readonly calls: { magicLinks: { email: string; redirectTo: string }[]; google: string[] };
  setUser(user: AuthUser | null): void;
}

export function createFakeAuthClient(options: FakeAuthOptions = {}): FakeAuthClient {
  let user = options.user === undefined ? null : options.user;
  const listeners = new Set<(user: AuthUser | null) => void>();
  const calls: FakeAuthClient['calls'] = { magicLinks: [], google: [] };
  const fail = (): AuthResult | null =>
    options.failWith === undefined ? null : { ok: false, message: options.failWith };

  const setUser = (next: AuthUser | null) => {
    user = next;
    options.persist?.(next);
    for (const listener of listeners) listener(next);
  };

  return {
    available: true,
    emailSignIn: options.emailSignIn ?? true,
    calls,
    setUser,
    getUser: () => Promise.resolve(user),
    onChange(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    sendMagicLink(email, redirectTo) {
      calls.magicLinks.push({ email, redirectTo });
      return Promise.resolve(fail() ?? { ok: true });
    },
    signInWithGoogle(redirectTo) {
      calls.google.push(redirectTo);
      const failed = fail();
      if (failed) return Promise.resolve(failed);
      if (options.onGoogle) options.onGoogle(redirectTo);
      else setUser(FAKE_USER);
      return Promise.resolve({ ok: true });
    },
    signOut() {
      const failed = fail();
      if (failed) return Promise.resolve(failed);
      setUser(null);
      return Promise.resolve({ ok: true });
    },
  };
}

/** Storage key for the E2E fake session (outside the app's `cloudprep:` keys). */
export const E2E_AUTH_KEY = 'cloudprep-e2e-auth';
/** Set (in sessionStorage) after signing out, so the test fixture stops signing the tab in. */
export const E2E_SIGNED_OUT_KEY = 'cloudprep-e2e-signed-out';

/**
 * E2E builds only. Tests sign in by saving a user under `E2E_AUTH_KEY` before the page loads.
 * "Continue with Google" saves the fake user and loads the callback URL, like the real flow.
 */
export function createE2EAuthClient(): AuthClient {
  // eslint-disable-next-line no-restricted-syntax -- E2E-only fake session, not app data
  const storage = window.localStorage;
  let saved: AuthUser | null = null;
  try {
    const raw = storage.getItem(E2E_AUTH_KEY);
    saved = raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    saved = null;
  }
  const persist = (next: AuthUser | null) => {
    if (next) {
      storage.setItem(E2E_AUTH_KEY, JSON.stringify(next));
      window.sessionStorage.removeItem(E2E_SIGNED_OUT_KEY);
    } else {
      storage.removeItem(E2E_AUTH_KEY);
      window.sessionStorage.setItem(E2E_SIGNED_OUT_KEY, '1');
    }
  };
  return createFakeAuthClient({
    user: saved,
    persist,
    onGoogle: (redirectTo) => {
      persist(FAKE_USER);
      window.location.assign(redirectTo);
    },
  });
}
