import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createFakeAuthClient } from '@/backend/fakeAuth';
import { CLF_C02, SAA_C03, type ExamGuide } from '@/domain/exam-guide';
import { buildAttempt } from '@/domain/exam/attempt';
import { shortExamConfig } from '@/domain/exam/config';
import { createExamSession, examReducer, type ExamSession } from '@/domain/exam/session';
import type { QuestionBank } from '@/state/questionBank';
import { DVA_TEST_BANK, SAA_TEST_BANK, TEST_BANK } from '@/test/bank';
import { createTestStore, renderApp } from '@/test/renderApp';

const BANKS = [TEST_BANK, SAA_TEST_BANK, DVA_TEST_BANK];

/** An exam session of `exam` over the first `count` questions of `bank`. */
function session(exam: ExamGuide, bank: QuestionBank, id: string, count = 2): ExamSession {
  return createExamSession({
    id,
    config: shortExamConfig(exam, count),
    bankVersion: bank.version,
    seed: 1,
    startedAt: Date.now() - 60_000,
    questions: bank.examQuestions.questions.slice(0, count),
    shuffleOptions: false,
  });
}

/** Stores a submitted attempt of `exam`. */
function addAttempt(
  store: ReturnType<typeof createTestStore>,
  exam: ExamGuide,
  bank: QuestionBank,
  id: string,
) {
  const submitted = examReducer(session(exam, bank, id), {
    type: 'submit',
    at: Date.now(),
    reason: 'manual',
  });
  const attempt = buildAttempt(submitted, bank.examQuestions.byId, 70);
  store.completeExam(attempt, bank.examQuestions.questions.slice(0, 2));
  return attempt;
}

/** The always-rendered desktop sidebar navigation. */
function sidebarNav() {
  const [first] = screen.getAllByRole('navigation', { name: 'Main' });
  if (!first) throw new Error('Main navigation not found');
  return first;
}

describe('exam addresses (D-066)', () => {
  it('AC-M.2 opens an exam’s pages under its id, with that exam’s guide', async () => {
    renderApp('/saa-c03/practice', { banks: BANKS });
    expect(await screen.findByRole('heading', { level: 1, name: 'Learning mode' })).toBeVisible();
    expect(screen.getByText(/Practise SAA-C03 by domain or topic/)).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Design Secure Architectures' }),
    ).toBeVisible();
    expect(screen.queryByText('Cloud Concepts')).not.toBeInTheDocument();
  });

  it('AC-M.2 shows the not-found page for an unknown exam', async () => {
    renderApp('/sap-c02/practice', { banks: BANKS });
    expect(await screen.findByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
  });

  it('AC-M.2 AC-M.3 sends old addresses to the exam used last, keeping the search string', async () => {
    const first = renderApp('/practice?x=1', { banks: BANKS });
    await screen.findByRole('heading', { level: 1, name: 'Learning mode' });
    expect(first.router.state.location.pathname).toBe('/clf-c02/practice');
    expect(first.router.state.location.search).toBe('?x=1');
    first.unmount();

    const store = createTestStore();
    store.setPreferences({ exam: 'saa-c03' });
    const second = renderApp('/progress', { banks: BANKS, store });
    await screen.findByRole('heading', { level: 1, name: 'Progress' });
    expect(second.router.state.location.pathname).toBe('/saa-c03/progress');
  });

  it('AC-M.2 opens an old result address under the exam the attempt belongs to', async () => {
    const store = createTestStore();
    const attempt = addAttempt(store, SAA_C03, SAA_TEST_BANK, 'saa-attempt');
    const { router } = renderApp(`/results/${attempt.id}`, { banks: BANKS, store });
    expect(await screen.findByRole('heading', { level: 1, name: 'Exam results' })).toBeVisible();
    expect(router.state.location.pathname).toBe('/saa-c03/results/saa-attempt');
  });
});

