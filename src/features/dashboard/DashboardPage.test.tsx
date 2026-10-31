import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EXAM_QUESTIONS } from '@/test/bank';
import { makeAttempt, makeExam } from '@/test/exam';
import { createTestStore, renderApp } from '@/test/renderApp';

describe('DashboardPage', () => {
  it('AC-I.4 explains Review due from the "i" beside its quick action', async () => {
    const { user } = renderApp('/dashboard');
    await screen.findByRole('heading', { level: 1, name: 'Dashboard' });
    await user.click(screen.getByRole('button', { name: 'About Review due' }));
    expect(screen.getByText(/after 1, 3, 7, 21 and then 60 days/)).toBeVisible();
    // Opening the tip doesn't follow the Review due link.
    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
  });

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

  it('AC-V.5 tags the weakest domain once two domains have enough answers', async () => {
    const store = createTestStore();
    const ids = (domain: string) =>
      EXAM_QUESTIONS.filter((q) => q.domain === domain)
        .slice(0, 20)
        .map((q) => q.id);
    ids('D1').forEach((questionId) => {
      store.recordAnswer({ questionId, isCorrect: true, at: 1, sessionId: 's1' });
    });
    ids('D2').forEach((questionId, i) => {
      store.recordAnswer({ questionId, isCorrect: i < 5, at: 1, sessionId: 's1' });
    });
    renderApp('/dashboard', { store });
    await screen.findByRole('heading', { level: 1, name: 'Dashboard' });
    const weakest = screen.getByText('weakest');
    expect(weakest.closest('li')).toHaveTextContent('Security and Compliance');
    expect(screen.getAllByText('weakest')).toHaveLength(1);
  });

  it('AC-V.6 shows the time used for recent attempts', async () => {
    const store = createTestStore();
    const exam = makeExam();
    const attempt = makeAttempt(exam, exam.startedAt + 3 * 60_000 + 1);
    store.completeExam(attempt, EXAM_QUESTIONS);
    renderApp('/dashboard', { store });
    const heading = await screen.findByRole('heading', { name: 'Recent attempts' });
    const card = heading.closest('div.rounded-lg') as HTMLElement;
    expect(attempt.timeUsedMs).toBe(3 * 60_000 + 1);
    expect(within(card).getByText(/4 min used/)).toBeVisible();
  });
});
