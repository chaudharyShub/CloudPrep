/**
 * Renders a public page to HTML at build time, as a first-time guest sees it (D-068). Run by
 * the build in Node (vite.config.ts), never shipped to the browser. It renders the same tree
 * as the browser (Root + AppShell) with stand-ins for the browser's services: a guest
 * sign-in, empty in-memory storage and no question loading or network.
 */

import { prerender } from 'react-dom/static';
import { createMemoryRouter } from 'react-router';
import { createFakeAdminClient } from '@/backend/fakeAdmin';
import { createFakeAuthClient } from '@/backend/fakeAuth';
import { createAccountManager } from '@/state/accounts';
import { currentExam, examOfPath } from '@/state/CurrentExam';
import { createMemoryDriver } from '@/storage/driver';
import { createAppStore } from '@/storage/store';
import { AppShell } from './App';
import type { RenderedPage } from './pageHeads';
import { Root } from './Root';
import { routes } from './routes';

export type { RenderedPage } from './pageHeads';

export async function renderPage(path: string): Promise<RenderedPage> {
  const base = createMemoryDriver();
  // `persistent`, so pages don't warn that this browser can't save progress.
  const guestStore = createAppStore({ driver: base, persistent: true });
  const exam = currentExam(examOfPath(path), guestStore.getSnapshot().data.preferences.exam);
  const tree = (
    <Root>
      <AppShell
        router={createMemoryRouter(routes, { initialEntries: [path] })}
        auth={createFakeAuthClient()}
        initialAuth={{ status: 'signed-out', user: null }}
        admin={createFakeAdminClient()}
        loaderFor={() => null}
        guestStore={guestStore}
        accounts={createAccountManager({ base, persistent: true, createRemote: () => null })}
      />
    </Root>
  );
  // `prerender` waits for lazy pages to load, so the HTML holds the page, not a spinner.
  // React normally sends a large part of a page later, behind a placeholder, so the top
  // shows sooner; a file written in advance has nothing to wait for, so keep it all inline.
  const { prelude } = await prerender(tree, { progressiveChunkSize: Number.POSITIVE_INFINITY });
  const html = await new Response(prelude).text();
  return { html, exam: exam.id };
}
