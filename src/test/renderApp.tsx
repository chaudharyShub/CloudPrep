import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { routes } from '@/app/routes';
import type { AuthClient } from '@/backend/auth';
import { createFakeAuthClient, FAKE_USER } from '@/backend/fakeAuth';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/state/AuthProvider';
import { StoreProvider } from '@/state/StoreProvider';
import { createMemoryDriver } from '@/storage/driver';
import { createAppStore, type AppStore } from '@/storage/store';

export function createTestStore(initial: Record<string, string> = {}): AppStore {
  return createAppStore({ driver: createMemoryDriver(initial), persistent: true });
}

/**
 * Renders the real route table at `path` using an in-memory router and store. Signed in
 * by default; pass `auth` (e.g. `createFakeAuthClient()`) to test as a guest.
 */
export function renderApp(
  path = '/dashboard',
  {
    store = createTestStore(),
    state,
    auth = createFakeAuthClient({ user: FAKE_USER }),
  }: { store?: AppStore; state?: unknown; auth?: AuthClient } = {},
) {
  const router = createMemoryRouter(routes, {
    initialEntries: [state === undefined ? path : { pathname: path, state }],
  });
  const user = userEvent.setup();
  const result = render(
    <StoreProvider store={store}>
      <AuthProvider client={auth}>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </StoreProvider>,
  );
  return { ...result, router, store, user, auth };
}
