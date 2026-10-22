import { lazyAuthClient, unavailableAuthClient, type AuthClient } from './auth';

export interface SupabaseConfig {
  url: string;
  publishableKey: string;
}

/** The public Supabase settings baked into the build, or null if they're missing. */
export function readSupabaseConfig(env: Partial<Record<string, unknown>>): SupabaseConfig | null {
  const url = env['VITE_SUPABASE_URL'];
  const publishableKey = env['VITE_SUPABASE_PUBLISHABLE_KEY'];
  if (typeof url !== 'string' || typeof publishableKey !== 'string') return null;
  if (!/^https:\/\/\S+$/.test(url) || publishableKey.trim() === '') return null;
  return { url, publishableKey };
}

/**
 * The app's sign-in client. E2E builds use a fake (this branch is removed from production
 * builds); otherwise Supabase, loaded on first use.
 */
export function createAuthClient(): AuthClient {
  if (import.meta.env.MODE === 'e2e') {
    return lazyAuthClient(async () => (await import('./fakeAuth')).createE2EAuthClient());
  }
  const config = readSupabaseConfig(import.meta.env);
  if (!config) return unavailableAuthClient;
  return lazyAuthClient(async () => {
    const [{ createClient }, { createSupabaseAuthClient }] = await Promise.all([
      import('@supabase/supabase-js'),
      import('./supabaseAuth'),
    ]);
    const supabase = createClient(config.url, config.publishableKey, {
      auth: {
        // PKCE: the sign-in link only works in the browser that asked for it.
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return createSupabaseAuthClient(supabase);
  });
}
