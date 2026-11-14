import { act, waitFor } from '@testing-library/react';
import { hydrateRoot, type Root as ReactRoot } from 'react-dom/client';
import { createMemoryRouter } from 'react-router';
import { afterEach, describe, expect, inject, it, vi } from 'vitest';
import { createFakeAdminClient } from '@/backend/fakeAdmin';
import { createFakeAuthClient } from '@/backend/fakeAuth';
import { createAccountManager } from '@/state/accounts';
import { createMemoryDriver } from '@/storage/driver';
import { createAppStore } from '@/storage/store';
import { AppShell } from './App';
import { canTakeOver } from './hydration';
import { PRERENDERED_PATHS } from './pageHeads';
import type { RenderedPage } from './prerender';
import { Root } from './Root';
import { routes } from './routes';

/** Each page rendered the way the build does, by tests/setup/renderPages.ts. */
const pages = inject('prerenderedPages');

function renderPage(path: string): RenderedPage {
  const page = pages[path];
  if (!page) throw new Error(`${path} was not rendered`);
  return page;
}

let mounted: { root: ReactRoot; container: HTMLElement } | null = null;

afterEach(() => {
  if (mounted) {
    const { root, container } = mounted;
    act(() => {
      root.unmount();
    });
    container.remove();
    mounted = null;
  }
});

/**
 * Takes over `html` the way the browser does (main.tsx), as a guest whose browser holds
 * `saved` (localStorage-style keys), and returns every problem React reported.
 */
async function takeOver(path: string, html: string, saved: Record<string, string> = {}) {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.append(container);
  const errors: unknown[] = [];
  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    // Hydration warnings only; not the test environment's notes about act().
    const message = args.map(String).join(' ');
    if (/hydrat|server rendered|didn't match|did not match/i.test(message)) errors.push(message);
  });
  const base = createMemoryDriver(saved);
  const root = await act(() =>
    hydrateRoot(
      container,
      <Root>
        <AppShell
          router={createMemoryRouter(routes, { initialEntries: [path] })}
          auth={createFakeAuthClient()}
          initialAuth={{ status: 'signed-out', user: null }}
          admin={createFakeAdminClient()}
          loaderFor={() => null}
          guestStore={createAppStore({ driver: base, persistent: true })}
          accounts={createAccountManager({ base, persistent: true, createRemote: () => null })}
        />
      </Root>,
      {
        onRecoverableError: (error) => {
          errors.push(error);
        },
      },
    ),
  );
  mounted = { root, container };
  // Wait until React owns the page's heading: the lazy page has loaded and been taken over.
  await waitFor(() => {
    const heading = container.querySelector('h1');
    expect(heading && Object.keys(heading).some((key) => key.startsWith('__reactFiber'))).toBe(
      true,
    );
  });
  return { errors, container };
}

describe('Pre-rendered pages (D-068)', () => {
  it.each(PRERENDERED_PATHS)(
    'AC-S.12 %s renders to HTML with its content, not a loading screen',
    (path) => {
      const { html } = renderPage(path);
      expect(html).toMatch(/<h1[\s>]/);
      expect(html).not.toContain('Opening CloudPrep');
      expect(html).not.toContain('Loading');
    },
  );

  it('AC-S.12 each page is rendered for its own exam, shared pages for the default one', () => {
    expect(renderPage('/saa-c03').exam).toBe('saa-c03');
    expect(renderPage('/saa-c03').html).toContain('SAA-C03');
    expect(renderPage('/').exam).toBe('clf-c02');
    expect(renderPage('/privacy').exam).toBe('clf-c02');
  });

  it.each(PRERENDERED_PATHS)(
    'AC-S.13 a first-time guest’s browser takes %s over with no mismatch',
    async (path) => {
      const { html } = renderPage(path);
      const { errors, container } = await takeOver(path, html);
      expect(errors).toEqual([]);
      expect(container.querySelector('h1')).not.toBeNull();
    },
  );

  it('AC-S.13 the check above catches a mismatch: a guest who last used another exam', async () => {
    // The home page shows the exam used last; the build rendered CLF-C02's.
    const { html } = renderPage('/');
    const saved = {
      'cloudprep:preferences': JSON.stringify({
        app: 'cloudprep',
        schemaVersion: 1,
        savedAt: '2026-11-09T00:00:00.000Z',
        data: { exam: 'saa-c03' },
      }),
    };
    const { errors } = await takeOver('/', html, saved);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('Taking over in the browser (D-068)', () => {
  it('AC-S.14 only a guest whose page uses the same exam takes the HTML over', () => {
    const guest = { renderedExam: 'clf-c02', visitorExam: 'clf-c02', signedIn: false };
    expect(canTakeOver(guest)).toBe(true);
    expect(canTakeOver({ ...guest, signedIn: true })).toBe(false);
    expect(canTakeOver({ ...guest, visitorExam: 'saa-c03' })).toBe(false);
    expect(canTakeOver({ ...guest, renderedExam: undefined })).toBe(false);
  });
});
