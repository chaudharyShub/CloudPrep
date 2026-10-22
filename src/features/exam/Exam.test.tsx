import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createAppStore } from '@/storage/store';
import { createMemoryDriver } from '@/storage/driver';
import { createTestStore, renderApp } from '@/test/renderApp';
import { examQuestion, makeExam } from '@/test/exam';

const MIN = 60_000;

function storeWithExam(exam = makeExam()) {
  const store = createTestStore();
  store.startExam(exam);
  return store;
}

/** The desktop control (the mobile bar duplicates some buttons; jsdom applies no CSS). */
function desktopButton(name: string) {
  const [first] = screen.getAllByRole('button', { name });
  if (!first) throw new Error(`No ${name} button`);
  return first;
}

function navigatorButton(name: RegExp) {
  const panel = screen.getByRole('complementary', { name: 'Question navigation' });
  return within(panel).getByRole('button', { name });
}

describe('exam start page', () => {
  // The "full exam not available yet" state is tested with a small bank in ExamUnavailable.test.tsx.
  it('offers the full exam when the bank has enough questions in every domain', async () => {
    renderApp('/exam');
    expect(await screen.findByRole('button', { name: 'Start full exam' })).toBeEnabled();
    expect(screen.queryByText("The full exam isn't available yet")).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Start shorter exam' })).not.toBeInTheDocument();
  });

  it('starts the timer only after confirmation', async () => {
    const { user, store, router } = renderApp('/exam');
    await user.click(await screen.findByRole('button', { name: 'Start full exam' }));
    const dialog = screen.getByRole('dialog', { name: 'Start the full exam?' });
    expect(dialog).toHaveAccessibleDescription(/65 questions, 90 minutes/);

    await user.click(within(dialog).getByRole('button', { name: 'Not yet' }));
    expect(store.getSnapshot().data.activeExam).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Start full exam' }));
    const before = Date.now();
    await user.click(screen.getByRole('button', { name: 'Start exam' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Question 1 of 65' }),
    ).toBeVisible();
    expect(router.state.location.pathname).toBe('/exam/session');
    const exam = store.getSnapshot().data.activeExam;
    expect(exam?.questionIds).toHaveLength(65);
    expect(new Set(exam?.questionIds).size).toBe(65);
    expect((exam?.endsAt ?? 0) - (exam?.startedAt ?? 0)).toBe(90 * MIN);
    expect(exam?.startedAt).toBeGreaterThanOrEqual(before);
    expect(screen.getByRole('timer')).toHaveTextContent(/^1:(30:00|29:\d\d)$/);
  });

  it('offers to resume or discard an exam in progress', async () => {
    const store = storeWithExam();
    const { user } = renderApp('/exam', { store });
    expect(await screen.findByText('You have an exam in progress')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Start full exam' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Discard' }));
    await user.click(
      within(screen.getByRole('dialog', { name: 'Discard this exam?' })).getByRole('button', {
        name: 'Discard exam',
      }),
    );
    expect(store.getSnapshot().data.activeExam).toBeNull();
    expect(store.getSnapshot().data.attempts).toEqual([]);
  });
});

