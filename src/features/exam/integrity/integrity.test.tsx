import { render, screen, within } from '@testing-library/react';
import { MemoryRouter as RouterShim } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { appendEvent, MAX_INTEGRITY_EVENTS, STANDARD_LOG } from '@/domain/exam/integrity';
import { examReducer } from '@/domain/exam/session';
import { createMemoryDriver } from '@/storage/driver';
import { createAppStore } from '@/storage/store';
import { EXAM_ATTEMPTS_AREA } from '@/storage/attemptsArea';
import { parseIntegrityLog } from '@/storage/integrityParse';
import { EXAM_QUESTIONS } from '@/test/bank';
import { makeAttempt, makeExam } from '@/test/exam';
import { createTestStore, renderApp } from '@/test/renderApp';
import { IntegrityModePicker } from './IntegrityModePicker';

const strictExam = (id = 'exam-strict') => {
  const base = makeExam({ id });
  return { ...base, integrity: { mode: 'focus' as const, events: [] } };
};

describe('integrity log in the exam session', () => {
  it('records events only in strict modes and while the exam is open', () => {
    const event = { type: 'tab-hidden' as const, at: 1 };
    const standard = makeExam();
    expect(examReducer(standard, { type: 'logIntegrity', event })).toBe(standard);

    const strict = strictExam();
    const logged = examReducer(strict, { type: 'logIntegrity', event });
    expect(logged.integrity.events).toEqual([event]);

    const submitted = examReducer(logged, { type: 'submit', at: 2, reason: 'manual' });
    expect(examReducer(submitted, { type: 'logIntegrity', event })).toBe(submitted);
  });

  it('caps the log size', () => {
    let log = { mode: 'focus' as const, events: [] as { type: 'window-blur'; at: number }[] };
    for (let i = 0; i < MAX_INTEGRITY_EVENTS + 10; i++) {
      log = appendEvent(log, { type: 'window-blur', at: i }) as typeof log;
    }
    expect(log.events).toHaveLength(MAX_INTEGRITY_EVENTS);
  });

  it('copies the log into the attempt without affecting the score', () => {
    const exam = examReducer(strictExam(), {
      type: 'logIntegrity',
      event: { type: 'window-blur', at: 5 },
    });
    const attempt = makeAttempt(exam);
    expect(attempt.integrity).toEqual({ mode: 'focus', events: [{ type: 'window-blur', at: 5 }] });
    expect(attempt.summary).toEqual(makeAttempt(makeExam()).summary);
  });
});

describe('integrity storage', () => {
  it('round-trips with the attempt and loads older data as standard practice', () => {
    const exam = examReducer(strictExam(), {
      type: 'logIntegrity',
      event: { type: 'tab-hidden', at: 9 },
    });
    const attempt = makeAttempt(exam);
    const parsed = EXAM_ATTEMPTS_AREA.parse(JSON.parse(JSON.stringify([attempt])));
    expect(parsed?.value[0]?.integrity).toEqual(attempt.integrity);
    expect(parseIntegrityLog(undefined)).toEqual({ log: STANDARD_LOG, dropped: 0 });
  });

  it('AC-7.8 still loads logs saved with the retired webcam mode', () => {
    const log = { mode: 'webcam', events: [{ type: 'face-visible', at: 5 }] };
    expect(parseIntegrityLog(log)).toEqual({ log, dropped: 0 });
  });

  it('keeps valid events and drops invalid ones without losing the exam', () => {
    expect(
      parseIntegrityLog({
        mode: 'focus',
        events: [
          { type: 'tab-hidden', at: 1 },
          { type: 'webcam-frame', at: 2 },
          { type: 'window-blur', at: -1 },
        ],
      }),
    ).toEqual({ log: { mode: 'focus', events: [{ type: 'tab-hidden', at: 1 }] }, dropped: 2 });
    expect(parseIntegrityLog('nonsense').log).toEqual(STANDARD_LOG);
  });

  it('deletes one attempt’s log on request', () => {
    const store = createAppStore({ driver: createMemoryDriver(), persistent: true });
    const exam = examReducer(strictExam('a1'), {
      type: 'logIntegrity',
      event: { type: 'tab-hidden', at: 9 },
    });
    store.completeExam(makeAttempt(exam), EXAM_QUESTIONS);
    store.clearIntegrityLog('a1');
    expect(store.getSnapshot().data.attempts[0]?.integrity).toEqual({ mode: 'focus', events: [] });
  });
});

