import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import '@fontsource-variable/inter';
import './styles/index.css';
import { App } from './app/App';
import { installReloadAfterUpdate } from './lib/reloadAfterUpdate';

// After a deploy, a tab with the old version reloads once instead of failing (D-053).
installReloadAfterUpdate();

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root not found.');

createRoot(container).render(
  <StrictMode>
    <App />
    {/* Vercel Web Analytics (D-048): production builds only, so dev and E2E builds send nothing. */}
    {import.meta.env.MODE === 'production' && <Analytics />}
  </StrictMode>,
);
