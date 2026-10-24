import { useState } from 'react';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { createAuthClient } from '@/backend/createAuthClient';
import { createQuestionSource } from '@/backend/createQuestionSource';
import { createAccountRemote } from '@/backend/createUserDataRemote';
import { EXAM_ID } from '@/domain/exam-guide/clf-c02';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/state/AuthProvider';
import { QuestionBankProvider } from '@/state/QuestionBankProvider';
import { createQuestionLoader, type QuestionLoader } from '@/state/questionLoader';
import { createIndexedDbQuestionCache, createMemoryQuestionCache } from '@/storage/questionCache';
import { createAccountManager } from '@/state/accounts';
import { UserDataProvider } from '@/state/UserDataProvider';
import { createLocalStorageDriver, createMemoryDriver } from '@/storage/driver';
import { accountPreferences } from '@/storage/account';
import { effectivePreferences } from '@/storage/preferencesArea';
import { createAppStore } from '@/storage/store';
import { applyMotion, applyTheme, resolveTheme, systemPrefersLight } from '@/lib/theme';
import { routes } from './routes';

/**
 * Router mode lives here only. BrowserRouter-style URLs need the host to serve
 * index.html for unknown paths (see docs/DECISIONS.md D-004). To host on GitHub
 * Pages instead, swap createBrowserRouter for createHashRouter.
 */
export function App() {
  const [router] = useState(() => createBrowserRouter(routes));
  const [auth] = useState(createAuthClient);
  const [questions] = useState<QuestionLoader | null>(() => {
    const source = createQuestionSource();
    const cache = createIndexedDbQuestionCache() ?? createMemoryQuestionCache();
    return source ? createQuestionLoader(source, cache, EXAM_ID) : null;
  });
  const [{ guestStore, accounts }] = useState(() => {
    const local = createLocalStorageDriver();
    const base = local ?? createMemoryDriver();
    const persistent = local !== null;
    // Guest data keeps the original keys; a signed-in user's copy has its own (D-047).
    const guest = createAppStore({ driver: base, persistent });
    const manager = createAccountManager({ base, persistent, createRemote: createAccountRemote });
    // Apply the saved theme before the first render to avoid a flash of the default theme.
    // The account copy (if any) wins, like the inline script in index.html.
    const saved = accountPreferences(base);
    const preferences = saved ? effectivePreferences(saved) : guest.getSnapshot().data.preferences;
    applyTheme(resolveTheme(preferences.theme, systemPrefersLight()));
    applyMotion(preferences.reducedMotion);
    return { guestStore: guest, accounts: manager };
  });
  return (
    <AuthProvider client={auth}>
      <UserDataProvider guestStore={guestStore} accounts={accounts}>
        <QuestionBankProvider loader={questions}>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </QuestionBankProvider>
      </UserDataProvider>
    </AuthProvider>
  );
}
