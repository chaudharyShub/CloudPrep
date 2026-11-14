import { useEffect } from 'react';
import { Outlet, ScrollRestoration } from 'react-router';
import { GuestDataPrompt } from '@/features/auth/GuestDataPrompt';
import { ExamWatcher } from '@/features/exam/ExamWatcher';
import { applyMotion, applyTheme, resolveTheme, systemPrefersLight } from '@/lib/theme';
import { usePreferences } from '@/state/hooks';

/** Wraps every route: app-wide watchers, saved appearance settings, and scroll restoration. */
export function RootLayout() {
  const { theme, reducedMotion } = usePreferences();

  useEffect(() => {
    applyTheme(resolveTheme(theme, systemPrefersLight()));
    if (theme !== 'system' || typeof window.matchMedia !== 'function') return;
    // Follow the operating system while "System" is selected.
    const query = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => {
      applyTheme(resolveTheme('system', query.matches));
    };
    query.addEventListener('change', onChange);
    return () => {
      query.removeEventListener('change', onChange);
    };
  }, [theme]);

  useEffect(() => {
    applyMotion(reducedMotion);
  }, [reducedMotion]);

  return (
    <>
      <ExamWatcher />
      <GuestDataPrompt />
      <Outlet />
      <ScrollRestoration />
    </>
  );
}
