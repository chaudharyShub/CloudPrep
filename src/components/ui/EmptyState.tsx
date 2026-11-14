import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  action?: ReactNode;
  headingLevel?: 'h1' | 'h2' | 'h3';
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  headingLevel: Heading = 'h2',
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-12 text-center', className)}>
      <span className="mb-4 flex size-12 items-center justify-center rounded-lg border border-border bg-surface-2 text-fg-muted">
        <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <Heading className="text-base font-semibold text-fg">{title}</Heading>
      <div className="mt-1.5 max-w-sm text-sm text-fg-muted">{description}</div>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
