import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { QUESTION_BANK } from '@/content/questions';
import { renderApp, createTestStore } from '@/test/renderApp';

// Counts come from the bank itself, so these tests keep working as questions are added.
const TOTAL = QUESTION_BANK.length;
const D4 = QUESTION_BANK.filter((q) => q.domain === 'D4');
const D4_TOPIC = D4.filter((q) => q.taskStatement === '4.3');
const D4_TOPIC_HARD = D4_TOPIC.filter((q) => q.difficulty === 'hard');
const matches = (n: number) => (n === 1 ? '1 question matches.' : `${n} questions match.`);

describe('PracticePage', () => {
  it('shows how many questions match and narrows by domain, topic and difficulty', async () => {
    const { user } = renderApp('/practice');
    await screen.findByRole('heading', { level: 1, name: 'Learning mode' });
    expect(
      screen.getByText(`${TOTAL} questions match; 10 will be picked at random.`),
    ).toBeVisible();

    const topic = screen.getByRole('combobox', { name: 'Topic' });
    expect(topic).toBeDisabled();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Domain' }), 'D4');
    expect(screen.getByText(new RegExp(`^${D4.length} questions match`))).toBeVisible();
    expect(topic).toBeEnabled();

    await user.selectOptions(topic, '4.3');
    expect(screen.getByText(new RegExp(`^${D4_TOPIC.length} questions? match`))).toBeVisible();
    expect(D4_TOPIC.length).toBeLessThan(D4.length);

    await user.click(screen.getByRole('radio', { name: 'Hard' }));
    expect(
      screen.getByText(new RegExp(`^${matches(D4_TOPIC_HARD.length).replace('.', '')}`)),
    ).toBeVisible();
  });

  it('can exclude questions already answered, and disables Start when nothing matches', async () => {
    const store = createTestStore();
    for (const question of D4_TOPIC) {
      store.recordAnswer({ questionId: question.id, isCorrect: true, at: 1, sessionId: 's' });
    }
    const { user } = renderApp('/practice', { store });
    await screen.findByRole('heading', { level: 1, name: 'Learning mode' });
    await user.selectOptions(screen.getByRole('combobox', { name: 'Domain' }), 'D4');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Topic' }), '4.3');
    await user.click(screen.getByRole('switch', { name: "Only questions I haven't answered" }));
    expect(screen.getByText(/No questions match/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Start practice' })).toBeDisabled();
  });

  it('starts a session from the setup form', async () => {
    const { user, router } = renderApp('/practice');
    await screen.findByRole('heading', { level: 1, name: 'Learning mode' });
    await user.selectOptions(screen.getByRole('combobox', { name: 'Domain' }), 'D4');
    await user.click(screen.getByRole('radio', { name: '5' }));
    await user.click(screen.getByRole('button', { name: 'Start practice' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Billing, Pricing, and Support' }),
    ).toBeVisible();
    expect(screen.getByText('Question 1 of 5')).toBeVisible();
    expect(router.state.location.pathname).toBe('/practice/session');
  });

  it('starts a domain session from a domain card', async () => {
    const { user } = renderApp('/practice');
    await screen.findByRole('heading', { level: 1, name: 'Learning mode' });
    await user.click(screen.getByRole('button', { name: 'Practise Security and Compliance' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Security and Compliance' }),
    ).toBeVisible();
    expect(screen.getByText('Question 1 of 10')).toBeVisible();
  });

  it('shows per-domain stats based on unique questions and latest answers', async () => {
    const store = createTestStore();
    store.recordAnswer({ questionId: 'clf-d4-0001', isCorrect: false, at: 1, sessionId: 's1' });
    store.recordAnswer({ questionId: 'clf-d4-0001', isCorrect: true, at: 2, sessionId: 's2' });
    store.recordAnswer({ questionId: 'clf-d4-0002', isCorrect: false, at: 3, sessionId: 's2' });
    renderApp('/practice', { store });
    await screen.findByRole('heading', { level: 1, name: 'Learning mode' });

    const card = screen.getByRole('heading', { level: 3, name: 'Billing, Pricing, and Support' })
      .parentElement as HTMLElement;
    expect(within(card).getByText(`2 of ${D4.length}`)).toBeVisible();
    expect(within(card).getByText('50%')).toBeVisible();
  });

  it('lists mistakes and bookmarks and practises them', async () => {
    const store = createTestStore();
    store.recordAnswer({ questionId: 'clf-d1-0001', isCorrect: false, at: 1, sessionId: 's1' });
    store.toggleBookmark('clf-d3-0002', 1);
    store.toggleBookmark('clf-d3-0003', 2);
    const { user } = renderApp('/practice', { store });
    await screen.findByRole('heading', { level: 1, name: 'Learning mode' });

    expect(screen.getByRole('button', { name: 'Practise bookmarks (2)' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Practise mistakes (1)' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Mistakes' })).toBeVisible();
    expect(screen.getByText('Question 1 of 1')).toBeVisible();
  });

  it('AC-R.5 shows questions due for review and practises the most important ones', async () => {
    const store = createTestStore();
    const now = Date.now();
    const DAY = 86_400_000;
    // 12 due: answered wrong 2 days ago. One not due yet: answered right just now.
    const due = QUESTION_BANK.slice(0, 12);
    for (const question of due) {
      store.recordAnswer({
        questionId: question.id,
        isCorrect: false,
        at: now - 2 * DAY,
        sessionId: 'old',
      });
    }
    const notDue = QUESTION_BANK[12]?.id ?? '';
    store.recordAnswer({ questionId: notDue, isCorrect: true, at: now, sessionId: 'today' });
    const { user } = renderApp('/practice', { store });
    await screen.findByRole('heading', { level: 1, name: 'Learning mode' });

    expect(screen.getByText('12 questions due today.')).toBeVisible();
    // One session holds up to the default practice length (10).
    await user.click(screen.getByRole('button', { name: 'Review due questions (12)' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Review due' })).toBeVisible();
    expect(screen.getByText('Question 1 of 10')).toBeVisible();
  });

  it('AC-R.5 says when the next review is once nothing is due', async () => {
    const store = createTestStore();
    store.recordAnswer({
      questionId: 'clf-d1-0001',
      isCorrect: false,
      at: Date.now(),
      sessionId: 's1',
    });
    renderApp('/practice', { store });
    await screen.findByRole('heading', { level: 1, name: 'Learning mode' });
    expect(screen.getByText('Nothing due today. Next review tomorrow.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Review due questions (0)' })).toBeDisabled();
  });

  it('disables review actions when there is nothing to review', async () => {
    renderApp('/practice');
    await screen.findByRole('heading', { level: 1, name: 'Learning mode' });
    expect(screen.getByRole('button', { name: 'Review due questions (0)' })).toBeDisabled();
    expect(
      screen.getByText('Answer questions here or in a mock exam to start your review schedule.'),
    ).toBeVisible();
  });

  it('AC-I.4 explains Review due from the "i" beside its heading', async () => {
    const { user } = renderApp('/practice');
    await screen.findByRole('heading', { level: 1, name: 'Learning mode' });
    // The button sits beside the heading, so the heading's name stays "Review due".
    expect(screen.getByRole('heading', { level: 3, name: 'Review due' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'About Review due' }));
    expect(screen.getByText(/after 1, 3, 7, 21 and then 60 days/)).toBeVisible();
    expect(screen.getByText(/A wrong answer brings it back the next day/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Practise mistakes (0)' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Practise bookmarks (0)' })).toBeDisabled();
    expect(screen.getByRole('heading', { name: 'No sessions yet' })).toBeVisible();
  });
});
