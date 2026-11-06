import { CLF_C02 } from './clf-c02.ts';
import { DVA_C03 } from './dva-c03.ts';
import { SAA_C03 } from './saa-c03.ts';
import type { ExamGuide } from './types.ts';

export * from './types.ts';
export { CLF_C02, DVA_C03, SAA_C03 };

/** Every supported exam, in the order the app offers them (D-066). */
export const EXAMS: readonly ExamGuide[] = [CLF_C02, SAA_C03, DVA_C03];

/** The exam saved data belongs to when it doesn't say (it predates D-066). */
export const DEFAULT_EXAM: ExamGuide = CLF_C02;

const BY_ID = new Map(EXAMS.map((exam) => [exam.id, exam]));
const BY_PREFIX = new Map(EXAMS.map((exam) => [exam.questionPrefix, exam]));

export function findExam(id: string | undefined | null): ExamGuide | undefined {
  return id ? BY_ID.get(id) : undefined;
}

export function getExam(id: string): ExamGuide {
  const exam = BY_ID.get(id);
  if (!exam) throw new RangeError(`Unknown exam: ${id}`);
  return exam;
}

export function isExamId(id: unknown): id is string {
  return typeof id === 'string' && BY_ID.has(id);
}

/** The exam a question id belongs to (`saa-d1-0001` → SAA-C03), from its prefix. */
export function examForQuestionId(questionId: string): ExamGuide | undefined {
  const dash = questionId.indexOf('-');
  return dash > 0 ? BY_PREFIX.get(questionId.slice(0, dash)) : undefined;
}

/** Task statement ids of one exam, for validating saved data. */
export function taskStatementIds(exam: ExamGuide): ReadonlySet<string> {
  return new Set(exam.domains.flatMap((domain) => domain.taskStatements.map((task) => task.id)));
}
