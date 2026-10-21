import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp, createTestStore } from '@/test/renderApp';

describe('BookmarksPage', () => {
  it('shows an empty state with a way to start practising', async () => {
    renderApp('/bookmarks');
    expect(await screen.findByRole('heading', { name: 'No bookmarks yet' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Go to Learning mode' })).toHaveAttribute(
      'href',
      '/practice',
    );
  });

  it('lists bookmarked questions newest first, removes them, and ignores unknown ids', async () => {
    const store = createTestStore();
    store.toggleBookmark('clf-d1-0001', 1);
    store.toggleBookmark('clf-d2-0005', 2);
    store.toggleBookmark('clf-d9-9999', 3); // not in the bank
    const { user } = renderApp('/bookmarks', { store });
    await screen.findByRole('heading', { level: 1, name: 'Bookmarks' });

    const items = screen.getAllByRole('listitem').filter((li) => li.textContent.includes('Saved'));
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent(/deleted an Amazon S3 bucket/);

    await user.click(
      screen.getByRole('button', { name: /Remove bookmark: .*deleted an Amazon S3 bucket/ }),
    );
    expect(store.getSnapshot().data.bookmarks).not.toHaveProperty('clf-d2-0005');
    expect(screen.getByRole('button', { name: 'Practise bookmarks (1)' })).toBeVisible();
  });

  it('practises all bookmarks', async () => {
    const store = createTestStore();
    store.toggleBookmark('clf-d1-0001', 1);
    const { user } = renderApp('/bookmarks', { store });
    await user.click(await screen.findByRole('button', { name: 'Practise bookmarks (1)' }));
    expect(await screen.findByText('Question 1 of 1')).toBeVisible();
    expect(screen.getByRole('heading', { level: 1, name: 'Bookmarks' })).toBeVisible();
  });
});
