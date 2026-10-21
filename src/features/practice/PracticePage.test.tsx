import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { QUESTION_BANK } from '@/content/questions';
import { renderApp, createTestStore } from '@/test/renderApp';

const TOTAL = QUESTION_BANK.length;
const D4_TOTAL = QUESTION_BANK.filter((q) => q.domain === 'D4').length;

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
    expect(screen.getByText(`${D4_TOTAL} questions match.`)).toBeVisible();
    expect(topic).toBeEnabled();

    await user.selectOptions(topic, '4.3');
    expect(screen.getByText('1 question matches.')).toBeVisible();

    await user.click(screen.getByRole('radio', { name: 'Hard' }));
    expect(screen.getByText(/No questions match these choices/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Start practice' })).toBeDisabled();
  });

  it('can exclude questions already answered', async () => {
    const store = createTestStore();
    store.recordAnswer({ questionId: 'clf-d4-0007', isCorrect: true, at: 1, sessionId: 's' });
    const { user } = renderApp('/practice', { store });
    await screen.findByRole('heading', { level: 1, name: 'Learning mode' });
    await user.selectOptions(screen.getByRole('combobox', { name: 'Domain' }), 'D4');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Topic' }), '4.3');
    await user.click(screen.getByRole('switch', { name: "Only questions I haven't answered" }));
    expect(screen.getByText(/No questions match/)).toBeVisible();
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
    expect(within(card).getByText(`2 of ${D4_TOTAL}`)).toBeVisible();
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

  it('disables review actions when there is nothing to review', async () => {
    renderApp('/practice');
    await screen.findByRole('heading', { level: 1, name: 'Learning mode' });
    expect(screen.getByRole('button', { name: 'Practise mistakes (0)' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Practise bookmarks (0)' })).toBeDisabled();
    expect(screen.getByRole('heading', { name: 'No sessions yet' })).toBeVisible();
  });
});
