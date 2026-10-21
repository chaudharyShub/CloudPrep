import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ExamAction } from '@/domain/exam/session';
import { EXAM_QUESTIONS } from '@/state/examQuestions';
import { examQuestion, makeAttempt, makeExam } from '@/test/exam';
import { createTestStore, renderApp } from '@/test/renderApp';

const q = (i: number) => examQuestion(i);

/** Adds an attempt over the first five questions with the first `correct` answered correctly. */
function addAttempt(
  store: ReturnType<typeof createTestStore>,
  id: string,
  correct: number,
  at: number,
) {
  const actions: ExamAction[] = [];
  for (let i = 0; i < correct; i++) {
    for (const optionId of q(i).correctOptionIds) {
      actions.push({ type: 'select', questionId: q(i).id, optionId, at: at + 1 });
    }
  }
  store.completeExam(makeAttempt(makeExam({ id, startedAt: at, actions })), EXAM_QUESTIONS);
}

describe('ProgressPage', () => {
  it('shows honest empty states with no history', async () => {
    renderApp('/progress');
    await screen.findByRole('heading', { level: 1, name: 'Progress' });
    expect(screen.getByText('Not enough data yet')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'No exams yet' })).toBeVisible();
    expect(screen.getByText(/No topic has been missed twice yet/)).toBeVisible();
    expect(screen.getByText(/No question has been missed twice/)).toBeVisible();
    expect(screen.queryByRole('table', { name: /Recent exam scores/ })).not.toBeInTheDocument();
  });

  it('gives no readiness judgement after a single perfect exam', async () => {
    const store = createTestStore();
    addAttempt(store, 'a', 5, 1_000);
    renderApp('/progress', { store });
    await screen.findByRole('heading', { level: 1, name: 'Progress' });
    expect(screen.getByText('Not enough data yet')).toBeVisible();
    expect(screen.getByText('1 of 3 taken')).toBeVisible();
    expect(screen.getByText(/Take another exam to see a trend/)).toBeVisible();
    // Domains with only a few questions are not judged.
    expect(screen.getAllByText('Not enough data').length).toBeGreaterThan(0);
    expect(screen.queryByText('Strength')).not.toBeInTheDocument();
  });

  it('shows recent scores with a text alternative and the trend', async () => {
    const store = createTestStore();
    addAttempt(store, 'a', 2, 1_000);
    addAttempt(store, 'b', 4, 2_000);
    renderApp('/progress', { store });
    const table = await screen.findByRole('table', { name: 'Recent exam scores, oldest first' });
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows.map((r) => within(r).getAllByRole('cell')[2]?.textContent)).toEqual(['40%', '80%']);
    expect(screen.getByText(/Up 40 points across your last 2 exams/)).toBeVisible();
  });

  it('lists repeated mistakes and coverage from saved answers', async () => {
    const store = createTestStore();
    const id = q(0).id;
    store.recordAnswer({ questionId: id, isCorrect: false, at: 1, sessionId: 's1' });
    store.recordAnswer({ questionId: id, isCorrect: false, at: 2, sessionId: 's2' });
    const { user, router } = renderApp('/progress', { store });
    await screen.findByRole('heading', { level: 1, name: 'Progress' });

    expect(screen.getByText('Missed 2 of 2')).toBeVisible();
    expect(screen.getByText(/^1\/\d+ covered/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Practise these (1)' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Repeated mistakes' }),
    ).toBeVisible();
    expect(router.state.location.pathname).toBe('/practice/session');
  });

  it('explains the criteria behind readiness guidance after three exams', async () => {
    const store = createTestStore();
    addAttempt(store, 'a', 5, 1_000);
    addAttempt(store, 'b', 5, 2_000);
    addAttempt(store, 'c', 5, 3_000);
    renderApp('/progress', { store });
    await screen.findByRole('heading', { level: 1, name: 'Progress' });
    // Perfect scores but too few questions per domain: never the top level.
    expect(screen.getByText('Approaching your benchmark')).toBeVisible();
    expect(screen.getByText(/Every domain at or above 70%/)).toBeVisible();
    expect(screen.getByText(/This is guidance, not a prediction/)).toBeVisible();
  });
});

describe('Dashboard readiness', () => {
  it('summarises the latest exam without implying readiness from one attempt', async () => {
    const store = createTestStore();
    addAttempt(store, 'a', 4, 1_000);
    renderApp('/dashboard', { store });
    await screen.findByRole('heading', { level: 1, name: 'Dashboard' });
    // The card is named for what it shows (one exam), not "Readiness".
    expect(screen.queryByRole('heading', { name: 'Readiness' })).not.toBeInTheDocument();
    const latest = screen
      .getByRole('heading', { name: 'Latest mock exam' })
      .closest('div.rounded-lg');
    expect(latest).toHaveTextContent('80%');
    expect(screen.getByText('Practice benchmark met (70%)')).toBeVisible();
    expect(screen.getByText('Readiness guidance starts after 3 exams (1 so far).')).toBeVisible();
    expect(screen.getByRole('link', { name: 'See progress' })).toHaveAttribute('href', '/progress');
  });
});
