import { StrictMode } from 'react';
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ExamSession } from '@/domain/exam/session';
import { StoreProvider } from '@/state/StoreProvider';
import { makeExam } from '@/test/exam';
import { createTestStore } from '@/test/renderApp';
import { useIntegrityMonitor } from './useIntegrityMonitor';

function Probe({ exam }: { exam: ExamSession }) {
  useIntegrityMonitor(exam);
  return null;
}

describe('useIntegrityMonitor', () => {
  afterEach(() => {
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: null });
    vi.useRealTimers();
  });

  it('AC-7.3 keeps fullscreen when React remounts the exam in development, and leaves it when the exam closes', () => {
    vi.useFakeTimers();
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      value: document.documentElement,
    });
    const exit = vi.fn(() => Promise.resolve());
    document.exitFullscreen = exit;
    const store = createTestStore();
    const exam = { ...makeExam(), integrity: { mode: 'proctored' as const, events: [] } };
    store.startExam(exam);

    // StrictMode mounts, unmounts and remounts effects straight away.
    const view = render(
      <StrictMode>
        <StoreProvider store={store}>
          <Probe exam={exam} />
        </StoreProvider>
      </StrictMode>,
    );
    vi.runAllTimers();
    expect(exit).not.toHaveBeenCalled();
    const types = store.getSnapshot().data.activeExam?.integrity.events.map((e) => e.type);
    expect(types).not.toContain('fullscreen-exited');

    view.unmount();
    vi.runAllTimers();
    expect(exit).toHaveBeenCalledTimes(1);
  });
});
