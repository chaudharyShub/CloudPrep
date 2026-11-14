import { Timer, TriangleAlert } from 'lucide-react';
import { formatClock, remainingMs, timeWarning } from '@/domain/exam/timer';
import { useNow } from '@/hooks/useNow';
import { cn } from '@/lib/cn';
import { usePreferences } from '@/state/hooks';

/**
 * Countdown calculated from the absolute end time on every tick, so it stays correct after
 * background-tab throttling, sleep, or a reload. Screen readers hear a polite announcement
 * only when a low-time threshold is crossed (10 and 5 minutes left), not every second.
 */
export function ExamTimer({ endsAt }: { endsAt: number }) {
  const now = useNow(1000);
  const remaining = remainingMs(endsAt, now);
  const { examTimeWarnings } = usePreferences();
  // With warnings turned off in Settings, the clock still counts down but never changes style.
  const level = examTimeWarnings ? timeWarning(remaining) : 'none';
  // Text changes only when a threshold is crossed, so the live region speaks once per level.
  const announcement =
    level === 'critical'
      ? 'Less than 5 minutes remaining.'
      : level === 'low'
        ? 'Less than 10 minutes remaining.'
        : '';

  const Icon = level === 'none' ? Timer : TriangleAlert;
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full border px-3 py-1.5',
        level === 'none' && 'border-border bg-surface text-fg [&>svg]:text-accent-fg',
        level === 'low' && 'border-warning/50 bg-warning-subtle text-warning',
        level === 'critical' && 'border-danger/60 bg-danger-subtle text-danger',
      )}
    >
      <Icon size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
      <span className="sr-only">Time remaining:</span>
      <span role="timer" className="font-mono text-lg font-semibold sm:text-xl">
        {formatClock(remaining)}
      </span>
      {level !== 'none' && <span className="hidden text-xs font-medium md:inline">Low time</span>}
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}
