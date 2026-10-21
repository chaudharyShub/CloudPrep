import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '@/test/renderApp';
import { PRIMARY_NAV, SECONDARY_NAV } from './navigation';

const PAGES = [
  { path: '/dashboard', heading: 'Dashboard', title: 'Dashboard · CloudPrep' },
  { path: '/practice', heading: 'Learning mode', title: 'Learning mode · CloudPrep' },
  { path: '/exam', heading: 'Mock exam', title: 'Mock exam · CloudPrep' },
  { path: '/history', heading: 'Exam history', title: 'Exam history · CloudPrep' },
  { path: '/bookmarks', heading: 'Bookmarks', title: 'Bookmarks · CloudPrep' },
  { path: '/settings', heading: 'Settings', title: 'Settings · CloudPrep' },
] as const;

/** The always-rendered desktop sidebar navigation (CSS hides it on small screens). */
function sidebarNav() {
  const [first] = screen.getAllByRole('navigation', { name: 'Main' });
  if (!first) throw new Error('Main navigation not found');
  return first;
}

describe('routing', () => {
  it('redirects / to the dashboard', async () => {
    const { router } = renderApp('/');
    expect(await screen.findByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
    expect(router.state.location.pathname).toBe('/dashboard');
  });

  it.each(PAGES)('renders $path with one h1 and a meaningful tab title', async (page) => {
    renderApp(page.path);
    expect(await screen.findByRole('heading', { level: 1, name: page.heading })).toBeVisible();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    await waitFor(() => {
      expect(document.title).toBe(page.title);
    });
  });

  it('shows a not-found page for unknown routes', async () => {
    renderApp('/does-not-exist');
    expect(await screen.findByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Go to dashboard' })).toHaveAttribute(
      'href',
      '/dashboard',
    );
  });
});

describe('sidebar navigation', () => {
  it('lists every destination', async () => {
    renderApp();
    await screen.findByRole('heading', { level: 1, name: 'Dashboard' });
    const nav = sidebarNav();
    for (const item of [...PRIMARY_NAV, ...SECONDARY_NAV]) {
      expect(within(nav).getByRole('link', { name: item.label })).toHaveAttribute('href', item.to);
    }
  });

  it('navigates between pages and marks only the active link as current', async () => {
    const { user } = renderApp();
    await screen.findByRole('heading', { level: 1, name: 'Dashboard' });
    const nav = sidebarNav();

    expect(within(nav).getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    await user.click(within(nav).getByRole('link', { name: 'Mock exam' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Mock exam' })).toBeVisible();
    expect(within(nav).getByRole('link', { name: 'Mock exam' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(nav).getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('moves focus to the main region after navigating', async () => {
    const { user } = renderApp();
    await screen.findByRole('heading', { level: 1, name: 'Dashboard' });
    await user.click(within(sidebarNav()).getByRole('link', { name: 'Settings' }));
    await screen.findByRole('heading', { level: 1, name: 'Settings' });
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('provides a skip link to the main content', async () => {
    renderApp();
    await screen.findByRole('heading', { level: 1, name: 'Dashboard' });
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute(
      'href',
      '#main',
    );
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main');
  });
});

describe('mobile navigation drawer', () => {
  it('opens from the menu button and closes after choosing a page', async () => {
    const { user } = renderApp();
    await screen.findByRole('heading', { level: 1, name: 'Dashboard' });

    const menuButton = screen.getByRole('button', { name: 'Open navigation' });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await user.click(menuButton);

    const drawer = screen.getByRole('dialog', { name: 'Navigation' });
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');

    await user.click(within(drawer).getByRole('link', { name: 'Bookmarks' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Bookmarks' })).toBeVisible();
    expect(screen.queryByRole('dialog', { name: 'Navigation' })).not.toBeInTheDocument();
  });
});