describe('IntegrityModePicker', () => {
  it('AC-7.8 offers standard, strict and AI-proctored modes, without the retired webcam option', () => {
    render(
      <MemoryLink>
        <IntegrityModePicker value="standard" onChange={vi.fn()} proctoringAvailable />
      </MemoryLink>,
    );
    expect(screen.getByRole('radio', { name: /Standard practice/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /^Strict practice/ })).toBeEnabled();
    expect(screen.getByRole('radio', { name: /AI-proctored exam/ })).toBeEnabled();
    expect(screen.queryByRole('radio', { name: /webcam/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/built-in face detection/)).not.toBeInTheDocument();
  });

  it('AC-7.1 disables the proctored mode where the browser lacks camera or fullscreen support', () => {
    render(
      <MemoryLink>
        <IntegrityModePicker value="standard" onChange={vi.fn()} proctoringAvailable={false} />
      </MemoryLink>,
    );
    expect(screen.getByRole('radio', { name: /AI-proctored exam/ })).toBeDisabled();
    expect(screen.getByText(/needs camera and microphone access and fullscreen/)).toBeVisible();
  });
});

describe('strict practice in the app', () => {
  it('requests fullscreen from the start click and still starts if it is refused', async () => {
    const request = vi.fn(() => Promise.reject(new Error('no')));
    document.documentElement.requestFullscreen = request;
    const store = createTestStore();
    const { user } = renderApp('/exam', { store });
    await user.click(await screen.findByRole('radio', { name: /^Strict practice(?! with)/ }));
    await user.click(screen.getByRole('button', { name: 'Start full exam' }));
    expect(screen.getByRole('dialog')).toHaveAccessibleDescription(/logs when the tab is hidden/);
    await user.click(screen.getByRole('button', { name: 'Start exam' }));

    expect(request).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole('heading', { level: 1, name: /^Question 1 of/ })).toBeVisible();
    expect(screen.getByText('Strict practice: focus monitoring on')).toBeVisible();
    await vi.waitFor(() => {
      const types = store.getSnapshot().data.activeExam?.integrity.events.map((e) => e.type);
      expect(types).toEqual(
        expect.arrayContaining(['fullscreen-unavailable', 'monitoring-started']),
      );
    });
  });

  it('shows a fullscreen-exit warning with a way back, and lets the learner stop monitoring', async () => {
    const store = createTestStore();
    store.startExam(strictExam());
    const { user } = renderApp('/exam/session', { store });
    await screen.findByRole('heading', { level: 1, name: /^Question 1 of/ });

    Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: null });
    document.dispatchEvent(new Event('fullscreenchange'));
    const warning = await screen.findByText('You left fullscreen');
    expect(warning).toBeVisible();
    expect(screen.getByRole('button', { name: 'Return to fullscreen' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Continue without' }));
    expect(screen.queryByText('You left fullscreen')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Stop monitoring' }));
    expect(screen.getByText('Monitoring off')).toBeVisible();
    window.dispatchEvent(new Event('blur'));
    const types = store.getSnapshot().data.activeExam?.integrity.events.map((e) => e.type) ?? [];
    expect(types.at(-1)).toBe('monitoring-stopped');
  });

  it('logs nothing and shows no monitoring bar in standard mode', async () => {
    const store = createTestStore();
    store.startExam(makeExam());
    renderApp('/exam/session', { store });
    await screen.findByRole('heading', { level: 1, name: /^Question 1 of/ });
    window.dispatchEvent(new Event('blur'));
    expect(screen.queryByText(/monitoring/)).not.toBeInTheDocument();
    expect(store.getSnapshot().data.activeExam?.integrity.events).toEqual([]);
  });

  it('shows a neutral timeline on the results page, with no score or verdict, and can delete it', async () => {
    const store = createTestStore();
    const exam = examReducer(strictExam('r1'), {
      type: 'logIntegrity',
      event: { type: 'tab-hidden', at: Date.now() },
    });
    store.completeExam(makeAttempt(exam), EXAM_QUESTIONS);
    const { user } = renderApp('/results/r1', { store });
    const table = await screen.findByRole('table', { name: 'Integrity events in time order' });
    expect(within(table).getByText('Exam tab hidden')).toBeVisible();
    expect(within(table).getByText(/None required/)).toBeVisible();
    const report = screen
      .getByRole('heading', { name: 'Practice integrity report' })
      .closest('div.rounded-lg');
    expect(report?.textContent).not.toMatch(/cheat|%|score/i);

    await user.click(screen.getByRole('button', { name: 'Delete log' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete log' }),
    );
    expect(screen.getByText('No events are stored for this exam.')).toBeVisible();
  });

  it('has a privacy page explaining monitoring, storage and deletion', async () => {
    renderApp('/privacy');
    expect(await screen.findByRole('heading', { level: 1, name: 'Privacy' })).toBeVisible();
    for (const title of [
      'What is monitored',
      'How the AI proctor works',
      'What is stored',
      'How to stop monitoring',
      'How to delete records',
    ]) {
      expect(screen.getByRole('heading', { name: title })).toBeVisible();
    }
  });
});

/** Minimal router context for components that render links. */
function MemoryLink({ children }: { children: React.ReactNode }) {
  return <RouterShim>{children}</RouterShim>;
}
