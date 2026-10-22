import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderApp } from '@/test/renderApp';

// A bank that is too small for the full exam (needs 16 / 19 / 22 / 8) but big enough for a
// shorter balanced one.
vi.mock('@/content/questions', async () => {
  const { makeBank } = await import('@/test/fixtures/bank');
  return { BANK_VERSION: 'small', QUESTION_BANK: makeBank({ D1: 10, D2: 12, D3: 15, D4: 7 }) };
});

const MIN = 60_000;

describe('exam start page with a small question bank', () => {
  it('explains that the full exam is unavailable and offers alternatives', async () => {
    renderApp('/exam');
    expect(await screen.findByText("The full exam isn't available yet")).toBeVisible();
    const table = screen.getByRole('table', { name: /questions needed and available/i });
    expect(within(table).getByRole('row', { name: /Cloud Concepts 16 10/ })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Start full exam' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start shorter exam' })).toBeEnabled();
    expect(screen.getByRole('link', { name: 'Practise in Learning mode' })).toHaveAttribute(
      'href',
      '/practice',
    );
  });

  it('starts a shorter exam at the real pace', async () => {
    const { user, store } = renderApp('/exam');
    await user.click(await screen.findByRole('button', { name: 'Start shorter exam' }));
    const dialog = screen.getByRole('dialog', { name: 'Start the shorter exam?' });
    expect(dialog).toHaveAccessibleDescription(/41 questions, 57 minutes/);
    await user.click(within(dialog).getByRole('button', { name: 'Start exam' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Question 1 of 41' }),
    ).toBeVisible();
    const exam = store.getSnapshot().data.activeExam;
    expect(new Set(exam?.questionIds).size).toBe(41);
    expect((exam?.endsAt ?? 0) - (exam?.startedAt ?? 0)).toBe(57 * MIN);
  });

  it('advertises the shorter exam on the dashboard instead of the unavailable full exam', async () => {
    renderApp('/dashboard');
    expect(await screen.findByText('Timed mock exam (shorter)')).toBeVisible();
    expect(screen.getByText('41 questions · 57 minutes')).toBeVisible();
  });
});
