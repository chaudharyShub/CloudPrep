import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ExamAction } from '@/domain/exam/session';
import { EXAM_QUESTIONS } from '@/test/bank';
import { examQuestion, makeAttempt, makeExam } from '@/test/exam';
import { createTestStore, renderApp } from '@/test/renderApp';

const NOW = Date.now();
const q = (i: number) => examQuestion(i);

/** Exam over the first five real questions: q0 correct, q1 wrong, q2 (multi) correct, rest unanswered. */
function storeWithAttempt(id = 'att-1', extra: ExamAction[] = []) {
  const store = createTestStore();
  const wrongOption = q(1).options.find((o) => !q(1).correctOptionIds.includes(o.id))?.id ?? 'b';
  const actions: ExamAction[] = [
    { type: 'select', questionId: q(0).id, optionId: q(0).correctOptionIds[0] ?? 'a', at: NOW + 1 },
    { type: 'select', questionId: q(1).id, optionId: wrongOption, at: NOW + 1 },
    ...q(2).correctOptionIds.map((optionId): ExamAction => ({
      type: 'select',
      questionId: q(2).id,
      optionId,
      at: NOW + 1,
    })),
    { type: 'toggleFlag', questionId: q(1).id, at: NOW + 1 },
    ...extra,
  ];
  const attempt = makeAttempt(makeExam({ id, startedAt: NOW, actions }));
  store.completeExam(attempt, EXAM_QUESTIONS);
  return { store, attempt };
}

