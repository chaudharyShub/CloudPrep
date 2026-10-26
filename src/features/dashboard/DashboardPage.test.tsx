import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createTestStore, renderApp } from '@/test/renderApp';

describe('DashboardPage', () => {
  it('AC-R.6 starts a review session from the quick actions when questions are due', async () => {
    const store = createTestStore();
    for (const questionId of ['clf-d1-0001', 'clf-d2-0001']) {
      store.recordAnswer({ questionId, isCorrect: false, at: 1, sessionId: 's1' });
    }
    const { user, router } = renderApp('/dashboard', { store });
    await screen.findByRole('heading', { level: 1, name: 'Dashboard' });

    await user.click(
      screen.getByRole('link', { name: /^Review due.*2 questions due for review today/ }),
    );
    expect(await screen.findByRole('heading', { level: 1, name: 'Review due' })).toBeVisible();
    expect(screen.getByText('Question 1 of 2')).toBeVisible();
    expect(router.state.location.pathname).toBe('/practice/session');
  });

  it('AC-R.6 links to Learning mode when nothing is due', async () => {
    renderApp('/dashboard');
    await screen.findByRole('heading', { level: 1, name: 'Dashboard' });
    expect(
      screen.getByRole('link', { name: /^Review due.*Nothing due for review today/ }),
    ).toHaveAttribute('href', '/practice');
  });
});
