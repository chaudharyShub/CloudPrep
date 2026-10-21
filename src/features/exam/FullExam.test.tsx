import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderApp } from '@/test/renderApp';

// The real bank is too small for a 65-question exam, so this journey uses a generated
// bank with enough questions in every domain (16 / 19 / 22 / 8 needed).
vi.mock('@/content/questions', async () => {
  const { FULL_BANK } = await import('@/test/fixtures/bank');
  return { BANK_VERSION: 'qa-full', QUESTION_BANK: FULL_BANK };
});

const MIN = 60_000;

function navigatorButton(name: RegExp) {
  const panel = screen.getByRole('complementary', { name: 'Question navigation' });
  return within(panel).getByRole('button', { name });
}

describe('QA journey C: full 65-question exam', () => {
  it('runs a full exam: 65 unique questions, 90 minutes, answer, change, flag, navigate, review, submit and score', async () => {
    const { user, store } = renderApp('/exam');
    await user.click(await screen.findByRole('button', { name: 'Start full exam' }));
    await user.click(screen.getByRole('button', { name: 'Start exam' }));
    await screen.findByRole('heading', { level: 1, name: 'Question 1 of 65' });

    const exam = store.getSnapshot().data.activeExam;
    if (!exam) throw new Error('No exam started');
    expect(exam.questionIds).toHaveLength(65);
    expect(new Set(exam.questionIds).size).toBe(65);
    expect(exam.endsAt - exam.startedAt).toBe(90 * MIN);
    expect(screen.getByRole('timer')).toHaveTextContent(/^1:(30|29):\d\d$/);

    // Domain split follows the exam guide weights.
    const domains = exam.questionIds.map((id) => /^clf-d(\d)/.exec(id)?.[1]);
    const count = (d: string) => domains.filter((x) => x === d).length;
    expect([count('1'), count('2'), count('3'), count('4')]).toEqual([16, 19, 22, 8]);

    /** Answers the current question correctly ("Right…" options) or wrongly. */
    const answer = async (correct: boolean) => {
      const radios = screen.queryAllByRole('radio', { name: /^(Right|Wrong)/ });
      if (radios.length > 0) {
        await user.click(screen.getByRole('radio', { name: correct ? /^Right/ : /^Wrong one/ }));
        return;
      }
      if (correct) {
        await user.click(screen.getByRole('checkbox', { name: /^Right A/ }));
        await user.click(screen.getByRole('checkbox', { name: /^Right B/ }));
      } else {
        await user.click(screen.getByRole('checkbox', { name: /^Right A/ }));
        await user.click(screen.getByRole('checkbox', { name: /^Wrong C/ }));
      }
    };

    // Q1: answer wrongly, then change to the correct answer.
    await answer(false);
    const q1 = exam.questionIds[0] ?? '';
    const isMulti = screen.queryAllByRole('checkbox').length > 0;
    if (isMulti) {
      await user.click(screen.getByRole('checkbox', { name: /^Wrong C/ }));
      await user.click(screen.getByRole('checkbox', { name: /^Right B/ }));
    } else {
      await user.click(screen.getByRole('radio', { name: /^Right/ }));
    }
    expect(store.getSnapshot().data.activeExam?.answers[q1]?.length).toBeGreaterThan(0);

    // Flag and unflag.
    await user.click(screen.getByRole('button', { name: 'Flag for review' }));
    expect(navigatorButton(/^Question 1: answered, flagged$/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Flagged' }));
    expect(navigatorButton(/^Question 1: answered$/)).toBeVisible();

    // Grid navigation: jump to question 40 and answer it wrongly; flag it.
    await user.click(navigatorButton(/^Question 40:/));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Question 40 of 65' }),
    ).toHaveFocus();
    await answer(false);
    await user.click(screen.getByRole('button', { name: 'Flag for review' }));

    // Question 65 correct.
    await user.click(navigatorButton(/^Question 65:/));
    await screen.findByRole('heading', { level: 1, name: 'Question 65 of 65' });
    await answer(true);

    // Final review, then return to the exam.
    await user.click(screen.getAllByRole('link', { name: 'Review all' })[0] as HTMLElement);
    await screen.findByRole('heading', { level: 1, name: 'Review your answers' });
    expect(screen.getByRole('radio', { name: 'Not answered (62)' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Flagged (1)' })).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Flagged (1)' }));
    await user.click(screen.getByRole('button', { name: /^40\./ }));
    await screen.findByRole('heading', { level: 1, name: 'Question 40 of 65' });

    // Submit.
    await user.click(screen.getByRole('button', { name: 'Finish exam' }));
    const dialog = screen.getByRole('dialog', { name: 'Submit your exam?' });
    expect(within(dialog).getByText(/62 questions aren't fully answered/)).toBeVisible();
    await user.click(within(dialog).getByRole('button', { name: 'Submit exam' }));

    // Results: 2 correct (Q1 after the change, Q65), 1 incorrect, 62 unanswered = incorrect.
    expect(await screen.findByRole('heading', { level: 1, name: 'Exam results' })).toBeVisible();
    expect(screen.getByText('2 of 65 questions correct')).toBeVisible();
    const attempt = store.getSnapshot().data.attempts[0];
    expect(attempt?.summary).toMatchObject({ total: 65, correct: 2, incorrect: 1, unanswered: 62 });
    expect(store.getSnapshot().data.attempts).toHaveLength(1);

    // Domain breakdown adds up to the exam split.
    const table = screen.getByRole('table', { name: 'Results by exam domain' });
    expect(within(table).getByRole('row', { name: /Cloud Concepts/ })).toHaveTextContent(/\/16/);
    expect(within(table).getByRole('row', { name: /Billing/ })).toHaveTextContent(/\/8/);
  }, 30_000); // A long journey: allow time when the whole suite runs in parallel.
});
