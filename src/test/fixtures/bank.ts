import { CLF_C02, type DomainId, type ExamGuide } from '@/domain/exam-guide';
import type { Question } from '@/domain/questions/types';
import { makeMultiQuestion, makeQuestion } from './questions';

/**
 * Generates a synthetic, valid bank of one exam (CLF-C02 by default) with `perDomain[d]`
 * questions in each domain, spread across that domain's task statements. Every fourth
 * question is multiple response.
 */
export function makeBank(
  perDomain: Partial<Record<DomainId, number>>,
  exam: ExamGuide = CLF_C02,
): Question[] {
  const questions: Question[] = [];
  for (const domain of exam.domains) {
    const count = perDomain[domain.id] ?? 0;
    for (let i = 0; i < count; i++) {
      const task = domain.taskStatements[i % domain.taskStatements.length];
      if (!task) continue;
      const id = `${exam.questionPrefix}-d${domain.number}-${String(i + 1).padStart(4, '0')}`;
      const base = { id, domain: domain.id, taskStatement: task.id, stem: `Synthetic ${id}?` };
      questions.push(i % 4 === 3 ? makeMultiQuestion(base) : makeQuestion(base));
    }
  }
  return questions;
}

/** Enough questions for a full 65-question exam (needs 16 / 19 / 22 / 8). */
export const FULL_BANK = makeBank({ D1: 20, D2: 24, D3: 28, D4: 10 });
