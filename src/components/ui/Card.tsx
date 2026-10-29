import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-lg border border-border bg-surface', className)} {...rest} />;
}

export interface CardHeaderProps {
  title: string;
  /** Heading level for the title; keep the page outline correct (page h1 → card h2). */
  as?: 'h1' | 'h2' | 'h3';
  description?: ReactNode;
  action?: ReactNode;
  id?: string;
}

export function CardHeader({
  title,
  as: Heading = 'h2',
  description,
  action,
  id,
}: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 pt-5">
      <div className="min-w-0">
        <Heading id={id} className="font-serif text-xl font-medium text-fg">
          {title}
        </Heading>
        {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...rest} />;
}
