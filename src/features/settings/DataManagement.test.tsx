import { screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyTheme } from '@/lib/theme';
import { createFakeAuthClient } from '@/backend/fakeAuth';
import { buildExport } from '@/storage/transfer';
import { createTestStore, renderApp } from '@/test/renderApp';

let downloads: { name: string; text: string }[] = [];

beforeEach(() => {
  downloads = [];
  // jsdom has no object URLs; capture downloads instead.
  let lastBlob: Blob | null = null;
  URL.createObjectURL = vi.fn((blob: Blob) => {
    lastBlob = blob;
    return 'blob:test';
  });
  URL.revokeObjectURL = vi.fn();
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    const blob = lastBlob;
    if (blob) void blob.text().then((text) => downloads.push({ name: this.download, text }));
  });
});

afterEach(() => {
  applyTheme('dark');
});

function file(content: string, name = 'export.json') {
  return new File([content], name, { type: 'application/json' });
}

async function openSettings(store = createTestStore()) {
  const view = renderApp('/settings', { store });
  await screen.findByRole('heading', { level: 1, name: 'Settings' });
  return view;
}

describe('settings', () => {
  it('offers dark, light and system themes and reduced motion, saved immediately', async () => {
    const store = createTestStore();
    const { user } = await openSettings(store);
    // Light is the default theme (D-057, 3.0.1); choosing another one is saved as a change.
    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked();
    await user.click(screen.getByRole('radio', { name: 'Dark' }));
    await user.click(screen.getByRole('radio', { name: 'Reduce' }));
    await user.click(screen.getByRole('switch', { name: 'Low-time warnings' }));
    expect(store.getSnapshot().data.preferenceOverrides).toEqual({
      theme: 'dark',
      reducedMotion: 'reduce',
      examTimeWarnings: false,
    });
    expect(document.documentElement.dataset['motion']).toBe('reduce');
  });

  it('restores default settings after confirmation', async () => {
    const store = createTestStore();
    store.setPreferences({ benchmarkPercent: 85 });
    const { user } = await openSettings(store);
    await user.click(screen.getByRole('button', { name: 'Restore default settings' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Restore defaults' }),
    );
    expect(store.getSnapshot().data.preferences.benchmarkPercent).toBe(70);
    expect(screen.getByRole('button', { name: 'Restore default settings' })).toBeDisabled();
  });

  it("explains that a guest's data stays in this browser", async () => {
    renderApp('/settings', { auth: createFakeAuthClient() });
    await screen.findByRole('heading', { level: 1, name: 'Settings' });
    expect(screen.getByText(/exist only in this browser on this device/)).toBeVisible();
  });

  it("AC-B.22 explains that a signed-in user's data is saved to the account", async () => {
    await openSettings();
    expect(screen.getByText(/saved to your account and follow you to every device/)).toBeVisible();
  });
});

describe('export', () => {
  it('downloads a CloudPrep export file', async () => {
    const store = createTestStore();
    store.toggleBookmark('clf-d1-0001', 1);
    const { user } = await openSettings(store);
    await user.click(screen.getByRole('button', { name: 'Export data' }));
    await vi.waitFor(() => {
      expect(downloads).toHaveLength(1);
    });
    expect(downloads[0]?.name).toMatch(/^cloudprep-export-\d{4}-\d{2}-\d{2}\.json$/);
    expect(JSON.parse(downloads[0]?.text ?? '{}')).toMatchObject({
      app: 'cloudprep',
      kind: 'export',
    });
  });
});

describe('import', () => {
  function exportWithBookmark(id: string) {
    const source = createTestStore();
    source.toggleBookmark(id, 5);
    return JSON.stringify(
      buildExport({ ...emptyTransfer(), bookmarks: source.getSnapshot().data.bookmarks }, 1),
    );
  }
  function emptyTransfer() {
    return {
      preferences: {},
      progress: {},
      bookmarks: {},
      sessions: [],
      attempts: [],
      questionArchive: {},
    };
  }

  it('shows a clear error for malformed files and changes nothing', async () => {
    const store = createTestStore();
    const { user } = await openSettings(store);
    await user.upload(screen.getByLabelText('Import data'), file('{not json'));
    expect(await screen.findByText("This file can't be imported")).toBeVisible();
    expect(screen.getByText(/isn't valid JSON/)).toBeVisible();
    expect(store.getSnapshot().data.bookmarks).toEqual({});
  });

  it('previews, then merges after confirmation, keeping a backup', async () => {
    const store = createTestStore();
    store.toggleBookmark('mine', 1);
    const { user } = await openSettings(store);
    await user.upload(screen.getByLabelText('Import data'), file(exportWithBookmark('theirs')));

    const preview = await screen.findByRole('region', { name: /Ready to import/ });
    expect(within(preview).getByText('Bookmarks').nextElementSibling).toHaveTextContent('1');
    expect(store.getSnapshot().data.bookmarks).not.toHaveProperty('theirs'); // nothing applied yet

    await user.click(within(preview).getByRole('button', { name: 'Merge data' }));
    await user.click(
      within(screen.getByRole('dialog', { name: 'Merge this data?' })).getByRole('button', {
        name: 'Merge data',
      }),
    );
    expect(Object.keys(store.getSnapshot().data.bookmarks).sort()).toEqual(['mine', 'theirs']);
    expect(store.listBackups()).toHaveLength(1);
  });

  it('requires typing REPLACE before replacing data', async () => {
    const store = createTestStore();
    store.toggleBookmark('mine', 1);
    const { user } = await openSettings(store);
    await user.upload(screen.getByLabelText('Import data'), file(exportWithBookmark('theirs')));
    const preview = await screen.findByRole('region', { name: /Ready to import/ });
    await user.click(within(preview).getByRole('radio', { name: 'Replace my data' }));
    await user.click(within(preview).getByRole('button', { name: 'Replace data' }));

    const dialog = screen.getByRole('dialog', { name: 'Replace your data?' });
    const confirm = within(dialog).getByRole('button', { name: 'Replace data' });
    expect(confirm).toBeDisabled();
    await user.type(within(dialog).getByRole('textbox'), 'REPLACE');
    await user.click(confirm);
    expect(Object.keys(store.getSnapshot().data.bookmarks)).toEqual(['theirs']);
  });
});

describe('recovery and clear actions', () => {
  it('lists backups and can restore a full backup through the import preview', async () => {
    const store = createTestStore();
    store.toggleBookmark('original', 1);
    store.createBackup();
    store.importData({ bookmarks: {} }, 'replace');
    const { user } = await openSettings(store);

    const recovery = screen
      .getByRole('heading', { name: 'Recovery' })
      .closest('div.rounded-lg') as HTMLElement;
    expect(within(recovery).getByText('Full backup')).toBeVisible();
    await user.click(within(recovery).getByRole('button', { name: 'Restore' }));
    const preview = await screen.findByRole('region', { name: /Ready to import: Backup/ });
    expect(within(preview).getByRole('radio', { name: 'Replace my data' })).toBeChecked();
  });

  it.each([
    ['Clear progress', 'Clear learning progress?'],
    ['Clear history', 'Clear exam history?'],
  ])('asks before "%s" and does nothing on cancel', async (button, title) => {
    const store = createTestStore();
    store.recordAnswer({ questionId: 'clf-d1-0001', isCorrect: true, at: 1, sessionId: 's' });
    const { user } = await openSettings(store);
    const target = screen.queryByRole('button', { name: button });
    if (button === 'Clear history') {
      expect(target).toBeDisabled(); // nothing to clear yet
      return;
    }
    await user.click(target as HTMLElement);
    const dialog = screen.getByRole('dialog', { name: title });
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(Object.keys(store.getSnapshot().data.progress)).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: button }));
    await user.click(
      within(screen.getByRole('dialog', { name: title })).getByRole('button', { name: button }),
    );
    expect(store.getSnapshot().data.progress).toEqual({});
  });

  it('requires typing RESET before resetting everything', async () => {
    const store = createTestStore();
    store.toggleBookmark('x', 1);
    const { user } = await openSettings(store);
    await user.click(screen.getByRole('button', { name: 'Reset everything' }));
    const dialog = screen.getByRole('dialog', { name: 'Reset all CloudPrep data?' });
    expect(within(dialog).getByRole('button', { name: 'Reset everything' })).toBeDisabled();
    await user.type(within(dialog).getByRole('textbox'), 'RESET');
    await user.click(within(dialog).getByRole('button', { name: 'Reset everything' }));
    expect(store.getSnapshot().data.bookmarks).toEqual({});
  });

  it('disables discarding an exam when none is in progress', async () => {
    await openSettings();
    expect(screen.getByRole('button', { name: 'Discard exam' })).toBeDisabled();
  });
});
