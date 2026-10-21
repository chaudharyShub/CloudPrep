import { WARNING_THRESHOLDS_MS } from './config';

/**
 * Time left, computed from the absolute end time. Never negative.
 * The end timestamp is the source of truth; UI intervals only trigger re-renders.
 */
export function remainingMs(endsAt: number, now: number): number {
  return Math.max(0, endsAt - now);
}

export function isExpired(endsAt: number, now: number): boolean {
  return now >= endsAt;
}

export type TimeWarning = 'none' | 'low' | 'critical';

export function timeWarning(remaining: number): TimeWarning {
  if (remaining <= WARNING_THRESHOLDS_MS.critical) return 'critical';
  if (remaining <= WARNING_THRESHOLDS_MS.low) return 'low';
  return 'none';
}

/**
 * Formats remaining time as m:ss or h:mm:ss. Rounds up to the next whole second, so the
 * clock reads 0:00 only when time has actually run out.
 */
export function formatClock(ms: number): string {
  const totalSeconds = Math.ceil(Math.max(0, ms) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const ss = String(seconds).padStart(2, '0');
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${ss}` : `${minutes}:${ss}`;
}
