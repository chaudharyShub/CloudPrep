import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import type { AppStore } from '@/storage/store';
import type { SyncEngine, SyncStatus } from '@/storage/sync';
import type { AccountManager, AccountSession } from './accounts';
import { useAuth } from './AuthProvider';
import { StoreProvider } from './StoreProvider';

/** Download account data again when the tab is shown after at least this long. */
const PULL_AFTER_HIDDEN_MS = 60_000;

export interface UserDataContextValue {
  /** Whose data the pages show: the guest's (this browser) or the signed-in account's. */
  readonly scope: 'guest' | 'account';
  readonly guestStore: AppStore;
  readonly account: AccountSession | null;
  readonly accounts: AccountManager;
}

const UserDataContext = createContext<UserDataContextValue | null>(null);

/**
 * Chooses which data the app works on (D-047): guest data in this browser, or the signed-in
 * user's account copy, which is synced with the server. Every page keeps using
 * `useAppStore()`; this only swaps the store behind it.
 */
export function UserDataProvider({
  guestStore,
  accounts,
  children,
}: {
  guestStore: AppStore;
  accounts: AccountManager;
  children: ReactNode;
}) {
  const { state } = useAuth();
  // While sign-in loads, assume the user whose copy is here, so their data shows at once.
  const userId =
    state.status === 'signed-in'
      ? state.user.id
      : state.status === 'loading'
        ? accounts.owner()
        : null;

  const [current, setCurrent] = useState(() => ({
    userId,
    session: userId === null ? null : accounts.open(userId),
  }));
  if (current.userId !== userId) {
    // Another user (or none): switch now, during this render.
    setCurrent({ userId, session: userId === null ? null : accounts.open(userId) });
  }
  const account = current.userId === userId ? current.session : null;

  // Close the previous account once another (or none) replaces it. Not in an effect
  // cleanup: StrictMode re-runs effects in development, which would remove the copy.
  const previousRef = useRef<AccountSession | null>(null);
  useEffect(() => {
    const previous = previousRef.current;
    if (previous && previous !== account) accounts.close(previous);
    previousRef.current = account;
  }, [accounts, account]);

  useAccountSync(account?.sync ?? null);

  const value = useMemo<UserDataContextValue>(
    () => ({ scope: account ? 'account' : 'guest', guestStore, account, accounts }),
    [account, guestStore, accounts],
  );

  return (
    <UserDataContext value={value}>
      <StoreProvider store={account?.store ?? guestStore}>{children}</StoreProvider>
    </UserDataContext>
  );
}

/** Downloads account data on sign-in, and syncs when the browser goes online or the tab is shown. */
function useAccountSync(sync: SyncEngine | null) {
  useEffect(() => {
    if (!sync) return;
    void sync.pull();
    let hiddenAt: number | null = null;
    const onOnline = () => void sync.pull();
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now();
        void sync.flush();
      } else if (hiddenAt !== null && Date.now() - hiddenAt >= PULL_AFTER_HIDDEN_MS) {
        hiddenAt = null;
        void sync.pull();
      }
    };
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [sync]);
}

// eslint-disable-next-line react-refresh/only-export-components -- hook belongs with its provider
export function useUserDataScope(): UserDataContextValue {
  const value = use(UserDataContext);
  if (!value) throw new Error('useUserDataScope must be used inside <UserDataProvider>.');
  return value;
}

const NO_SYNC = () => () => undefined;
const nullStatus = () => null;

/** The account's sync status, or null for guests and accounts without a server. */
// eslint-disable-next-line react-refresh/only-export-components -- hook belongs with its provider
export function useSyncStatus(): SyncStatus | null {
  const sync = useUserDataScope().account?.sync ?? null;
  const subscribe = useCallback(
    (listener: () => void) => (sync ? sync.subscribe(listener) : NO_SYNC()),
    [sync],
  );
  const getStatus = useCallback(() => (sync ? sync.getStatus() : nullStatus()), [sync]);
  return useSyncExternalStore(subscribe, getStatus, getStatus);
}
