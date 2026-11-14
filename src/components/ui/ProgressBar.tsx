import { cn } from '@/lib/cn';

export interface ProgressBarProps {
  value: number;
  max?: number;
  /** Accessible name, e.g. "Cloud Concepts weighting". */
  label: string;
  /** Text read by screen readers instead of the raw number, e.g. "24% of scored content". */
  valueText?: string;
  tone?: 'accent' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

const tones = {
  accent: 'bg-meter',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  neutral: 'bg-fg-subtle',
} as const;

export function ProgressBar({
  value,
  max = 100,
  label,
  valueText,
  tone = 'accent',
  size = 'sm',
  className,
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 1;
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const percent = (clamped / safeMax) * 100;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={clamped}
      aria-valuetext={valueText}
      className={cn(
        'w-full overflow-hidden rounded-full bg-surface-3',
        size === 'sm' ? 'h-1.5' : 'h-2.5',
        className,
      )}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-base', tones[tone])}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