describe('exam session', () => {
  it('redirects to the start page when there is no exam', async () => {
    const { router } = renderApp('/exam/session');
    await screen.findByRole('heading', { level: 1, name: 'Mock exam' });
    expect(router.state.location.pathname).toBe('/exam');
  });

  it('never puts correct answers or explanations in the page before submission', async () => {
    const { container } = renderApp('/exam/session', { store: storeWithExam() });
    await screen.findByRole('heading', { level: 1, name: 'Question 1 of 5' });
    const html = container.ownerDocument.body.innerHTML;
    const question = examQuestion(0);
    expect(html).toContain(question.stem);
    expect(html).not.toContain(question.explanation);
    for (const option of question.options) expect(html).not.toContain(option.explanation);
    expect(screen.queryByText(/your answer/i)).not.toBeInTheDocument();
  });

  it('saves single answers immediately and shows question status in the navigator', async () => {
    const store = storeWithExam();
    const { user } = renderApp('/exam/session', { store });
    await screen.findByRole('heading', { level: 1, name: 'Question 1 of 5' });
    const q0 = examQuestion(0);

    await user.click(screen.getByRole('radio', { name: /Trade fixed expense/ }));
    await user.click(screen.getByRole('radio', { name: /Go global in minutes/ }));
    expect(store.getSnapshot().data.activeExam?.answers[q0.id]).toEqual(['a']);
    expect(navigatorButton(/^Question 1: answered$/)).toHaveAttribute('aria-current', 'step');
    expect(screen.getByText('1 of 5 answered')).toBeVisible();
  });

  it('handles multiple-response questions: count shown, partial state, cap enforced', async () => {
    const store = storeWithExam();
    const { user } = renderApp('/exam/session', { store });
    await screen.findByRole('heading', { level: 1, name: 'Question 1 of 5' });

    await user.click(navigatorButton(/^Question 3:/));
    expect(await screen.findByRole('heading', { level: 1, name: 'Question 3 of 5' })).toHaveFocus();
    expect(screen.getByText(/Select two answers/)).toBeVisible();
    expect(screen.getByText('(0 of 2 selected)')).toBeVisible();

    const boxes = screen.getAllByRole('checkbox');
    await user.click(boxes[0] as HTMLElement);
    expect(navigatorButton(/^Question 3: partly answered$/)).toBeVisible();
    await user.click(boxes[1] as HTMLElement);
    await user.click(boxes[2] as HTMLElement); // blocked: already two selected
    expect(boxes[2]).not.toBeChecked();
    expect(navigatorButton(/^Question 3: answered$/)).toBeVisible();
    expect(store.getSnapshot().data.activeExam?.answers[examQuestion(2).id]).toEqual(['a', 'b']);
  });

  it('flags questions and moves with Previous and Next', async () => {
    const store = storeWithExam();
    const { user } = renderApp('/exam/session', { store });
    await screen.findByRole('heading', { level: 1, name: 'Question 1 of 5' });

    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Flag for review' }));
    expect(screen.getByRole('button', { name: 'Flagged' })).toHaveAttribute('aria-pressed', 'true');
    expect(navigatorButton(/^Question 1: not answered, flagged$/)).toBeVisible();

    await user.click(desktopButton('Next'));
    expect(await screen.findByRole('heading', { level: 1, name: 'Question 2 of 5' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Previous' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Question 1 of 5' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Flagged' }));
    expect(store.getSnapshot().data.activeExam?.flagged).toEqual([]);
  });

  it('opens the question list in a dialog on small screens', async () => {
    const { user } = renderApp('/exam/session', { store: storeWithExam() });
    await screen.findByRole('heading', { level: 1, name: 'Question 1 of 5' });
    await user.click(screen.getByRole('button', { name: '1 / 5: open question list' }));
    const dialog = screen.getByRole('dialog', { name: 'Questions' });
    await user.click(within(dialog).getByRole('button', { name: /^Question 4:/ }));
    expect(screen.queryByRole('dialog', { name: 'Questions' })).not.toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 1, name: 'Question 4 of 5' })).toBeVisible();
  });

  it('shows an accessible warning when time is low', async () => {
    const exam = makeExam({ startedAt: Date.now() - 7 * MIN + 4 * MIN }); // ~4 minutes left
    renderApp('/exam/session', { store: storeWithExam(exam) });
    await screen.findByRole('heading', { level: 1, name: 'Question 1 of 5' });
    expect(screen.getByText('Less than 5 minutes remaining.')).toBeInTheDocument();
    expect(screen.getByText('Low time')).toBeInTheDocument();
  });
});

