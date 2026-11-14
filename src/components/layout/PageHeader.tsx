import type { ReactNode } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}

/** Page title (the page's only <h1>, in the serif) and browser tab title. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  useDocumentTitle(title);
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-serif text-4xl font-medium tracking-tight text-fg sm:text-[2.625rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-prose text-[1.0625rem] text-fg-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
