import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Brand, MadeBy, UnofficialNote } from './Brand';
import { NavList } from './NavList';

/** Persistent desktop sidebar (≥1024px). Smaller screens use MobileNav instead. */
export function Sidebar({ className, account }: { className?: string; account?: ReactNode }) {
  return (
    <div
      className={cn(
        // Fits a laptop-height window; on very short windows it still scrolls, without a visible bar.
        'fixed inset-y-0 left-0 z-30 w-sidebar [scrollbar-width:none] flex-col gap-6 overflow-y-auto border-r border-border bg-surface px-4 py-5 [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      <div className="px-2">
        <Brand />
      </div>
      <NavList />
      <div className="mt-auto flex flex-col gap-3">
        {account}
        <div className="flex flex-col gap-2 px-2">
          <UnofficialNote />
          <MadeBy />
        </div>
      </div>
    </div>
  );
}
