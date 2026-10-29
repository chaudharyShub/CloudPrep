import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

export const buttonBase =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap ' +
  'transition-colors select-none disabled:cursor-not-allowed disabled:opacity-50 ' +
  'aria-disabled:cursor-not-allowed aria-disabled:opacity-50';

export const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary font-semibold text-on-primary hover:enabled:bg-primary-hover [a&]:hover:bg-primary-hover',
  secondary:
    'border border-border-strong bg-surface text-fg hover:enabled:bg-surface-2 [a&]:hover:bg-surface-2',
  ghost:
    'text-fg-muted hover:enabled:bg-surface-2 hover:enabled:text-fg [a&]:hover:bg-surface-2 [a&]:hover:text-fg',
  danger:
    'bg-danger font-semibold text-on-danger hover:enabled:bg-danger-hover [a&]:hover:bg-danger-hover',
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
};

export const buttonIconSizes: Record<ButtonSize, number> = { sm: 16, md: 18 };

/** Class names for anything that should look like a button (e.g. a router <Link>). */
export function buttonClasses({
  variant = 'primary',
  size = 'md',
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string | undefined } = {}): string {
  return cn(buttonBase, buttonVariants[variant], buttonSizes[size], className);
}
