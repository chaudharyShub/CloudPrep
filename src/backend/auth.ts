/**
 * Sign-in, behind an interface so the app doesn't depend on Supabase directly and tests can
 * use a fake (D-045). Implementations: Supabase (`supabaseAuth.ts`), a fake for tests and E2E
 * builds (`fakeAuth.ts`), and "unavailable" when the site has no Supabase settings.
 */

export interface AuthUser {
  readonly id: string;
  readonly email: string | null;
  /** From the identity provider (e.g. the Google account name), if any. */
  readonly name: string | null;
}

export type AuthResult = { readonly ok: true } | { readonly ok: false; readonly message: string };

export interface AuthClient {
  /** False when sign-in isn't set up for this site. */
  readonly available: boolean;
  /** False when email sign-in links are switched off (e.g. before custom SMTP is set up). */
  readonly emailSignIn: boolean;
  /**
   * The signed-in user, or null. Resolves after a sign-in in the current URL (magic link or
   * Google callback) has been processed.
   */
  getUser(): Promise<AuthUser | null>;
  /** Called whenever the user signs in or out. Returns an unsubscribe function. */
  onChange(listener: (user: AuthUser | null) => void): () => void;
  /** Emails a one-time sign-in link that returns to `redirectTo`. */
  sendMagicLink(email: string, redirectTo: string): Promise<AuthResult>;
  /** Leaves the page for Google, which returns to `redirectTo`. */
  signInWithGoogle(redirectTo: string): Promise<AuthResult>;
  signOut(): Promise<AuthResult>;
}

export const UNAVAILABLE_MESSAGE = "Sign-in isn't set up on this site.";

export const unavailableAuthClient: AuthClient = {
  available: false,
  emailSignIn: false,
  getUser: () => Promise.resolve(null),
  onChange: () => () => undefined,
  sendMagicLink: () => Promise.resolve({ ok: false, message: UNAVAILABLE_MESSAGE }),
  signInWithGoogle: () => Promise.resolve({ ok: false, message: UNAVAILABLE_MESSAGE }),
  signOut: () => Promise.resolve({ ok: true }),
};

/**
 * Wraps a client that is created on first use, so its code (the Supabase library) loads
 * only when the app first needs it.
 */
export function lazyAuthClient(
  load: () => Promise<AuthClient>,
  options: { emailSignIn: boolean },
): AuthClient {
  let loading: Promise<AuthClient> | null = null;
  const client = () => (loading ??= load());
  return {
    available: true,
    emailSignIn: options.emailSignIn,
    getUser: async () => (await client()).getUser(),
    onChange: (listener) => {
      let unsubscribe: (() => void) | null = null;
      let cancelled = false;
      void client().then((loaded) => {
        if (!cancelled) unsubscribe = loaded.onChange(listener);
      });
      return () => {
        cancelled = true;
        unsubscribe?.();
      };
    },
    sendMagicLink: async (email, redirectTo) => (await client()).sendMagicLink(email, redirectTo),
    signInWithGoogle: async (redirectTo) => (await client()).signInWithGoogle(redirectTo),
    signOut: async () => (await client()).signOut(),
  };
}

/**
 * Email sign-in links need a mail service that can reach any address (custom SMTP in
 * Supabase), so they're off unless `VITE_EMAIL_SIGN_IN` is `true`. Google sign-in is always on.
 */
export function readEmailSignIn(env: Partial<Record<string, unknown>>): boolean {
  return env['VITE_EMAIL_SIGN_IN'] === 'true';
}

/** Basic shape check only; the auth server is the real judge of an address. */
export function isPlausibleEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
