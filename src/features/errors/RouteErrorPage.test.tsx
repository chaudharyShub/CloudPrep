import { render, screen } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { pageReloader, RELOAD_GUARD_KEY, resetReloadForUpdate } from '@/lib/reloadAfterUpdate';
import { RouteErrorPage } from './RouteErrorPage';

const STALE = 'Failed to fetch dynamically imported module: https://example.com/assets/X-1.js';
const originalReload = pageReloader.reload;
let reload: ReturnType<typeof vi.fn<() => void>>;

function renderError(message: string) {
  function Broken(): never {
    throw new TypeError(message);
  }
  const router = createMemoryRouter([
    { path: '/', element: <Broken />, errorElement: <RouteErrorPage /> },
  ]);
  return render(<RouterProvider router={router} />);
}

beforeEach(() => {
  reload = vi.fn<() => void>();
  pageReloader.reload = reload;
  resetReloadForUpdate();
  window.sessionStorage.clear();
  // React logs errors caught by the router's boundary.
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  pageReloader.reload = originalReload;
  resetReloadForUpdate();
  vi.restoreAllMocks();
});

describe('RouteErrorPage', () => {
  it('AC-U.4 reloads once for a page file missing after an update, with a loading message', async () => {
    renderError(STALE);
    expect(await screen.findByRole('status')).toHaveTextContent(
      'CloudPrep was updated. Loading the latest version…',
    );
    expect(screen.queryByRole('heading', { name: 'Something went wrong' })).not.toBeInTheDocument();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('AC-U.4 shows the error with a Reload button when the file still fails after reloading', async () => {
    window.sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()));
    renderError(STALE);
    expect(
      await screen.findByRole('heading', { name: 'Something went wrong' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/You may be offline, or CloudPrep may have just been updated/),
    ).toBeInTheDocument();
    expect(screen.getByText(STALE)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument();
    expect(reload).not.toHaveBeenCalled();
  });

  it('AC-U.4 never reloads by itself for other errors', async () => {
    renderError('Cannot read properties of undefined');
    expect(
      await screen.findByRole('heading', { name: 'Something went wrong' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/CloudPrep hit an unexpected error/)).toBeInTheDocument();
    expect(reload).not.toHaveBeenCalled();
  });
});
