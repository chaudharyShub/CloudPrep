import { useEffect, useState } from 'react';

/**
 * The current time, refreshed every `intervalMs` while `enabled`. Also refreshes as soon as
 * the tab becomes visible or focused, because browsers throttle timers in background tabs.
 * Use it only to trigger re-renders; compute durations from absolute timestamps.
 */
export function useNow(intervalMs = 1000, enabled = true): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    const tick = () => {
      setNow(Date.now());
    };
    tick();
    const id = window.setInterval(tick, intervalMs);
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('focus', tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
      window.removeEventListener('focus', tick);
    };
  }, [intervalMs, enabled]);
  return now;
}
