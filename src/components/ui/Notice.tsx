import type { ReactNode } from 'react';
import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export type NoticeTone = 'info' | 'success' | 'warning' | 'danger';

const tones: Record<NoticeTone, { icon: LucideIcon; box: string; iconClass: string }> = {
  info: { icon: Info, box: 'border-accent/30 bg-accent-subtle', iconClass: 'text-accent-fg' },
  success: {
    icon: CircleCheck,
    box: 'border-success/30 bg-success-subtle',
    iconClass: 'text-success',
  },
  warning: {
    icon: TriangleAlert,
    box: 'border-warning/30 bg-warning-subtle',
    iconClass: 'text-warning',
  },
  danger: { icon: CircleAlert, box: 'border-danger/30 bg-danger-subtle', iconClass: 'text-danger' },
};

export interface NoticeProps {
  tone?: NoticeTone;
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Inline, non-modal message. Static content: read in page order, not announced. */
export function Notice({ tone = 'info', title, children, action, className }: NoticeProps) {
  const { icon: Icon, box, iconClass } = tones[tone];
  return (
    <div className={cn('flex items-start gap-3 rounded-lg border p-4', box, className)}>
      <Icon
        size={20}
        strokeWidth={1.75}
        aria-hidden="true"
        className={cn('mt-px shrink-0', iconClass)}
      />
      <div className="min-w-0 flex-1 text-sm">
        {title && <p className="font-medium text-fg">{title}</p>}
        <div className={cn('text-fg-muted', title && 'mt-1')}>{children}</div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
