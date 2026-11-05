import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SAA_TEST_BANK, TEST_BANK } from '@/test/bank';
import {
  QUESTIONS_UNAVAILABLE,
  QuestionBankProvider,
  useExamBankState,
} from './QuestionBankProvider';
import type { QuestionLoader } from './questionLoader';

function Probe({ examId }: { examId: string }) {
  const { state } = useExamBankState(examId);
  return (
    <p>
      {examId}:{' '}
      {state.status === 'ready'
        ? `${state.bank.exam.code} ${String(state.bank.practice.questions.length)}`
        : state.status === 'error'
          ? state.message
          : 'loading'}
    </p>
  );
}

const loaderOf = (bank: typeof TEST_BANK): QuestionLoader => ({
  cached: () => Promise.resolve(null),
  latest: () => Promise.resolve({ version: bank.version, questions: bank.practice.questions }),
});

describe('QuestionBankProvider (D-066)', () => {
  it('AC-M.9 loads each exam’s bank on first use, with that exam’s guide', async () => {
    const loaderFor = vi.fn((examId: string) =>
      examId === 'saa-c03' ? loaderOf(SAA_TEST_BANK) : loaderOf(TEST_BANK),
    );
    render(
      <QuestionBankProvider loaderFor={loaderFor}>
        <Probe examId="saa-c03" />
      </QuestionBankProvider>,
    );
    expect(
      await screen.findByText(
        `saa-c03: SAA-C03 ${String(SAA_TEST_BANK.practice.questions.length)}`,
      ),
    ).toBeVisible();
    // Only the exam a page needs is loaded.
    expect(loaderFor.mock.calls.map(([id]) => id)).toEqual(['saa-c03']);
  });

  it('AC-M.9 keeps exams apart: a missing source fails only that exam', async () => {
    render(
      <QuestionBankProvider
        loaderFor={(examId) => (examId === 'dva-c03' ? null : loaderOf(TEST_BANK))}
        initialBanks={[SAA_TEST_BANK]}
      >
        <Probe examId="saa-c03" />
        <Probe examId="dva-c03" />
        <Probe examId="clf-c02" />
      </QuestionBankProvider>,
    );
    expect(await screen.findByText(`dva-c03: ${QUESTIONS_UNAVAILABLE}`)).toBeVisible();
    expect(screen.getByText(/^saa-c03: SAA-C03/)).toBeVisible();
    expect(await screen.findByText(/^clf-c02: CLF-C02/)).toBeVisible();
  });
});
