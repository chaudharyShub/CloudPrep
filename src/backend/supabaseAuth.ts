import type { AuthError, SupabaseClient, User } from '@supabase/supabase-js';
import type { AuthClient, AuthResult, AuthUser } from './auth';

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

export function toAuthUser(user: User | null | undefined): AuthUser | null {
  if (!user) return null;
  const meta: Record<string, unknown> = user.user_metadata;
  return {
    id: user.id,
    email: user.email ?? null,
    name: text(meta['full_name']) ?? text(meta['name']),
  };
}

export function authErrorMessage(error: Pick<AuthError, 'message' | 'status'>): string {
  if (error.status === 429) {
    return 'Too many sign-in attempts. Wait a minute, then try again.';
  }
  return error.message || 'Something went wrong. Try again.';
}

function result(error: AuthError | null): AuthResult {
  return error ? { ok: false, message: authErrorMessage(error) } : { ok: true };
}

export function createSupabaseAuthClient(
  supabase: SupabaseClient,
  options: { emailSignIn: boolean },
): AuthClient {
  return {
    available: true,
    emailSignIn: options.emailSignIn,
    async getUser() {
      // Reads the saved session (waiting for any sign-in in the URL). Data access is still
      // checked by the server, which verifies the token on every request.
      const { data, error } = await supabase.auth.getSession();
      return error ? null : toAuthUser(data.session?.user);
    },
    onChange(listener) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        listener(toAuthUser(session?.user));
      });
      return () => {
        data.subscription.unsubscribe();
      };
    },
    async sendMagicLink(email, redirectTo) {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
      });
      return result(error);
    },
    async signInWithGoogle(redirectTo) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      return result(error);
    },
    async signOut() {
      const { error } = await supabase.auth.signOut();
      return result(error);
    },
  };
}
