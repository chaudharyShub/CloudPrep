import { useState } from 'react';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { createAuthClient } from '@/backend/createAuthClient';
import { createQuestionSource } from '@/backend/createQuestionSource';
import { EXAM_ID } from '@/domain/exam-guide/clf-c02';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/state/AuthProvider';
import { QuestionBankProvider } from '@/state/QuestionBankProvider';
import { createQuestionLoader, type QuestionLoader } from '@/state/questionLoader';
import { createIndexedDbQuestionCache, createMemoryQuestionCache } from '@/storage/questionCache';
import { StoreProvider } from '@/state/StoreProvider';
import { createLocalStorageDriver, createMemoryDriver } from '@/storage/driver';
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
  const [store] = useState(() => {
    const local = createLocalStorageDriver();
    const created = createAppStore({
      driver: local ?? createMemoryDriver(),
      persistent: local !== null,
    });
    // Apply the saved theme before the first render to avoid a flash of the default theme.
    const { theme, reducedMotion } = created.getSnapshot().data.preferences;
    applyTheme(resolveTheme(theme, systemPrefersLight()));
    applyMotion(reducedMotion);
    return created;
  });
  return (
    <StoreProvider store={store}>
      <AuthProvider client={auth}>
        <QuestionBankProvider loader={questions}>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </QuestionBankProvider>
      </AuthProvider>
    </StoreProvider>
  );
}
