import { createRoot, hydrateRoot } from 'react-dom/client';
import '@fontsource-variable/source-sans-3';
import '@fontsource-variable/newsreader';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/600.css';
import './styles/index.css';
import { App } from './app/App';
import { createBrowserServices } from './app/browserServices';
import { canTakeOver, PRERENDERED_ATTRIBUTE } from './app/hydration';
import { Root } from './app/Root';
import { currentExam, examOfPath } from './state/CurrentExam';
import { installReloadAfterUpdate } from './lib/reloadAfterUpdate';

// After a deploy, a tab with the old version reloads once instead of failing (D-053).
installReloadAfterUpdate();

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root not found.');

const services = createBrowserServices();

// Public pages arrive with their HTML already written by the build (D-068). A guest whose
// first render will match it takes it over in place; anyone else gets a fresh render.
const renderedExam = container.getAttribute(PRERENDERED_ATTRIBUTE) ?? undefined;
const takeOver = canTakeOver({
  renderedExam,
  visitorExam: currentExam(
    examOfPath(window.location.pathname),
    services.guestStore.getSnapshot().data.preferences.exam,
  ).id,
  signedIn: services.accounts.owner() !== null,
});

if (takeOver) {
  hydrateRoot(
    container,
    <Root>
      <App services={services} prerendered />
    </Root>,
  );
} else {
  if (renderedExam !== undefined) {
    container.replaceChildren();
    container.removeAttribute(PRERENDERED_ATTRIBUTE);
  }
  createRoot(container).render(
    <Root>
      <App services={services} />
    </Root>,
  );
}
