import { useCallback } from 'react';
import type { ThemePreference } from '@/lib/theme';
import { useAppStore } from '@/state/StoreProvider';
import { usePreferences } from '@/state/hooks';

/** The saved theme preference and a setter. The root layout applies it to <html>. */
export function useTheme(): [ThemePreference, (theme: ThemePreference) => void] {
  const store = useAppStore();
  const { theme } = usePreferences();
  const setTheme = useCallback(
    (next: ThemePreference) => {
      store.setPreferences({ theme: next });
    },
    [store],
  );
  return [theme, setTheme];
}
