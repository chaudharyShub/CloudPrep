import { describe, expect, it } from 'vitest';
import { formatClock, isExpired, remainingMs, timeWarning } from './timer';

const MIN = 60_000;

describe('remainingMs and isExpired', () => {
  it('counts down from the absolute end time and never goes negative', () => {
    expect(remainingMs(10_000, 4_000)).toBe(6_000);
    expect(remainingMs(10_000, 10_000)).toBe(0);
    expect(remainingMs(10_000, 99_999)).toBe(0);
  });

  it('expires exactly at the end time', () => {
    expect(isExpired(10_000, 9_999)).toBe(false);
    expect(isExpired(10_000, 10_000)).toBe(true);
  });
});

describe('timeWarning', () => {
  it('warns at 10 minutes and becomes critical at 5 minutes', () => {
    expect(timeWarning(10 * MIN + 1)).toBe('none');
    expect(timeWarning(10 * MIN)).toBe('low');
    expect(timeWarning(5 * MIN + 1)).toBe('low');
    expect(timeWarning(5 * MIN)).toBe('critical');
    expect(timeWarning(0)).toBe('critical');
  });
});

describe('formatClock', () => {
  it('shows m:ss under an hour and h:mm:ss above', () => {
    expect(formatClock(90 * MIN)).toBe('1:30:00');
    expect(formatClock(57 * MIN)).toBe('57:00');
    expect(formatClock(65_000)).toBe('1:05');
  });

  it('rounds up, so it reads 0:00 only when time is really up', () => {
    expect(formatClock(1)).toBe('0:01');
    expect(formatClock(999)).toBe('0:01');
    expect(formatClock(0)).toBe('0:00');
  });

  it('never shows a negative time', () => {
    expect(formatClock(-5_000)).toBe('0:00');
  });
});
