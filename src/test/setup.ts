import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

// Routes are lazy-loaded; allow time for chunks to load in slower runs (e.g. with coverage).
configure({ asyncUtilTimeout: 3000 });

// Mirror index.html, which ships with <html data-theme="dark">.
beforeEach(() => {
  document.documentElement.dataset['theme'] = 'dark';
});

afterEach(() => {
  cleanup();
});

// jsdom doesn't implement scrolling; React Router's <ScrollRestoration> calls it.
window.scrollTo = () => undefined;

// jsdom doesn't implement modal <dialog> behaviour. Stub the two methods our Dialog uses,
// matching the browser's observable effects (the `open` attribute and the `close` event).
HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
  this.setAttribute('open', '');
};
HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
  if (!this.hasAttribute('open')) return;
  this.removeAttribute('open');
  this.dispatchEvent(new Event('close'));
};
