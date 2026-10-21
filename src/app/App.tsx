import { useState } from 'react';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { ToastProvider } from '@/components/ui/Toast';
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
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </StoreProvider>
  );
}
