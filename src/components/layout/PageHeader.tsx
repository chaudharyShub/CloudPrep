import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  /** The page's icon (from PAGE_ICONS), shown beside the title. */
  icon?: LucideIcon;
}

/** Page title (the page's only <h1>) and browser tab title. */
export function PageHeader({ title, description, actions, icon: Icon }: PageHeaderProps) {
  useDocumentTitle(title);
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          {Icon && (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-accent-fg">
              <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
            </span>
          )}
          <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">{title}</h1>
        </div>
        {description && <p className="mt-2 max-w-prose text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
