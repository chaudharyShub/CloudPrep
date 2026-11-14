import type { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import type { AdminClient } from '@/backend/admin';
import type { AuthClient } from '@/backend/auth';
import { ToastProvider } from '@/components/ui/Toast';
import { AdminProvider } from '@/state/AdminProvider';
import { AuthProvider, type AuthState } from '@/state/AuthProvider';
import { QuestionBankProvider } from '@/state/QuestionBankProvider';
import type { QuestionLoader } from '@/state/questionLoader';
import type { AccountManager } from '@/state/accounts';
import { UserDataProvider } from '@/state/UserDataProvider';
import type { AppStore } from '@/storage/store';

/** A data router: the browser's (createBrowserRouter) or the build's (createMemoryRouter). */
type AppRouter = ReturnType<typeof createBrowserRouter>;

export interface AppShellProps {
  router: AppRouter;
  auth: AuthClient;
  /** Sign-in state for the first render; see AuthProvider. */
  initialAuth?: AuthState | undefined;
  admin: AdminClient;
  loaderFor: (examId: string) => QuestionLoader | null;
  guestStore: AppStore;
  accounts: AccountManager;
}

/**
 * The providers and the router. The browser (App) and the build's pre-rendering
 * (prerender.tsx, D-068) both render this, so the HTML the build writes is the same tree the
 * browser takes over.
 */
export function AppShell({
  router,
  auth,
  initialAuth,
  admin,
  loaderFor,
  guestStore,
  accounts,
}: AppShellProps) {
  return (
    <AuthProvider client={auth} initialState={initialAuth}>
      <UserDataProvider guestStore={guestStore} accounts={accounts}>
        <QuestionBankProvider loaderFor={loaderFor}>
          <AdminProvider client={admin}>
            <ToastProvider>
              <RouterProvider router={router} />
            </ToastProvider>
          </AdminProvider>
        </QuestionBankProvider>
      </UserDataProvider>
    </AuthProvider>
  );
}

export type BrowserServices = Omit<AppShellProps, 'initialAuth'>;

const SIGNED_OUT: AuthState = { status: 'signed-out', user: null };

/**
 * The app in the browser, with the services from createBrowserServices (browserServices.ts).
 * `prerendered`: the page's HTML was written by the build for a guest and React is taking it
 * over (D-068), so the first render must match it: signed out until the saved session has
 * been read.
 */
export function App({
  services,
  prerendered = false,
}: {
  services: BrowserServices;
  prerendered?: boolean;
}) {
  return <AppShell {...services} initialAuth={prerendered ? SIGNED_OUT : undefined} />;
}
