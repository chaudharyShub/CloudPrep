import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Brand, UnofficialNote } from './Brand';
import { NavList } from './NavList';

/** Persistent desktop sidebar (≥1024px). Smaller screens use MobileNav instead. */
export function Sidebar({ className, account }: { className?: string; account?: ReactNode }) {
  return (
    <div
      className={cn(
        'fixed inset-y-0 left-0 z-30 w-sidebar flex-col gap-8 border-r border-border bg-surface px-4 py-5',
        className,
      )}
    >
      <div className="px-2">
        <Brand />
      </div>
      <NavList />
      {account}
      <div className="px-2">
        <UnofficialNote />
      </div>
    </div>
  );
}
