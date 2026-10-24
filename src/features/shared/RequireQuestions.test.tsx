import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { makeExam } from '@/test/exam';
import { TEST_BANK } from '@/test/bank';
import { createTestStore, renderApp } from '@/test/renderApp';
import type { BankSnapshot, QuestionLoader } from '@/state/questionLoader';

const current: BankSnapshot = {
  version: TEST_BANK.version,
  questions: TEST_BANK.practice.questions,
};

/** A loader whose download the test resolves or rejects by hand. */
function controlledLoader(cached: BankSnapshot | null = null) {
  let resolve: (bank: BankSnapshot) => void = () => undefined;
  let reject: (error: Error) => void = () => undefined;
  const latest = vi.fn(
    () =>
      new Promise<BankSnapshot>((res, rej) => {
        resolve = res;
        reject = rej;
      }),
  );
  const loader: QuestionLoader = { cached: () => Promise.resolve(cached), latest };
  return {
    loader,
    latest,
    resolve: (bank: BankSnapshot) => {
      resolve(bank);
    },
    reject: (error: Error) => {
      reject(error);
    },
  };
}

describe('loading questions', () => {
  it('AC-B.14 pages wait for the first download, then show', async () => {
    const control = controlledLoader();
    renderApp('/practice', { questions: control.loader });
    expect(await screen.findByText('Loading questions…')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1, name: 'Learning mode' })).toBeNull();
    control.resolve(current);
    expect(await screen.findByRole('heading', { level: 1, name: 'Learning mode' })).toBeVisible();
  });

  it('AC-B.14 explains a failed download and retries', async () => {
    const control = controlledLoader();
    const { user } = renderApp('/practice', { questions: control.loader });
    await waitFor(() => {
      expect(control.latest).toHaveBeenCalledTimes(1);
    });
    control.reject(new Error('Failed to fetch'));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Questions unavailable' }),
    ).toBeVisible();
    expect(screen.getByText(/Failed to fetch/)).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => {
      expect(control.latest).toHaveBeenCalledTimes(2);
    });
    control.resolve(current);
    expect(await screen.findByRole('heading', { level: 1, name: 'Learning mode' })).toBeVisible();
  });

  it('AC-B.14 keeps working from the cache when the download fails (offline)', async () => {
    const control = controlledLoader(current);
    renderApp('/practice', { questions: control.loader });
    expect(await screen.findByRole('heading', { level: 1, name: 'Learning mode' })).toBeVisible();
    control.reject(new Error('offline'));
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.getByRole('heading', { level: 1, name: 'Learning mode' })).toBeVisible();
    expect(screen.queryByText('Questions unavailable')).toBeNull();
  });

  it('AC-B.14 says when the site has no question source; settings still open', async () => {
    const { unmount } = renderApp('/practice', { questions: null });
    expect(await screen.findByText(/isn't connected to its database/)).toBeVisible();
    unmount();
    renderApp('/settings', { questions: null });
    expect(await screen.findByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
  });

  it('AC-B.15 an expired exam is only submitted once the questions have loaded', async () => {
    const store = createTestStore();
    store.startExam(makeExam({ startedAt: Date.now() - 3 * 60 * 60_000 }));
    const control = controlledLoader();
    renderApp('/exam/session', { store, questions: control.loader });
    await waitFor(() => {
      expect(control.latest).toHaveBeenCalled();
    });
    await new Promise((r) => setTimeout(r, 50));
    expect(store.getSnapshot().data.attempts).toHaveLength(0);

    control.resolve(current);
    expect(await screen.findByRole('heading', { level: 1, name: 'Exam results' })).toBeVisible();
    const [attempt] = store.getSnapshot().data.attempts;
    expect(attempt?.submitReason).toBe('expired_while_away');
    expect(attempt?.unavailableQuestionIds).toEqual([]);
  });
});
