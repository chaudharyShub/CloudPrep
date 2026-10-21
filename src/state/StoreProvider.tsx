import { createContext, use, useEffect, type ReactNode } from 'react';
import type { AppStore } from '@/storage/store';

const StoreContext = createContext<AppStore | null>(null);

/** Provides the app store and keeps it in sync with changes made in other tabs. */
export function StoreProvider({ store, children }: { store: AppStore; children: ReactNode }) {
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      store.handleExternalChange(event.key);
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
    };
  }, [store]);

  return <StoreContext value={store}>{children}</StoreContext>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook belongs with its provider
export function useAppStore(): AppStore {
  const store = use(StoreContext);
  if (!store) throw new Error('useAppStore must be used inside <StoreProvider>.');
  return store;
}
