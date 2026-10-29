import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { routes } from '@/app/routes';
import type { AdminClient } from '@/backend/admin';
import type { AuthClient } from '@/backend/auth';
import { createFakeAdminClient } from '@/backend/fakeAdmin';
import { createFakeAuthClient, FAKE_USER } from '@/backend/fakeAuth';
import { ToastProvider } from '@/components/ui/Toast';
import { AdminProvider } from '@/state/AdminProvider';
import { AuthProvider } from '@/state/AuthProvider';
import { QuestionBankProvider } from '@/state/QuestionBankProvider';
import type { QuestionLoader } from '@/state/questionLoader';
import type { AccountManager } from '@/state/accounts';
import { UserDataProvider } from '@/state/UserDataProvider';
import { createMemoryDriver } from '@/storage/driver';
import { createAppStore, type AppStore } from '@/storage/store';
import { TEST_BANK } from './bank';

export function createTestStore(initial: Record<string, string> = {}): AppStore {
  return createAppStore({ driver: createMemoryDriver(initial), persistent: true });
}

/**
 * Accounts that all use `store`, without a server, so a test's data shows whether it
 * runs signed in or as a guest. Tests of sync and guest data pass real accounts instead.
 */
export function singleStoreAccounts(store: AppStore): AccountManager {
  return {
    owner: () => null,
    open: (userId) => ({ userId, store, sync: null }),
    close: () => undefined,
    wasAskedToImport: () => true,
    markAskedToImport: () => undefined,
  };
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
    accounts = singleStoreAccounts(store),
    admin = createFakeAdminClient(),
  }: {
    store?: AppStore;
    state?: unknown;
    auth?: AuthClient;
    questions?: QuestionLoader | null;
    /** Signed-in users' data; defaults to `store` too. */
    accounts?: AccountManager;
    /** The admin overview; defaults to a non-admin. */
    admin?: AdminClient;
  } = {},
) {
  const router = createMemoryRouter(routes, {
    initialEntries: [state === undefined ? path : { pathname: path, state }],
  });
  const user = userEvent.setup();
  const result = render(
    <AuthProvider client={auth}>
      <UserDataProvider guestStore={store} accounts={accounts}>
        <QuestionBankProvider
          loader={questions ?? null}
          {...(questions === undefined ? { initialBank: TEST_BANK } : {})}
        >
          <AdminProvider client={admin}>
            <ToastProvider>
              <RouterProvider router={router} />
            </ToastProvider>
          </AdminProvider>
        </QuestionBankProvider>
      </UserDataProvider>
    </AuthProvider>,
  );
  return { ...result, router, store, user, auth };
}
