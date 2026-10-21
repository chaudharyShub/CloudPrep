import { createRandom, shuffle } from '@/domain/lib/random';
import { requiredSelectionCount } from '@/domain/questions/evaluate';
import type { Question } from '@/domain/questions/types';
import type { ExamConfig, ExamKind } from './config';
import {
  appendEvent,
  type IntegrityEvent,
  type IntegrityLog,
  type IntegrityMode,
} from './integrity';

/**
 * Exam lifecycle (docs/ARCHITECTURE.md §6.1):
 *
 *   (no session) ──start──► in_progress ◄──cancelFinish── confirming
 *                               │  └──────requestFinish──────►  │
 *                               └──────submit / expire──────────┴──► submitted
 *
 * "Not started" is the absence of a session. `submitted` is terminal: every later action
 * is ignored, so answers can't change and a second submission can't happen.
 */
export type ExamStatus = 'in_progress' | 'confirming' | 'submitted';

/** `time_expired`: ran out while open. `expired_while_away`: found expired when the app loaded. */
export type SubmitReason = 'manual' | 'time_expired' | 'expired_while_away';

export interface ExamSession {
  readonly id: string;
  readonly kind: ExamKind;
  readonly bankVersion: string;
  readonly seed: number;
  readonly startedAt: number;
  /** Absolute end time; the timer's source of truth. */
  readonly endsAt: number;
  readonly durationMs: number;
  readonly questionIds: readonly string[];
  /** Option display order per question. */
  readonly optionOrder: Readonly<Record<string, readonly string[]>>;
  /** How many options each question asks for (shown to the learner as "Select two"). */
  readonly requiredSelections: Readonly<Record<string, number>>;
  /** The learner's selections only. Correct answers are never stored in the session. */
  readonly answers: Readonly<Record<string, readonly string[]>>;
  readonly flagged: readonly string[];
  readonly currentIndex: number;
  readonly status: ExamStatus;
  readonly submittedAt: number | null;
  readonly submitReason: SubmitReason | null;
  /** Optional practice-integrity log (type + timestamp only). Standard mode logs nothing. */
  readonly integrity: IntegrityLog;
}

export interface CreateExamSessionInput {
  id: string;
  config: ExamConfig;
  bankVersion: string;
  seed: number;
  startedAt: number;
  /** Questions in exam order (from `selectExamQuestions`). */
  questions: readonly Question[];
  shuffleOptions: boolean;
  /** Defaults to standard practice (no monitoring). */
  integrityMode?: IntegrityMode;
}

export function createExamSession(input: CreateExamSessionInput): ExamSession {
  // Separate stream from question selection, so option order doesn't change question order.
  const random = createRandom(input.seed ^ 0x9e3779b9);
  const optionOrder: Record<string, readonly string[]> = {};
  const requiredSelections: Record<string, number> = {};
  for (const question of input.questions) {
    const ids = question.options.map((option) => option.id);
    optionOrder[question.id] = input.shuffleOptions ? shuffle(ids, random) : ids;
    requiredSelections[question.id] = requiredSelectionCount(question);
  }
  return {
    id: input.id,
    kind: input.config.kind,
    bankVersion: input.bankVersion,
    seed: input.seed,
    startedAt: input.startedAt,
    endsAt: input.startedAt + input.config.durationMs,
    durationMs: input.config.durationMs,
    questionIds: input.questions.map((question) => question.id),
    optionOrder,
    requiredSelections,
    answers: {},
    flagged: [],
    currentIndex: 0,
    status: 'in_progress',
    submittedAt: null,
    submitReason: null,
    integrity: { mode: input.integrityMode ?? 'standard', events: [] },
  };
}

export type ExamAction =
  /** `at` is the current time; edits after the end time are ignored. */
  | { type: 'select'; questionId: string; optionId: string; at: number }
  | { type: 'toggleFlag'; questionId: string; at: number }
  | { type: 'goTo'; index: number }
  | { type: 'requestFinish' }
  | { type: 'cancelFinish' }
  | { type: 'submit'; at: number; reason: SubmitReason }
  /** Records an integrity event while the exam is open; ignored in standard mode. */
  | { type: 'logIntegrity'; event: IntegrityEvent };

function isEditable(session: ExamSession, at: number): boolean {
  return session.status === 'in_progress' && at < session.endsAt;
}

/** Pure exam state transitions. Invalid actions return the same object. */
export function examReducer(session: ExamSession, action: ExamAction): ExamSession {
  if (session.status === 'submitted') return session;

  switch (action.type) {
    case 'select': {
      const { questionId, optionId } = action;
      if (!isEditable(session, action.at)) return session;
      const order = session.optionOrder[questionId];
      const required = session.requiredSelections[questionId];
      if (!order?.includes(optionId) || required === undefined) return session;
      const current = session.answers[questionId] ?? [];
      let next: readonly string[];
      if (required === 1) {
        if (current.length === 1 && current[0] === optionId) return session;
        next = [optionId];
      } else if (current.includes(optionId)) {
        next = current.filter((id) => id !== optionId);
      } else if (current.length >= required) {
        return session; // can't select more than the question asks for
      } else {
        next = [...current, optionId];
      }
      return { ...session, answers: { ...session.answers, [questionId]: next } };
    }

    case 'toggleFlag': {
      if (!isEditable(session, action.at)) return session;
      if (!session.questionIds.includes(action.questionId)) return session;
      const flagged = session.flagged.includes(action.questionId)
        ? session.flagged.filter((id) => id !== action.questionId)
        : [...session.flagged, action.questionId];
      return { ...session, flagged };
    }

    case 'goTo': {
      if (session.status !== 'in_progress') return session;
      const { index } = action;
      if (!Number.isInteger(index) || index < 0 || index >= session.questionIds.length) {
        return session;
      }
      return index === session.currentIndex ? session : { ...session, currentIndex: index };
    }

    case 'requestFinish':
      return session.status === 'in_progress' ? { ...session, status: 'confirming' } : session;

    case 'cancelFinish':
      return session.status === 'confirming' ? { ...session, status: 'in_progress' } : session;

    case 'logIntegrity': {
      const integrity = appendEvent(session.integrity, action.event);
      return integrity === session.integrity ? session : { ...session, integrity };
    }

    case 'submit':
      return {
        ...session,
        status: 'submitted',
        submittedAt: action.at,
        submitReason: action.reason,
      };
  }
}

export type AnswerState = 'unanswered' | 'incomplete' | 'answered';

/** `incomplete`: a multiple-response question with some, but not all, required selections. */
export function answerState(session: ExamSession, questionId: string): AnswerState {
  const selected = session.answers[questionId]?.length ?? 0;
  const required = session.requiredSelections[questionId] ?? 1;
  if (selected === 0) return 'unanswered';
  return selected >= required ? 'answered' : 'incomplete';
}

export interface ExamCounts {
  total: number;
  answered: number;
  /** Partly answered multiple-response questions. Scored as incorrect if left as is. */
  incomplete: number;
  /** No selection at all. */
  unanswered: number;
  flagged: number;
}

export function examCounts(session: ExamSession): ExamCounts {
  const counts: ExamCounts = {
    total: session.questionIds.length,
    answered: 0,
    incomplete: 0,
    unanswered: 0,
    flagged: 0,
  };
  for (const id of session.questionIds) counts[answerState(session, id)]++;
  counts.flagged = session.questionIds.filter((id) => session.flagged.includes(id)).length;
  return counts;
}
