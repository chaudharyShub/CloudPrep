import { useEffect, useRef, useState, type RefObject } from 'react';

/** True when the OS or CloudPrep's "Reduce motion" setting asks for less movement. */
export function prefersReducedMotion(): boolean {
  if (document.documentElement.dataset['motion'] === 'reduce') return true;
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * `shown` turns true once the element scrolls into view. It starts true when motion is
 * reduced or IntersectionObserver is missing, so content is never left hidden.
 */
export function useReveal<T extends Element>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(
    () => typeof IntersectionObserver === 'undefined' || prefersReducedMotion(),
  );

  useEffect(() => {
    const element = ref.current;
    if (shown || !element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
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
  const [reduced] = useState(prefersReducedMotion);
  const [picked, setPicked] = useState(reduced);
  const [remainingMs, setRemainingMs] = useState(DEMO_START_MS);

  useEffect(() => {
    if (reduced) return;
    const pick = window.setTimeout(() => {
      setPicked(true);
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
