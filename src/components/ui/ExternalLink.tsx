import type { ReactNode } from 'react';
import { ExternalLink as ExternalLinkIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Link to an external site, opened in a new tab and announced as such. */
export function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1 rounded-sm font-medium text-accent-fg underline-offset-4 hover:underline',
        className,
      )}
    >
      {children}
      <ExternalLinkIcon size={14} strokeWidth={1.75} aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
