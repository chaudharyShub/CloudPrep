import { describe, expect, it } from 'vitest';
import {
  CLF_C02,
  DEFAULT_EXAM,
  DVA_C03,
  EXAMS,
  examForQuestionId,
  findExam,
  getExam,
  isExamId,
  SAA_C03,
  taskStatementIds,
} from './index';

// Facts from the official exam guides and certification pages, checked 2026-11-05 (D-066).
describe('exam guides', () => {
  it('AC-M.1 lists CLF-C02, SAA-C03 and DVA-C03, CLF-C02 first', () => {
    expect(EXAMS.map((exam) => exam.code)).toEqual(['CLF-C02', 'SAA-C03', 'DVA-C03']);
    expect(DEFAULT_EXAM).toBe(CLF_C02);
  });

  it.each(EXAMS)('AC-M.1 $code has the shared exam format and a valid outline', (exam) => {
    expect(exam.questionCount).toBe(65);
    expect(exam.scoredQuestionCount).toBe(50);
    expect(exam.guideUrl).toMatch(/^https:\/\/docs\.aws\.amazon\.com\/aws-certification\//);
    expect(exam.domains.map((d) => d.id)).toEqual(['D1', 'D2', 'D3', 'D4']);
    expect(exam.domains.map((d) => d.number)).toEqual([1, 2, 3, 4]);
    expect(exam.domains.reduce((sum, d) => sum + d.weightPercent, 0)).toBe(100);
    for (const domain of exam.domains) {
      expect(domain.taskStatements.length).toBeGreaterThan(0);
      for (const task of domain.taskStatements) {
        expect(task.id.startsWith(`${String(domain.number)}.`), task.id).toBe(true);
      }
    }
    expect(exam.id).toBe(exam.code.toLowerCase());
  });

  it('AC-M.1 CLF-C02: 90 minutes, 700 to pass, weights 24 / 30 / 34 / 12', () => {
    expect(CLF_C02).toMatchObject({ durationMinutes: 90, passingScore: 700, feeUsd: 100 });
    expect(CLF_C02.domains.map((d) => d.weightPercent)).toEqual([24, 30, 34, 12]);
    expect(taskStatementIds(CLF_C02).size).toBe(19);
  });

  it('AC-M.1 SAA-C03: 130 minutes, 720 to pass, weights 30 / 26 / 24 / 20, 14 task statements', () => {
    expect(SAA_C03).toMatchObject({ durationMinutes: 130, passingScore: 720, feeUsd: 150 });
    expect(SAA_C03.domains.map((d) => d.name)).toEqual([
      'Design Secure Architectures',
      'Design Resilient Architectures',
      'Design High-Performing Architectures',
      'Design Cost-Optimized Architectures',
    ]);
    expect(SAA_C03.domains.map((d) => d.weightPercent)).toEqual([30, 26, 24, 20]);
    expect(SAA_C03.domains.map((d) => d.taskStatements.length)).toEqual([3, 2, 5, 4]);
  });

  it('AC-M.1 DVA-C03: 130 minutes, 720 to pass, weights 30 / 26 / 22 / 22, 12 tasks', () => {
    expect(DVA_C03).toMatchObject({ durationMinutes: 130, passingScore: 720, feeUsd: 150 });
    expect(DVA_C03.domains.map((d) => d.name)).toEqual([
      'Development with AWS Services',
      'Security',
      'Testing and Deployment',
      'Troubleshooting and Optimization',
    ]);
    expect(DVA_C03.domains.map((d) => d.weightPercent)).toEqual([30, 26, 22, 22]);
    expect(DVA_C03.domains.map((d) => d.taskStatements.length)).toEqual([3, 3, 3, 3]);
  });

  it('AC-M.9 gives every exam its own question id prefix', () => {
    expect(EXAMS.map((exam) => exam.questionPrefix)).toEqual(['clf', 'saa', 'dva']);
    expect(examForQuestionId('clf-d1-0001')).toBe(CLF_C02);
    expect(examForQuestionId('saa-d4-0123')).toBe(SAA_C03);
    expect(examForQuestionId('dva-d2-0007')).toBe(DVA_C03);
    expect(examForQuestionId('xyz-d1-0001')).toBeUndefined();
    expect(examForQuestionId('q-1')).toBeUndefined();
  });

  it('finds exams by id', () => {
    expect(findExam('saa-c03')).toBe(SAA_C03);
    expect(findExam('dva-c02')).toBeUndefined();
    expect(findExam(undefined)).toBeUndefined();
    expect(getExam('dva-c03')).toBe(DVA_C03);
    expect(() => getExam('nope')).toThrow(RangeError);
    expect(isExamId('clf-c02')).toBe(true);
    expect(isExamId(42)).toBe(false);
  });

  it('AC-M.11 all three exams are launched (SAA-C03 and DVA-C03 with 1,000 questions each)', () => {
    expect(EXAMS.filter((exam) => exam.launched).map((exam) => exam.id)).toEqual([
      'clf-c02',
      'saa-c03',
      'dva-c03',
    ]);
  });
});
