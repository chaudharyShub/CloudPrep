import { cn } from '@/lib/cn';

/** Decorative loading placeholder. Wrap groups in an element with role="status". */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('animate-pulse rounded-md bg-surface-3', className)} />
  );
}

/** Full-page loading state shown while a route's code loads. */
export function PageSkeleton() {
  return (
    <div role="status" aria-label="Loading page" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
      <Skeleton className="h-56 rounded-lg" />
    </div>
  );
}
