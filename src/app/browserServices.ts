import { createBrowserRouter } from 'react-router';
import { createAdminClient } from '@/backend/createAdminClient';
import { createAuthClient } from '@/backend/createAuthClient';
import { createQuestionSource } from '@/backend/createQuestionSource';
import { createAccountRemote } from '@/backend/createUserDataRemote';
import { createAccountManager } from '@/state/accounts';
import { createQuestionLoader, type QuestionLoader } from '@/state/questionLoader';
import { accountPreferences } from '@/storage/account';
import { createLocalStorageDriver, createMemoryDriver } from '@/storage/driver';
import { effectivePreferences } from '@/storage/preferencesArea';
import { createIndexedDbQuestionCache, createMemoryQuestionCache } from '@/storage/questionCache';
import { createAppStore } from '@/storage/store';
import { applyMotion, applyTheme, resolveTheme, systemPrefersLight } from '@/lib/theme';
import type { BrowserServices } from './App';
import { routes } from './routes';

/**
 * The app's real services in the browser: the router, Supabase sign-in, the admin client,
 * question loading and the stores. Made once, before React starts (main.tsx), which also
 * uses them to decide whether to take over a pre-rendered page (D-068).
 *
 * Router mode lives here only: BrowserRouter-style URLs need the host to serve the app page
 * for unknown paths (D-004); to host on GitHub Pages instead, swap createBrowserRouter for
 * createHashRouter.
 */
export function createBrowserServices(): BrowserServices {
  const cache = createIndexedDbQuestionCache() ?? createMemoryQuestionCache();
  // One loader per exam, made when a page first needs that exam's questions (D-066).
  const loaderFor = (examId: string): QuestionLoader | null => {
    const source = createQuestionSource(examId);
    return source ? createQuestionLoader(source, cache, examId) : null;
  };
  const local = createLocalStorageDriver();
  const base = local ?? createMemoryDriver();
  const persistent = local !== null;
  // Guest data keeps the original keys; a signed-in user's copy has its own (D-047).
  const guestStore = createAppStore({ driver: base, persistent });
  const accounts = createAccountManager({ base, persistent, createRemote: createAccountRemote });
  // Apply the saved theme before the first render to avoid a flash of the default theme.
  // The account copy (if any) wins, like the inline script in index.html.
  const saved = accountPreferences(base);
  const preferences = saved
    ? effectivePreferences(saved)
    : guestStore.getSnapshot().data.preferences;
  applyTheme(resolveTheme(preferences.theme, systemPrefersLight()));
  applyMotion(preferences.reducedMotion);
  return {
    router: createBrowserRouter(routes),
    auth: createAuthClient(),
    admin: createAdminClient(),
    loaderFor,
    guestStore,
    accounts,
  };
}
