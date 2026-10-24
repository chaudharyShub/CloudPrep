import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { routes } from '@/app/routes';
import type { AuthClient } from '@/backend/auth';
import { createFakeAuthClient, FAKE_USER } from '@/backend/fakeAuth';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/state/AuthProvider';
import { QuestionBankProvider } from '@/state/QuestionBankProvider';
import type { QuestionLoader } from '@/state/questionLoader';
import { StoreProvider } from '@/state/StoreProvider';
import { createMemoryDriver } from '@/storage/driver';
import { createAppStore, type AppStore } from '@/storage/store';
import { TEST_BANK } from './bank';

export function createTestStore(initial: Record<string, string> = {}): AppStore {
  return createAppStore({ driver: createMemoryDriver(initial), persistent: true });
}

/**
 * Renders the real route table at `path` using an in-memory router and store. Signed in
 * by default; pass `auth` (e.g. `createFakeAuthClient()`) to test as a guest. The question
 * bank is ready at once; pass `questions` (a loader) to test loading.
 */
export function renderApp(
  path = '/dashboard',
  {
    store = createTestStore(),
    state,
    auth = createFakeAuthClient({ user: FAKE_USER }),
    questions,
  }: {
    store?: AppStore;
    state?: unknown;
    auth?: AuthClient;
    questions?: QuestionLoader | null;
  } = {},
) {
  const router = createMemoryRouter(routes, {
    initialEntries: [state === undefined ? path : { pathname: path, state }],
  });
  const user = userEvent.setup();
  const result = render(
    <StoreProvider store={store}>
      <AuthProvider client={auth}>
        <QuestionBankProvider
          loader={questions ?? null}
          {...(questions === undefined ? { initialBank: TEST_BANK } : {})}
        >
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </QuestionBankProvider>
      </AuthProvider>
    </StoreProvider>,
  );
  return { ...result, router, store, user, auth };
}
