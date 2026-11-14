import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react';

/** True when the OS or CloudPrep's "Reduce motion" setting asks for less movement. */
export function prefersReducedMotion(): boolean {
  if (document.documentElement.dataset['motion'] === 'reduce') return true;
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

// Read once per render; the setting is applied when the page opens.
const subscribeNothing = () => () => undefined;

/*
 * The build renders the landing page to HTML in Node (D-068), where there is no document,
 * and the browser then takes that HTML over (hydration), which needs its first render to
 * match the HTML exactly. So these read the browser through useSyncExternalStore: the
 * build and the browser's first render use the "server" value (motion on, as for most
 * visitors), then the browser re-renders with the real one.
 */
function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeNothing, prefersReducedMotion, () => false);
}

function useCanObserve(): boolean {
  return useSyncExternalStore(
    subscribeNothing,
    () => typeof IntersectionObserver !== 'undefined',
    () => true,
  );
}

/**
 * `shown` turns true once the element scrolls into view. It is true at once when motion is
 * reduced or IntersectionObserver is missing, so content is never left hidden.
 */
export function useReveal<T extends Element>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();
  const canObserve = useCanObserve();
  const [seen, setSeen] = useState(false);
  const shown = seen || reduced || !canObserve;

  useEffect(() => {
    const element = ref.current;
    // Without IntersectionObserver, the next render shows the content (useCanObserve).
    if (shown || !element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [shown]);

  return [ref, shown];
}

/** Classes for an element that fades and rises in when `shown` turns true. */
export function revealClasses(shown: boolean): string {
  return shown
    ? 'opacity-100 translate-y-0 transition-[opacity,translate] duration-700 ease-out'
    : 'opacity-0 translate-y-3 transition-[opacity,translate] duration-700 ease-out';
}

const DEMO_START_MS = (72 * 60 + 40) * 1000; // 01:12:40

/**
 * The landing page's example exam: answer B is picked a moment after load and the clock
 * counts down. With reduced motion it shows the picked answer and a still clock.
 */
export function useExamDemo(): { picked: boolean; remainingMs: number } {
  const reduced = useReducedMotion();
  const [pickedByTimer, setPickedByTimer] = useState(false);
  const [remainingMs, setRemainingMs] = useState(DEMO_START_MS);
  const picked = reduced || pickedByTimer;

  useEffect(() => {
    if (reduced) return;
    const pick = window.setTimeout(() => {
      setPickedByTimer(true);
    }, 1200);
    const tick = window.setInterval(() => {
      setRemainingMs((ms) => Math.max(0, ms - 1000));
    }, 1000);
    return () => {
      window.clearTimeout(pick);
      window.clearInterval(tick);
    };
  }, [reduced]);

  return { picked, remainingMs };
}
