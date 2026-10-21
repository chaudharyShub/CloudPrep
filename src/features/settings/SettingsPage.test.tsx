import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createTestStore, renderApp } from '@/test/renderApp';

describe('SettingsPage', () => {
  it('switches the theme by setting data-theme on <html>', async () => {
    const { user } = renderApp('/settings');
    await screen.findByRole('heading', { level: 1, name: 'Settings' });

    expect(document.documentElement.dataset['theme']).toBe('dark');
    await user.click(screen.getByText('Light'));
    expect(document.documentElement.dataset['theme']).toBe('light');
    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked();
  });

  it('saves the practice benchmark, option shuffling and session length', async () => {
    const store = createTestStore();
    const { user } = renderApp('/settings', { store });
    await screen.findByRole('heading', { level: 1, name: 'Settings' });

    await user.selectOptions(screen.getByRole('combobox', { name: 'Practice benchmark' }), '80');
    await user.click(screen.getByRole('switch', { name: 'Shuffle answer options' }));
    await user.click(screen.getByRole('radio', { name: '20' }));

    expect(store.getSnapshot().data.preferences).toMatchObject({
      benchmarkPercent: 80,
      shuffleOptions: false,
      practiceSessionLength: '20',
    });
  });
});
