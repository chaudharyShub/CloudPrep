import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { assessReadiness, countedAttempts } from '@/domain/analytics/readiness';
import { buildAttempt } from '@/domain/exam/attempt';
import type { IntegrityEventType } from '@/domain/exam/integrity';
import { examReducer, type ExamSession } from '@/domain/exam/session';
import { EXAM_ATTEMPTS_AREA } from '@/storage/attemptsArea';
import { EXAM_QUESTIONS, EXAM_QUESTIONS_BY_ID } from '@/test/bank';
import { makeExam } from '@/test/exam';
import { createTestStore, renderApp } from '@/test/renderApp';

function proctoredExam(
  events: [IntegrityEventType, number][] = [],
  id = 'proctored-1',
): ExamSession {
  return {
    ...makeExam({ id }),
    integrity: { mode: 'proctored', events: events.map(([type, at]) => ({ type, at })) },
  };
}

describe('proctored exam in the app', () => {
  it('AC-7.5 after a reload, hides the questions until the proctor is restarted, and counts it as a strike', async () => {
    const store = createTestStore();
    store.startExam(proctoredExam([['proctor-started', Date.now() - 60_000]]));
    renderApp('/exam/session', { store });

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Restart the AI proctor' }),
    ).toBeVisible();
    expect(screen.queryByRole('heading', { name: /^Question 1 of/ })).not.toBeInTheDocument();
    expect(screen.getByRole('timer')).toBeVisible(); // the timer keeps running
    expect(screen.getByRole('button', { name: 'Restart proctor and continue' })).toBeEnabled();
    const types = store.getSnapshot().data.activeExam?.integrity.events.map((e) => e.type);
    expect(types?.filter((t) => t === 'proctor-resumed')).toHaveLength(1);
    expect(types?.indexOf('proctor-resumed')).toBeGreaterThan(
      types?.indexOf('proctor-started') ?? 0,
    );
    // The interruption is a strike, so the proctor warns about it.
    expect(await screen.findByRole('dialog', { name: 'Proctor warning 1 of 2' })).toBeVisible();
  });

  it('AC-7.4 ends the exam when the saved log already has a zero-tolerance violation', async () => {
    const store = createTestStore();
    const now = Date.now();
    store.startExam(
      proctoredExam([
        ['proctor-started', now - 60_000],
        ['phone-detected', now - 1000],
      ]),
    );
    const { router } = renderApp('/exam/session', { store });

    expect(await screen.findByRole('heading', { level: 1, name: 'Exam results' })).toBeVisible();
    expect(router.state.location.pathname).toBe('/results/proctored-1');
    expect(screen.getByText(/Reason: Phone detected/)).toBeVisible();
    const [attempt] = store.getSnapshot().data.attempts;
    expect(attempt?.submitReason).toBe('proctor_ended');
    expect(attempt?.benchmarkMet).toBe(false);
    expect(attempt?.integrity.events.at(-1)?.type).toBe('exam-ended-by-proctor');

    // AC-7.6 the proctor report shows what the proctor did about each event.
    const table = screen.getByRole('table', { name: 'Integrity events in time order' });
    const phoneRow = within(table).getByText('Phone detected').closest('tr');
    expect(phoneRow).not.toBeNull();
    expect(within(phoneRow as HTMLElement).getByText('Exam ended')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Proctor report' })).toBeVisible();
  });

  it('AC-7.4 ends the exam on the third strike', async () => {
    const store = createTestStore();
    const now = Date.now();
    store.startExam(
      proctoredExam([
        ['proctor-started', now - 60_000],
        ['looking-away', now - 50_000],
        ['tab-hidden', now - 40_000],
        ['mouth-moving', now - 30_000],
      ]),
    );
    renderApp('/exam/session', { store });
    expect(await screen.findByText(/Reason: Lips moving/)).toBeVisible();
  });

  it('AC-7.6 marks the attempt as void in history', async () => {
    const store = createTestStore();
    const now = Date.now();
    store.startExam(proctoredExam([['camera-lost', now - 1000]], 'h1'));
    renderApp('/exam/session', { store });
    await screen.findByText(/Reason: Camera lost/);

    const history = renderApp('/history', { store });
    expect(await history.findAllByText('Ended by proctor')).not.toHaveLength(0);
  });
});

describe('void attempts', () => {
  const ended = (id: string) => {
    const session = examReducer(proctoredExam([['phone-detected', 1]], id), {
      type: 'submit',
      at: Date.now(),
      reason: 'proctor_ended',
    });
    return buildAttempt(session, EXAM_QUESTIONS_BY_ID, 0);
  };

  it('AC-7.6 never meet the benchmark, even with a 0% benchmark, and survive storage', () => {
    const attempt = ended('v1');
    expect(attempt.benchmarkMet).toBe(false);
    const parsed = EXAM_ATTEMPTS_AREA.parse(JSON.parse(JSON.stringify([attempt])));
    expect(parsed?.value[0]).toMatchObject({ submitReason: 'proctor_ended', benchmarkMet: false });
  });

  it('AC-7.6 are left out of readiness', () => {
    const attempts = [ended('v1'), ended('v2'), ended('v3')];
    expect(countedAttempts(attempts)).toEqual([]);
    expect(assessReadiness(attempts, 70).level).toBe('insufficient-data');
    expect(EXAM_QUESTIONS.length).toBeGreaterThan(0);
  });
});
