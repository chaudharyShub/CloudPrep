import { describe, expect, it } from 'vitest';
import { CLF_C02, EXAMS } from '@/domain/exam-guide';
import { AVAILABLE_EXAMS, examOfPath, examsForMode, findAvailableExam } from './CurrentExam';

describe('available exams (D-066)', () => {
  it('AC-M.11 production builds offer launched exams only; other builds offer every exam', () => {
    expect(examsForMode('production')).toEqual(EXAMS.filter((exam) => exam.launched));
    expect(examsForMode('production')).toContain(CLF_C02);
    expect(examsForMode('development')).toEqual(EXAMS);
    expect(examsForMode('e2e')).toEqual(EXAMS);
    expect(AVAILABLE_EXAMS).toEqual(EXAMS); // tests run in "test" mode
  });

  it('AC-M.2 reads the exam from the first segment of an address', () => {
    expect(examOfPath('/saa-c03/practice')?.code).toBe('SAA-C03');
    expect(examOfPath('/dva-c03')?.code).toBe('DVA-C03');
    expect(examOfPath('/settings')).toBeUndefined();
    expect(examOfPath('/')).toBeUndefined();
    expect(findAvailableExam('clf-c02')).toBe(CLF_C02);
    expect(findAvailableExam('dva-c02')).toBeUndefined();
  });
});
