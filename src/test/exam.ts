import { buildAttempt } from '@/domain/exam/attempt';
import { shortExamConfig } from '@/domain/exam/config';
import {
  createExamSession,
  examReducer,
  type ExamAction,
  type ExamSession,
} from '@/domain/exam/session';
import { EXAM_QUESTIONS, EXAM_QUESTIONS_BY_ID } from '@/state/examQuestions';

/**
 * An exam over the first `count` real exam questions (no shuffling), starting at `startedAt`.
 * The first five include single-answer and multiple-response questions.
 */
export function makeExam({
  count = 5,
  startedAt = Date.now(),
  id = 'exam-test',
  actions = [],
}: {
  count?: number;
  startedAt?: number;
  id?: string;
  actions?: ExamAction[];
} = {}): ExamSession {
  const session = createExamSession({
    id,
    config: shortExamConfig(count),
    bankVersion: 'test',
    seed: 1,
    startedAt,
    questions: EXAM_QUESTIONS.slice(0, count),
    shuffleOptions: false,
  });
  return actions.reduce(examReducer, session);
}

export function makeAttempt(session: ExamSession, at = session.startedAt + 60_000) {
  const submitted = examReducer(session, { type: 'submit', at, reason: 'manual' });
  return buildAttempt(submitted, EXAM_QUESTIONS_BY_ID, 70);
}

export const examQuestion = (index: number) => {
  const question = EXAM_QUESTIONS[index];
  if (!question) throw new Error(`No exam question at ${index}`);
  return question;
};
