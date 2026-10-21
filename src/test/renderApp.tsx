import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { routes } from '@/app/routes';
import { ToastProvider } from '@/components/ui/Toast';
import { StoreProvider } from '@/state/StoreProvider';
import { createMemoryDriver } from '@/storage/driver';
import { createAppStore, type AppStore } from '@/storage/store';

export function createTestStore(initial: Record<string, string> = {}): AppStore {
  return createAppStore({ driver: createMemoryDriver(initial), persistent: true });
}

/** Renders the real route table at `path` using an in-memory router and store. */
export function renderApp(
  path = '/dashboard',
  { store = createTestStore(), state }: { store?: AppStore; state?: unknown } = {},
) {
  const router = createMemoryRouter(routes, {
    initialEntries: [state === undefined ? path : { pathname: path, state }],
  });
  const user = userEvent.setup();
  const result = render(
    <StoreProvider store={store}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </StoreProvider>,
  );
  return { ...result, router, store, user };
}
