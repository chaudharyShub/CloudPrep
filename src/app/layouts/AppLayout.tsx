import { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import { MobileNav } from '@/components/layout/MobileNav';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { StorageNotices } from '@/features/shared/StorageNotices';

export function AppLayout() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);

  // After client-side navigation, move focus to <main> so keyboard and screen-reader
  // users start at the new page's content instead of the link they activated.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="min-h-dvh lg:pl-sidebar">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to main content
      </a>
      <Sidebar className="hidden lg:flex" />
      <MobileNav className="lg:hidden" />
      <main id="main" ref={mainRef} tabIndex={-1}>
        <div className="mx-auto w-full max-w-content px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <StorageNotices />
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
