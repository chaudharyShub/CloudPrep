import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createFakeAuthClient } from '@/backend/fakeAuth';
import { DVA_TEST_BANK, SAA_TEST_BANK, TEST_BANK } from '@/test/bank';
import { renderApp } from '@/test/renderApp';
import { PAGE_HEADS } from './pageHeads';

describe('Page heads match the app (D-068)', () => {
  // The saved title is what link previews and Google's first look see; the app sets its own
  // once it loads. They must be the same, or the tab title would change as the page starts.
  it.each(PAGE_HEADS)(
    'AC-S.10 $path: the app sets the same title as the page file',
    async (page) => {
      renderApp(page.path, {
        auth: createFakeAuthClient(),
        banks: [TEST_BANK, SAA_TEST_BANK, DVA_TEST_BANK],
      });
      await waitFor(() => {
        expect(document.title).toBe(page.title);
      });
    },
  );
});
