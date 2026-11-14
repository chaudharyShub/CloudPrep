import type { SupabaseClient } from '@supabase/supabase-js';

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

let client: Promise<SupabaseClient> | null = null;

/**
 * The app's single Supabase client (sign-in and data share it, so requests carry the
 * signed-in user's token). The library loads on first use, in its own chunk.
 */
export function getSupabase(config: SupabaseConfig): Promise<SupabaseClient> {
  client ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(config.url, config.publishableKey, {
      auth: {
        // PKCE: a sign-in link only works in the browser that asked for it.
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }),
  );
  return client;
}