describe('ResultsPage', () => {
  it('shows score, counts, time used and an honest benchmark outcome', async () => {
    const { store } = storeWithAttempt();
    renderApp('/results/att-1', { store });
    await screen.findByRole('heading', { level: 1, name: 'Exam results' });

    const scoreLine = screen.getByText('2 of 5 questions correct');
    expect(scoreLine.previousElementSibling).toHaveTextContent('40%');
    const stats = screen.getByText('Unanswered').closest('dl');
    expect(stats).toHaveTextContent(/Correct\s*2/);
    expect(stats).toHaveTextContent(/Incorrect\s*1/);
    expect(stats).toHaveTextContent(/Unanswered\s*2/);
    expect(stats).toHaveTextContent(/Time used\s*1 min 00 s/);
    expect(screen.getByText('Practice benchmark not met (70%)')).toBeVisible();
    expect(screen.getByText('Official AWS result not predicted or guaranteed.')).toBeVisible();
    // Never a fabricated score out of 1,000.
    expect(document.body.textContent).not.toMatch(/\b\d{3}\s*\/\s*1,?000\b/);
  });

  it('shows domain performance as a table, separating score from accuracy and flagging small samples', async () => {
    const { store } = storeWithAttempt();
    renderApp('/results/att-1', { store });
    const table = await screen.findByRole('table', { name: 'Results by exam domain' });
    const row = within(table).getByRole('row', { name: /Cloud Concepts/ });
    expect(row).toHaveTextContent('2/5');
    expect(row).toHaveTextContent(/40%/);
    expect(row).toHaveTextContent(/67%/); // accuracy: 2 of 3 answered
    // Five questions is at the small-sample limit, so it isn't flagged.
    expect(row).not.toHaveTextContent(/too few to judge/);
  });

  it('lists weak areas and next steps with working actions', async () => {
    const { store } = storeWithAttempt();
    const { user, router } = renderApp('/results/att-1', { store });
    await screen.findByRole('heading', { level: 1, name: 'Exam results' });
    expect(screen.getByRole('heading', { name: 'Weak areas' })).toBeVisible();
    expect(screen.getByText('Work on pacing')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Take another exam' })).toHaveAttribute(
      'href',
      '/exam',
    );
    const main = screen.getByRole('main');
    expect(within(main).getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'href',
      '/dashboard',
    );

    await user.click(screen.getByRole('button', { name: 'Practise 3 missed' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Missed exam questions' }),
    ).toBeVisible();
    expect(router.state.location.pathname).toBe('/practice/session');
  });

  it('shows a not-found state for unknown attempts', async () => {
    renderApp('/results/nope');
    expect(await screen.findByRole('heading', { name: 'Results not found' })).toBeVisible();
  });

  it('keeps showing the benchmark the exam was taken with after the setting changes', async () => {
    const { store } = storeWithAttempt();
    store.setPreferences({ benchmarkPercent: 50 });
    renderApp('/results/att-1', { store });
    expect(await screen.findByText('Practice benchmark not met (70%)')).toBeVisible();
  });
});

describe('AnswerReviewPage', () => {
  it('opens on incorrect answers and shows everything needed to learn from them', async () => {
    const { store } = storeWithAttempt();
    renderApp('/results/att-1/review', { store });
    await screen.findByRole('heading', { level: 1, name: 'Answer review' });

    expect(screen.getByRole('radio', { name: 'Incorrect (1)' })).toBeChecked();
    const question = q(1);
    expect(screen.getByRole('heading', { level: 2, name: /Question 2 · Incorrect/ })).toBeVisible();
    expect(screen.getByText('Flagged')).toBeVisible();
    expect(screen.getByText(question.stem)).toBeVisible();
    expect(screen.getByText('Incorrect · your answer')).toBeVisible();
    expect(screen.getByText(/Correct answer · not selected/)).toBeVisible();
    const options = screen.getByRole('group', { name: question.stem });
    const radios = within(options).getAllByRole('radio');
    expect(radios).toHaveLength(question.options.length);
    // Every option is shown (locked) with its explanation.
    const labels = radios.map((radio) => radio.closest('label')?.textContent ?? '');
    for (const option of question.options) {
      expect(labels.some((label) => label.includes(option.text))).toBe(true);
      expect(screen.getByText(option.explanation)).toBeVisible();
    }
    for (const radio of radios) expect(radio).toBeDisabled();
    expect(screen.getByText(question.explanation)).toBeVisible();
    expect(screen.getByText(/Domain:/).parentElement).toHaveTextContent('Cloud Concepts');
    const source = question.references[0];
    if (source)
      expect(screen.getByRole('link', { name: new RegExp(source.title) })).toHaveAttribute(
        'href',
        source.url,
      );
    expect(screen.getByRole('button', { name: 'Bookmark' })).toBeVisible();
  });

  it('moves between incorrect, unanswered and correct questions', async () => {
    const { store } = storeWithAttempt();
    const { user } = renderApp('/results/att-1/review', { store });
    await screen.findByRole('heading', { level: 1, name: 'Answer review' });

    await user.click(screen.getByRole('radio', { name: 'Unanswered (2)' }));
    expect(
      screen.getByRole('heading', { level: 2, name: /Question 4 · Not answered/ }),
    ).toHaveFocus();
    expect(screen.getByText('1 of 2')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(
      screen.getByRole('heading', { level: 2, name: /Question 5 · Not answered/ }),
    ).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

    await user.click(screen.getByRole('radio', { name: 'Correct (2)' }));
    expect(screen.getByRole('heading', { level: 2, name: /Question 1 · Correct/ })).toBeVisible();

    const grid = screen.getByRole('complementary', { name: 'All questions' });
    await user.click(within(grid).getByRole('button', { name: 'Question 3: correct' }));
    expect(screen.getByRole('heading', { level: 2, name: /Question 3 · Correct/ })).toBeVisible();
    expect(screen.getByRole('radio', { name: 'All (5)' })).toBeChecked();
  });

  it('bookmarks a question from the review', async () => {
    const { store } = storeWithAttempt();
    const { user } = renderApp('/results/att-1/review', { store });
    await user.click(await screen.findByRole('button', { name: 'Bookmark' }));
    expect(store.getSnapshot().data.bookmarks).toHaveProperty(q(1).id);
  });
});

describe('HistoryPage', () => {
  it('shows an empty state with no history', async () => {
    renderApp('/history');
    expect(await screen.findByRole('heading', { name: 'No exam attempts yet' })).toBeVisible();
  });

  it('lists past attempts with saved scores and opens their results', async () => {
    const { store } = storeWithAttempt();
    const { user } = renderApp('/history', { store });
    const link = await screen.findByRole('link', { name: /Shorter exam · 5 questions/ });
    expect(link).toHaveTextContent('40%');
    expect(link).toHaveTextContent('Benchmark not met (70%)');
    await user.click(link);
    expect(await screen.findByRole('heading', { level: 1, name: 'Exam results' })).toBeVisible();
  });
});