describe('review and submission', () => {
  it('lists statuses, filters unanswered questions and jumps back to one', async () => {
    const q0 = examQuestion(0).id;
    const store = storeWithExam(
      makeExam({
        actions: [
          { type: 'select', questionId: q0, optionId: 'a', at: Date.now() },
          { type: 'toggleFlag', questionId: q0, at: Date.now() },
        ],
      }),
    );
    const { user } = renderApp('/exam/review', { store });
    await screen.findByRole('heading', { level: 1, name: 'Review your answers' });
    expect(screen.getAllByRole('listitem').filter((li) => li.querySelector('button'))).toHaveLength(
      5,
    );

    await user.click(screen.getByRole('radio', { name: 'Not answered (4)' }));
    const rows = screen.getAllByRole('button', { name: /^\d\./ });
    expect(rows).toHaveLength(4);
    await user.click(rows[1] as HTMLElement); // question 3
    expect(await screen.findByRole('heading', { level: 1, name: 'Question 3 of 5' })).toBeVisible();
  });

  it('confirms before submitting, shows counts, and allows returning to the exam', async () => {
    const q0 = examQuestion(0).id;
    const store = storeWithExam(
      makeExam({ actions: [{ type: 'toggleFlag', questionId: q0, at: Date.now() }] }),
    );
    const { user } = renderApp('/exam/session', { store });
    await screen.findByRole('heading', { level: 1, name: 'Question 1 of 5' });

    await user.click(screen.getByRole('button', { name: 'Finish exam' }));
    const dialog = screen.getByRole('dialog', { name: 'Submit your exam?' });
    expect(
      within(dialog).getByText("5 questions aren't fully answered. These are scored as incorrect."),
    ).toBeVisible();
    expect(within(dialog).getByText(/1 question is flagged/)).toBeVisible();
    expect(store.getSnapshot().data.activeExam?.status).toBe('confirming');

    await user.click(within(dialog).getByRole('button', { name: 'Return to exam' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(store.getSnapshot().data.activeExam?.status).toBe('in_progress');
  });

  it('submits once, stores the attempt and shows results with explanations', async () => {
    const store = storeWithExam();
    const { user, router } = renderApp('/exam/session', { store });
    await screen.findByRole('heading', { level: 1, name: 'Question 1 of 5' });
    await user.click(screen.getByRole('radio', { name: /Go global in minutes/ }));

    await user.click(screen.getByRole('button', { name: 'Finish exam' }));
    await user.dblClick(screen.getByRole('button', { name: 'Submit exam' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Exam results' })).toBeVisible();
    expect(router.state.location.pathname).toBe('/results/exam-test');
    expect(store.getSnapshot().data.attempts).toHaveLength(1);
    expect(store.getSnapshot().data.activeExam).toBeNull();
    expect(screen.getByText('1 of 5 questions correct')).toBeVisible();
    expect(screen.getByText('Practice benchmark not met (70%)')).toBeVisible();

    // Explanations are available after submission.
    await user.click(screen.getByRole('link', { name: 'Review all answers' }));
    await user.click(await screen.findByRole('radio', { name: 'Correct (1)' }));
    expect(screen.getByText(examQuestion(0).explanation)).toBeVisible();
  });
});

describe('interruption recovery', () => {
  it('restores answers, flags and the current question after a reload', async () => {
    const driver = createMemoryDriver();
    const first = createAppStore({ driver, persistent: true });
    first.startExam(makeExam());
    const view = renderApp('/exam/session', { store: first });
    await screen.findByRole('heading', { level: 1, name: 'Question 1 of 5' });
    await view.user.click(screen.getByRole('radio', { name: /Go global in minutes/ }));
    await view.user.click(screen.getByRole('button', { name: 'Flag for review' }));
    await view.user.click(desktopButton('Next'));
    await screen.findByRole('heading', { level: 1, name: 'Question 2 of 5' });
    view.unmount();

    // "Reload": a new store reading the same storage.
    const second = createAppStore({ driver, persistent: true });
    const { user } = renderApp('/exam/session', { store: second });
    expect(await screen.findByRole('heading', { level: 1, name: 'Question 2 of 5' })).toBeVisible();
    expect(navigatorButton(/^Question 1: answered, flagged$/)).toBeVisible();
    await user.click(navigatorButton(/^Question 1:/));
    expect(await screen.findByRole('radio', { name: /Go global in minutes/ })).toBeChecked();
  });

  it('submits an exam that expired while the app was closed', async () => {
    const expired = makeExam({ startedAt: Date.now() - 3 * 60 * MIN });
    const store = storeWithExam(expired);
    const { router } = renderApp('/exam/session', { store });
    expect(await screen.findByRole('heading', { level: 1, name: 'Exam results' })).toBeVisible();
    expect(screen.getByText(/ended while CloudPrep was closed/)).toBeVisible();
    expect(router.state.location.pathname).toBe('/results/exam-test');
    expect(store.getSnapshot().data.attempts[0]?.submitReason).toBe('expired_while_away');
  });

  it('submits an expired exam found while on another page and says so', async () => {
    const store = storeWithExam(makeExam({ startedAt: Date.now() - 3 * 60 * MIN }));
    renderApp('/dashboard', { store });
    expect(await screen.findByText('Your exam time ran out')).toBeVisible();
    expect(store.getSnapshot().data.attempts).toHaveLength(1);
  });

  it('auto-submits when the timer reaches zero during the exam', async () => {
    // Ends ~1.5 s from now; the 5-question exam lasts 7 minutes.
    const exam = makeExam({ startedAt: Date.now() - 7 * MIN + 1500 });
    const store = storeWithExam(exam);
    renderApp('/exam/session', { store });
    await screen.findByRole('heading', { level: 1, name: 'Question 1 of 5' });
    await waitFor(
      () => {
        expect(screen.getByRole('heading', { level: 1, name: 'Exam results' })).toBeVisible();
      },
      { timeout: 5000 },
    );
    expect(screen.getByText(/submitted automatically when the timer reached zero/)).toBeVisible();
    expect(store.getSnapshot().data.attempts).toHaveLength(1);
    expect(store.getSnapshot().data.attempts[0]?.submitReason).toBe('time_expired');
  });
});
