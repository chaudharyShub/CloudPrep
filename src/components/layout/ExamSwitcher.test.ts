import { describe, expect, it } from 'vitest';
import { switchExamPath } from './examSwitch';

describe('switchExamPath (D-066)', () => {
  it('AC-M.3 opens the same section of the other exam', () => {
    expect(switchExamPath('/clf-c02/practice', 'clf-c02', 'saa-c03')).toBe('/saa-c03/practice');
    expect(switchExamPath('/clf-c02/practice/session', 'clf-c02', 'dva-c03')).toBe(
      '/dva-c03/practice',
    );
    expect(switchExamPath('/saa-c03/exam/check-in', 'saa-c03', 'clf-c02')).toBe('/clf-c02/exam');
    expect(switchExamPath('/saa-c03', 'saa-c03', 'clf-c02')).toBe('/clf-c02');
  });

  it('AC-M.3 opens the history instead of a result, which belongs to one exam', () => {
    expect(switchExamPath('/clf-c02/results/abc/review', 'clf-c02', 'saa-c03')).toBe(
      '/saa-c03/history',
    );
  });

  it('AC-M.3 stays on shared pages', () => {
    expect(switchExamPath('/settings', 'clf-c02', 'saa-c03')).toBeNull();
    expect(switchExamPath('/clf-c02x/practice', 'clf-c02', 'saa-c03')).toBeNull();
  });
});
