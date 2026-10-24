import { lazyAuthClient, readEmailSignIn, unavailableAuthClient, type AuthClient } from './auth';
import { getSupabase, readSupabaseConfig } from './supabaseClient';

/**
 * The app's sign-in client. E2E builds use a fake (this branch is removed from production
 * builds); otherwise Supabase, loaded on first use.
 */
export function createAuthClient(): AuthClient {
  if (import.meta.env.MODE === 'e2e') {
    // E2E builds keep email sign-in on so its flow stays covered.
    return lazyAuthClient(async () => (await import('./fakeAuth')).createE2EAuthClient(), {
      emailSignIn: true,
    });
  }
  const config = readSupabaseConfig(import.meta.env);
  if (!config) return unavailableAuthClient;
  const emailSignIn = readEmailSignIn(import.meta.env);
  return lazyAuthClient(
    async () => {
      const [supabase, { createSupabaseAuthClient }] = await Promise.all([
        getSupabase(config),
        import('./supabaseAuth'),
      ]);
      return createSupabaseAuthClient(supabase, { emailSignIn });
    },
    { emailSignIn },
  );
}