describe('choosing an exam (D-066)', () => {
  it('AC-M.3 switches to the same page of another exam and remembers it', async () => {
    const { router, store, user } = renderApp('/clf-c02/practice', { banks: BANKS });
    await screen.findByRole('heading', { level: 1, name: 'Learning mode' });
    const picker = within(sidebarNav()).getByRole('combobox', { name: 'Exam' });
    expect(picker).toHaveValue('clf-c02');

    await user.selectOptions(picker, 'SAA-C03 · Solutions Architect');
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/saa-c03/practice');
    });
    expect(store.getSnapshot().data.preferences.exam).toBe('saa-c03');
    expect(within(sidebarNav()).getByRole('link', { name: 'Mock exam' })).toHaveAttribute(
      'href',
      '/saa-c03/exam',
    );
  });

  it('AC-M.3 shared pages keep the exam used last in the navigation', async () => {
    const store = createTestStore();
    store.setPreferences({ exam: 'dva-c03' });
    renderApp('/settings', { banks: BANKS, store });
    await screen.findByRole('heading', { level: 1, name: 'Settings' });
    expect(within(sidebarNav()).getByRole('link', { name: 'Learning mode' })).toHaveAttribute(
      'href',
      '/dva-c03/practice',
    );
    expect(screen.getAllByText('DVA-C03 practice')[0]).toBeVisible();
  });

  it('AC-M.3 visiting an exam’s page makes it the exam used last', async () => {
    const { store } = renderApp('/dva-c03/bookmarks', { banks: BANKS });
    await screen.findByRole('heading', { level: 1, name: 'Bookmarks' });
    await waitFor(() => {
      expect(store.getSnapshot().data.preferences.exam).toBe('dva-c03');
    });
  });

  it('AC-M.3 each exam has its own landing page with its facts, and offers the others', async () => {
    renderApp('/saa-c03', { banks: BANKS, auth: createFakeAuthClient() });
    expect(
      await screen.findByText('AWS Certified Solutions Architect – Associate · practice'),
    ).toBeVisible();
    expect(screen.getByText(/65 questions, 130 minutes/)).toBeVisible();
    expect(screen.getByText(/before it costs you \$150/)).toBeVisible();
    const chooser = screen.getByRole('region', { name: 'Choose your exam' });
    const links = within(chooser).getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/clf-c02',
      '/saa-c03',
      '/dva-c03',
    ]);
    expect(within(chooser).getByRole('link', { current: 'page' })).toHaveAttribute(
      'href',
      '/saa-c03',
    );
    expect(screen.getByRole('link', { name: 'Start practising — free' })).toHaveAttribute(
      'href',
      '/saa-c03/practice',
    );
  });

  it('AC-M.13 choosing another exam on the landing page keeps the scroll position', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/saa-c03', { banks: BANKS, auth: createFakeAuthClient() });
    const chooser = await screen.findByRole('region', { name: 'Choose your exam' });
    const scrollTo = vi.spyOn(window, 'scrollTo');
    await user.click(within(chooser).getByRole('link', { name: /DVA-C03/ }));
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/dva-c03');
    });
    expect(scrollTo).not.toHaveBeenCalledWith(0, 0);
    scrollTo.mockRestore();
  });

  it('AC-M.3 signed-in visitors of an exam’s page go to its dashboard', async () => {
    const { router } = renderApp('/dva-c03', { banks: BANKS });
    expect(await screen.findByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
    expect(router.state.location.pathname).toBe('/dva-c03/dashboard');
    expect(screen.getByText(/AWS Certified Developer – Associate \(DVA-C03\)/)).toBeVisible();
  });
});

describe('data per exam (D-066)', () => {
  it('AC-M.5 history, dashboard and bookmarks show only the current exam’s data', async () => {
    const store = createTestStore();
    addAttempt(store, CLF_C02, TEST_BANK, 'clf-attempt');
    addAttempt(store, SAA_C03, SAA_TEST_BANK, 'saa-attempt');
    const saaQuestion = SAA_TEST_BANK.practice.questions[0];
    const clfQuestion = TEST_BANK.practice.questions[0];
    if (!saaQuestion || !clfQuestion) throw new Error('missing questions');
    store.toggleBookmark(saaQuestion.id, 1);
    store.toggleBookmark(clfQuestion.id, 2);

    const view = renderApp('/saa-c03/history', { banks: BANKS, store });
    await screen.findByRole('heading', { level: 1, name: 'Exam history' });
    const links = screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'))
      .filter((href) => href?.includes('/results/'));
    expect(links).toEqual(['/saa-c03/results/saa-attempt']);
    view.unmount();

    renderApp('/saa-c03/bookmarks', { banks: BANKS, store });
    await screen.findByRole('heading', { level: 1, name: 'Bookmarks' });
    expect(screen.getByRole('button', { name: 'Practise bookmarks (1)' })).toBeVisible();
    expect(screen.getByText(saaQuestion.stem)).toBeVisible();
  });

  it('AC-M.5 a result of another exam is not found under this exam', async () => {
    const store = createTestStore();
    addAttempt(store, SAA_C03, SAA_TEST_BANK, 'saa-attempt');
    renderApp('/clf-c02/results/saa-attempt', { banks: BANKS, store });
    expect(await screen.findByText('Results not found')).toBeVisible();
  });
});

describe('one exam at a time (D-066)', () => {
  it('AC-M.7 another exam’s page offers to resume the exam in progress, not a new one', async () => {
    const store = createTestStore();
    store.startExam(session(CLF_C02, TEST_BANK, 'clf-running', 5));
    const { router, user } = renderApp('/saa-c03/exam', { banks: BANKS, store });
    expect(await screen.findByText('You have a CLF-C02 exam in progress')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Start full exam' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Resume exam' }));
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/clf-c02/exam/session');
    });
  });

  it('AC-M.7 opens the exam in progress under its own exam’s address', async () => {
    const store = createTestStore();
    store.startExam(session(SAA_C03, SAA_TEST_BANK, 'saa-running', 3));
    const { router } = renderApp('/clf-c02/exam/session', { banks: BANKS, store });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/saa-c03/exam/session');
    });
    expect(await screen.findByText('SAA-C03 · 0 of 3 answered')).toBeVisible();
  });

  it('AC-M.4 AC-M.7 starts an SAA-C03 exam with its own length and time', async () => {
    const { router, store, user } = renderApp('/saa-c03/exam', { banks: BANKS });
    await screen.findByRole('heading', { level: 1, name: 'Mock exam' });
    expect(screen.getByText(/with 720 needed to pass/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Start full exam' }));
    await user.click(await screen.findByRole('button', { name: 'Start exam' }));
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/saa-c03/exam/session');
    });
    const active = store.getSnapshot().data.activeExam;
    expect(active?.examId).toBe('saa-c03');
    expect(active?.questionIds).toHaveLength(65);
    expect(active?.questionIds.every((id) => id.startsWith('saa-'))).toBe(true);
    expect(active ? active.endsAt - active.startedAt : 0).toBe(130 * 60_000);
  });
});
