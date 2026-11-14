import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { revealClasses, useExamDemo, useReveal } from './motion';

afterEach(() => {
  delete document.documentElement.dataset['motion'];
  vi.useRealTimers();
});

describe('landing motion', () => {
  it('AC-V.9 the demo exam picks answer B and counts down', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useExamDemo());
    expect(result.current.picked).toBe(false);
    const start = result.current.remainingMs;
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.picked).toBe(true);
    expect(result.current.remainingMs).toBe(start - 2000);
  });

  it('AC-V.9 with reduced motion the demo is still: B picked, no countdown', () => {
    vi.useFakeTimers();
    document.documentElement.dataset['motion'] = 'reduce';
    const { result } = renderHook(() => useExamDemo());
    expect(result.current.picked).toBe(true);
    const start = result.current.remainingMs;
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.remainingMs).toBe(start);
  });

  it('AC-V.9 content is shown at once with reduced motion or without IntersectionObserver', () => {
    document.documentElement.dataset['motion'] = 'reduce';
    expect(renderHook(() => useReveal<HTMLDivElement>()).result.current[1]).toBe(true);
    delete document.documentElement.dataset['motion'];
    // jsdom has no IntersectionObserver, like very old browsers.
    expect(renderHook(() => useReveal<HTMLDivElement>()).result.current[1]).toBe(true);
    expect(revealClasses(true)).toContain('opacity-100');
    expect(revealClasses(false)).toContain('opacity-0');
  });
});
