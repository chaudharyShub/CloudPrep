import { describe, expect, it } from 'vitest';
import { formatMinutes, formatPercent } from './format';

describe('formatPercent', () => {
  it('rounds a ratio and shows a dash without a value', () => {
    expect(formatPercent(0.784)).toBe('78%');
    expect(formatPercent(null)).toBe('—');
  });
});

describe('formatMinutes', () => {
  it('AC-V.6 shows whole minutes, counting a started minute', () => {
    expect(formatMinutes(71 * 60_000)).toBe('71 min');
    expect(formatMinutes(70 * 60_000 + 1)).toBe('71 min');
    expect(formatMinutes(0)).toBe('0 min');
    expect(formatMinutes(-5)).toBe('0 min');
  });
});
