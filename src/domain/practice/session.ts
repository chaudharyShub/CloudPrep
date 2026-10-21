import type { DomainId } from '@/domain/exam-guide/clf-c02';
import { evaluateAnswer, requiredSelectionCount } from '@/domain/questions/evaluate';
import type { Question } from '@/domain/questions/types';
import { createRandom, shuffle } from '@/domain/lib/random';

export interface PracticeAnswerState {
  readonly selected: readonly string[];
  /** Set once the learner checks the answer; the question is then locked. */
  readonly result: 'correct' | 'incorrect' | null;
}

export interface PracticeSession {
  readonly id: string;
  /** Human-readable description of what is being practised, e.g. "Security and Compliance". */
  readonly label: string;
  readonly seed: number;
  readonly startedAt: number;
  readonly questionIds: readonly string[];
  /** Display order of option ids per question (stable for the whole session). */
  readonly optionOrder: Readonly<Record<string, readonly string[]>>;
  readonly answers: Readonly<Record<string, PracticeAnswerState>>;
  readonly currentIndex: number;
  readonly status: 'active' | 'finished';
  readonly finishedAt: number | null;
}

export interface CreatePracticeSessionInput {
  id: string;
  label: string;
  seed: number;
  startedAt: number;
  questions: readonly Question[];
  /** Maximum number of questions; `null` = all. */
  limit: number | null;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
}

export function createPracticeSession(input: CreatePracticeSessionInput): PracticeSession {
  const random = createRandom(input.seed);
  const ordered = input.shuffleQuestions ? shuffle(input.questions, random) : [...input.questions];
  const chosen = input.limit === null ? ordered : ordered.slice(0, Math.max(0, input.limit));
  const optionOrder: Record<string, readonly string[]> = {};
  for (const question of chosen) {
    const ids = question.options.map((option) => option.id);
    optionOrder[question.id] = input.shuffleOptions ? shuffle(ids, random) : ids;
  }
  return {
    id: input.id,
    label: input.label,
    seed: input.seed,
    startedAt: input.startedAt,
    questionIds: chosen.map((question) => question.id),
    optionOrder,
    answers: {},
    currentIndex: 0,
    status: chosen.length === 0 ? 'finished' : 'active',
    finishedAt: chosen.length === 0 ? input.startedAt : null,
  };
}

export type PracticeAction =
  | { type: 'select'; question: Question; optionId: string }
  | { type: 'check'; question: Question }
  | { type: 'goTo'; index: number }
  | { type: 'finish'; at: number };

function answerFor(session: PracticeSession, questionId: string): PracticeAnswerState {
  return session.answers[questionId] ?? { selected: [], result: null };
}

/** True when the learner has selected exactly as many options as the question requires. */
export function canCheck(session: PracticeSession, question: Question): boolean {
  const answer = answerFor(session, question.id);
  return answer.result === null && answer.selected.length === requiredSelectionCount(question);
}

/** Pure state transitions for a practice session. Invalid actions return the same state. */
export function practiceReducer(session: PracticeSession, action: PracticeAction): PracticeSession {
  if (session.status === 'finished') return session;

  switch (action.type) {
    case 'select': {
      const { question, optionId } = action;
      if (!session.questionIds.includes(question.id)) return session;
      if (!question.options.some((option) => option.id === optionId)) return session;
      const answer = answerFor(session, question.id);
      if (answer.result !== null) return session; // locked after checking

      let selected: readonly string[];
      if (question.type === 'single') {
        selected = [optionId];
      } else if (answer.selected.includes(optionId)) {
        selected = answer.selected.filter((id) => id !== optionId);
      } else if (answer.selected.length >= requiredSelectionCount(question)) {
        return session; // can't select more than the question asks for
      } else {
        selected = [...answer.selected, optionId];
      }
      return {
        ...session,
        answers: { ...session.answers, [question.id]: { selected, result: null } },
      };
    }

    case 'check': {
      const { question } = action;
      if (!session.questionIds.includes(question.id) || !canCheck(session, question)) {
        return session;
      }
      const answer = answerFor(session, question.id);
      const { isCorrect } = evaluateAnswer(question, answer.selected);
      return {
        ...session,
        answers: {
          ...session.answers,
          [question.id]: { selected: answer.selected, result: isCorrect ? 'correct' : 'incorrect' },
        },
      };
    }

    case 'goTo': {
      if (!Number.isInteger(action.index)) return session;
      if (action.index < 0 || action.index >= session.questionIds.length) return session;
      if (action.index === session.currentIndex) return session;
      return { ...session, currentIndex: action.index };
    }

    case 'finish':
      return { ...session, status: 'finished', finishedAt: action.at };
  }
}

export interface DomainTally {
  answered: number;
  correct: number;
}

export interface PracticeSessionSummary {
  readonly id: string;
  readonly label: string;
  readonly startedAt: number;
  readonly finishedAt: number;
  /** Questions in the session. */
  readonly total: number;
  /** Questions whose answer was checked. */
  readonly answered: number;
  readonly correct: number;
  readonly byDomain: Readonly<Partial<Record<DomainId, DomainTally>>>;
  readonly incorrectQuestionIds: readonly string[];
}

/** Summarises a session. Questions no longer in the bank are skipped. */
export function summarizeSession(
  session: PracticeSession,
  questionsById: ReadonlyMap<string, Question>,
  finishedAt: number,
): PracticeSessionSummary {
  const byDomain: Partial<Record<DomainId, DomainTally>> = {};
  const incorrectQuestionIds: string[] = [];
  let answered = 0;
  let correct = 0;
  for (const questionId of session.questionIds) {
    const result = session.answers[questionId]?.result ?? null;
    const question = questionsById.get(questionId);
    if (result === null || !question) continue;
    answered++;
    const tally = (byDomain[question.domain] ??= { answered: 0, correct: 0 });
    tally.answered++;
    if (result === 'correct') {
      correct++;
      tally.correct++;
    } else {
      incorrectQuestionIds.push(questionId);
    }
  }
  return {
    id: session.id,
    label: session.label,
    startedAt: session.startedAt,
    finishedAt: session.finishedAt ?? finishedAt,
    total: session.questionIds.length,
    answered,
    correct,
    byDomain,
    incorrectQuestionIds,
  };
}
