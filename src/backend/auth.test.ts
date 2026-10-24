import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { isPlausibleEmail, lazyAuthClient, unavailableAuthClient, type AuthUser } from './auth';
import { readSupabaseConfig } from './supabaseClient';
import { createFakeAuthClient, FAKE_USER } from './fakeAuth';
import { authErrorMessage, createSupabaseAuthClient, toAuthUser } from './supabaseAuth';

describe('auth client', () => {
  it('AC-B.11 loads the real client once, on first use', async () => {
    const real = createFakeAuthClient({ user: FAKE_USER });
    const load = vi.fn(() => Promise.resolve(real));
    const client = lazyAuthClient(load);
    expect(load).not.toHaveBeenCalled();
    expect(await client.getUser()).toEqual(FAKE_USER);
    await client.signOut();
    expect(await client.getUser()).toBe(null);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('stops listening even when unsubscribed before the client has loaded', async () => {
    const real = createFakeAuthClient();
    const client = lazyAuthClient(() => Promise.resolve(real));
    const listener = vi.fn();
    const unsubscribe = client.onChange(listener);
    unsubscribe();
    await client.getUser();
    real.setUser(FAKE_USER);
    expect(listener).not.toHaveBeenCalled();
  });

  it('AC-B.11 is unavailable without Supabase settings', async () => {
    expect(readSupabaseConfig({})).toBe(null);
    expect(
      readSupabaseConfig({ VITE_SUPABASE_URL: 'http://x', VITE_SUPABASE_PUBLISHABLE_KEY: 'k' }),
    ).toBe(null);
    expect(
      readSupabaseConfig({
        VITE_SUPABASE_URL: 'https://x.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: ' ',
      }),
    ).toBe(null);
    expect(
      readSupabaseConfig({
        VITE_SUPABASE_URL: 'https://x.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'k',
      }),
    ).toEqual({ url: 'https://x.supabase.co', publishableKey: 'k' });
    expect(unavailableAuthClient.available).toBe(false);
    expect(await unavailableAuthClient.sendMagicLink('a@b.co', '/')).toMatchObject({ ok: false });
  });

  it('checks the basic shape of an email address', () => {
    expect(isPlausibleEmail(' name@example.com ')).toBe(true);
    for (const bad of ['', 'name', 'name@', '@example.com', 'a b@example.com', 'name@example']) {
      expect(isPlausibleEmail(bad)).toBe(false);
    }
  });
});

describe('Supabase auth client', () => {
  function fakeSupabase() {
    const auth = {
      getSession: vi.fn(() =>
        Promise.resolve({
          data: {
            session: {
              user: { id: 'u1', email: 'a@b.co', user_metadata: { full_name: ' Ada ' } },
            },
          },
          error: null,
        }),
      ),
      onAuthStateChange: vi.fn(),
      signInWithOtp: vi.fn(() => Promise.resolve({ error: null })),
      signInWithOAuth: vi.fn(() =>
        Promise.resolve({ error: { message: 'Provider is not enabled', status: 400 } }),
      ),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    };
    return { supabase: { auth } as unknown as SupabaseClient, auth };
  }

  it('AC-B.7 AC-B.8 passes the callback URL to magic links and Google', async () => {
    const { supabase, auth } = fakeSupabase();
    const client = createSupabaseAuthClient(supabase);
    expect(await client.getUser()).toEqual<AuthUser>({ id: 'u1', email: 'a@b.co', name: 'Ada' });

    expect(await client.sendMagicLink(' a@b.co ', 'https://app/auth/callback')).toEqual({
      ok: true,
    });
    expect(auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'a@b.co',
      options: { emailRedirectTo: 'https://app/auth/callback', shouldCreateUser: true },
    });

    expect(await client.signInWithGoogle('https://app/auth/callback')).toEqual({
      ok: false,
      message: 'Provider is not enabled',
    });
    expect(auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: 'https://app/auth/callback' },
    });
  });

  it('AC-B.7 explains rate limits and maps users', () => {
    expect(authErrorMessage({ message: 'email rate limit exceeded', status: 429 })).toMatch(
      /Too many/,
    );
    expect(toAuthUser(null)).toBe(null);
  });
});
