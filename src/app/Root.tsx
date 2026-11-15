import { StrictMode, useEffect, useState, type ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { isOwnerDevice } from '@/lib/ownerDevice';

/**
 * Vercel Web Analytics (D-048) and Speed Insights (D-065): production builds only, so dev and
 * E2E builds send nothing. Both render nothing themselves. They load only after the owner check
 * (D-073) says this isn't the owner's browser; it runs in an effect, so pre-rendered pages and
 * the browser's first render match (D-068).
 */
function Telemetry() {
  const [track, setTrack] = useState(false);

  useEffect(() => {
    if (import.meta.env.MODE !== 'production') return;
    let active = true;
    const check = () => {
      void isOwnerDevice()
        .catch(() => false)
        .then((owner) => {
          if (active) setTrack(!owner);
        });
    };
    check();
    // The secret link can also be pasted into a tab that already has the site open.
    window.addEventListener('hashchange', check);
    return () => {
      active = false;
      window.removeEventListener('hashchange', check);
    };
  }, []);

  if (!track) return null;
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

/**
 * The outermost tree. The browser (main.tsx) and the build's pre-rendering (prerender.tsx)
 * both use it, so React's generated ids and the HTML match when the browser takes over a
 * pre-rendered page (D-068).
 */
export function Root({ children }: { children: ReactNode }) {
  return (
    <StrictMode>
      {children}
      <Telemetry />
    </StrictMode>
  );
}
