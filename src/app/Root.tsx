import { StrictMode, type ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

/**
 * Vercel Web Analytics (D-048) and Speed Insights (D-065): production builds only, so dev and
 * E2E builds send nothing. Both render nothing themselves.
 */
function Telemetry() {
  if (import.meta.env.MODE !== 'production') return null;
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
