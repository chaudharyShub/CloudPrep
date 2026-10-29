import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp, createTestStore } from '@/test/renderApp';
import { SESSION_PATH, type SessionSetup } from './sessionSetup';

// Real bank questions with known answers.
const SINGLE_ID = 'clf-d1-0001'; // correct: "Go global in minutes"
const MULTI_ID = 'clf-d2-0003'; // correct: permissions + encryption

function startSession(setup: Partial<SessionSetup> = {}, store = createTestStore()) {
  return renderApp(SESSION_PATH, {
    store,
    state: { setup: { label: 'Test session', questionIds: [SINGLE_ID], limit: null, ...setup } },
  });
}

describe('PracticeSessionPage', () => {
  it('redirects to Learning mode when opened without a valid setup', async () => {
    const { router } = renderApp(SESSION_PATH, { state: { setup: { label: 1 } } });
    expect(await screen.findByRole('heading', { level: 1, name: 'Learning mode' })).toBeVisible();
    expect(router.state.location.pathname).toBe('/practice');
  });

  it('does not reveal the answer or explanations before checking', async () => {
    startSession();
    await screen.findByRole('heading', { level: 1, name: 'Test session' });
    expect(screen.getByText('Question 1 of 1')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Check answer' })).toBeDisabled();
    expect(screen.queryByText(/your answer/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Correct\. You can deploy/)).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Correct' })).not.toBeInTheDocument();
  });

  it('checks a single-answer question, shows feedback for every option and records progress', async () => {
    const { user, store } = startSession();
    await screen.findByRole('heading', { level: 1, name: 'Test session' });

    await user.click(screen.getByRole('radio', { name: /Go global in minutes/ }));
    await user.click(screen.getByRole('button', { name: 'Check answer' }));

    const feedback = screen.getByRole('heading', { name: 'Correct' });
    expect(feedback).toHaveFocus();
    expect(screen.getByText('Correct · your answer')).toBeVisible();
    // Every option now shows its explanation.
    expect(screen.getByText(/paying only for what you consume/)).toBeVisible();
    expect(screen.getByText(/aggregated across many customers/)).toBeVisible();
    // Options are locked.
    expect(screen.getByRole('radio', { name: /Go global in minutes/ })).toBeDisabled();

    expect(store.getSnapshot().data.progress[SINGLE_ID]).toMatchObject({
      attempts: 1,
      correct: 1,
      lastResult: 'correct',
    });
  });

  it('lets learners select several options for multiple response, capped at the required number', async () => {
    const { user, store } = startSession({ questionIds: [MULTI_ID] });
    await screen.findByRole('heading', { level: 1, name: 'Test session' });
    expect(screen.getByText(/Select two answers/)).toBeVisible();

    const check = screen.getByRole('button', { name: 'Check answer' });
    await user.click(screen.getByRole('checkbox', { name: /Managing who has permission/ }));
    expect(screen.getByText('(1 of 2 selected)')).toBeVisible();
    expect(check).toBeDisabled();

    await user.click(screen.getByRole('checkbox', { name: /Maintaining the storage hardware/ }));
    expect(check).toBeEnabled();

    // A third selection is blocked.
    const third = screen.getByRole('checkbox', { name: /Securing the buildings/ });
    await user.click(third);
    expect(third).not.toBeChecked();

    await user.click(check);
    expect(screen.getByRole('heading', { name: 'Incorrect' })).toHaveFocus();
    expect(screen.getByText('Correct answer · not selected')).toBeVisible();
    expect(screen.getByText('Incorrect · your answer')).toBeVisible();
    expect(store.getSnapshot().data.progress[MULTI_ID]?.lastResult).toBe('incorrect');
  });

  it('toggles a bookmark and saves it', async () => {
    const { user, store } = startSession();
    await screen.findByRole('heading', { level: 1, name: 'Test session' });
    const bookmark = screen.getByRole('button', { name: 'Bookmark' });
    expect(bookmark).toHaveAttribute('aria-pressed', 'false');
    await user.click(bookmark);
    expect(screen.getByRole('button', { name: 'Bookmarked' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(store.getSnapshot().data.bookmarks).toHaveProperty(SINGLE_ID);
    await user.click(screen.getByRole('button', { name: 'Bookmarked' }));
    expect(store.getSnapshot().data.bookmarks).not.toHaveProperty(SINGLE_ID);
  });

  it('navigates between questions and finishes with a summary that can retry mistakes', async () => {
    const { user, store } = startSession({ questionIds: [SINGLE_ID, MULTI_ID] });
    await screen.findByRole('heading', { level: 1, name: 'Test session' });
    const nav = screen.getByRole('navigation', { name: 'Questions in this session' });
    expect(within(nav).getAllByRole('button')).toHaveLength(2);

    // Answer whichever question appears first, wrongly or rightly, then the other.
    for (let i = 0; i < 2; i++) {
      const radios = screen.queryAllByRole('radio');
      if (radios.length > 0) {
        await user.click(screen.getByRole('radio', { name: /Trade fixed expense/ })); // wrong
      } else {
        await user.click(screen.getByRole('checkbox', { name: /Managing who has permission/ }));
        await user.click(
          screen.getByRole('checkbox', { name: /Deciding whether and how to encrypt/ }),
        );
      }
      await user.click(screen.getByRole('button', { name: 'Check answer' }));
      const next = screen.queryByRole('button', { name: 'Next question' });
      if (next) await user.click(next);
    }
    await user.click(screen.getByRole('button', { name: 'Finish session' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Session complete' }),
    ).toHaveFocus();
    expect(screen.getByText('50% correct')).toBeVisible();
    expect(screen.getByText(/Correct answer: Go global in minutes/)).toBeVisible();
    await waitFor(() => {
      expect(store.getSnapshot().data.sessions).toHaveLength(1);
    });
    expect(store.getSnapshot().data.sessions[0]).toMatchObject({
      answered: 2,
      correct: 1,
      incorrectQuestionIds: [SINGLE_ID],
    });

    await user.click(screen.getByRole('button', { name: 'Retry incorrect (1)' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Retry: Test session' }),
    ).toBeVisible();
    expect(screen.getByText('Question 1 of 1')).toBeVisible();
    expect(screen.getByRole('radio', { name: /Go global in minutes/ })).not.toBeChecked();
  });

  it('asks for confirmation before ending a session with checked answers', async () => {
    const { user } = startSession({ questionIds: [SINGLE_ID, MULTI_ID] });
    await screen.findByRole('heading', { level: 1, name: 'Test session' });
    const radio = screen.queryAllByRole('radio')[0] ?? screen.getAllByRole('checkbox')[0];
    if (!radio) throw new Error('no options rendered');
    // Check an answer to the first question (whatever it is) by selecting enough options.
    const checkboxes = screen.queryAllByRole('checkbox');
    if (checkboxes.length > 0) {
      await user.click(checkboxes[0] as HTMLElement);
      await user.click(checkboxes[1] as HTMLElement);
    } else {
      await user.click(radio);
    }
    await user.click(screen.getByRole('button', { name: 'Check answer' }));

    await user.click(screen.getByRole('button', { name: 'End session' }));
    const dialog = screen.getByRole('dialog', { name: 'End this session?' });
    await user.click(within(dialog).getByRole('button', { name: 'Keep practising' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'End session' }));
    await user.click(
      within(screen.getByRole('dialog', { name: 'End this session?' })).getByRole('button', {
        name: 'End session',
      }),
    );
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Session complete' }),
    ).toBeVisible();
  });

  it('leaves immediately when nothing has been checked', async () => {
    const { user, router } = startSession();
    await screen.findByRole('heading', { level: 1, name: 'Test session' });
    await user.click(screen.getByRole('button', { name: 'End session' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Learning mode' })).toBeVisible();
    expect(router.state.location.pathname).toBe('/practice');
  });

  it('shows an empty state when none of the requested questions exist', async () => {
    startSession({ questionIds: ['clf-d9-9999'] });
    expect(await screen.findByRole('heading', { name: 'No questions to practise' })).toBeVisible();
  });

  it('AC-V.8 the answer sheet marks checked answers and jumps between questions', async () => {
    const { user } = startSession({ questionIds: [SINGLE_ID] });
    await screen.findByRole('heading', { level: 1, name: 'Test session' });
    const sheet = screen.getByRole('region', { name: 'Answer sheet' });
    expect(within(sheet).getByText('0 correct · 0 incorrect')).toBeVisible();
    expect(within(sheet).getByRole('button', { name: 'Question 1, not answered' })).toHaveAttribute(
      'aria-current',
      'step',
    );

    await user.click(screen.getByRole('radio', { name: /Trade fixed expense/ }));
    expect(
      within(sheet).getByRole('button', { name: 'Question 1, answer chosen, not checked' }),
    ).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Check answer' }));
    expect(within(sheet).getByRole('button', { name: 'Question 1, incorrect' })).toBeVisible();
    expect(within(sheet).getByText('0 correct · 1 incorrect')).toBeVisible();
    expect(within(sheet).getByRole('list', { name: 'Legend' })).toHaveTextContent(
      /Correct.*Incorrect.*Not checked yet.*Current/,
    );
  });

  it('AC-V.8 selecting a cell on the answer sheet opens that question', async () => {
    const { user } = startSession({ questionIds: [SINGLE_ID, MULTI_ID] });
    await screen.findByRole('heading', { level: 1, name: 'Test session' });
    const nav = screen.getByRole('navigation', { name: 'Questions in this session' });
    await user.click(within(nav).getByRole('button', { name: /^Question 2,/ }));
    expect(screen.getByText('Question 2 of 2')).toBeVisible();
    expect(within(nav).getByRole('button', { name: /^Question 2,/ })).toHaveAttribute(
      'aria-current',
      'step',
    );
  });
});
