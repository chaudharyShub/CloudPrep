import { useMemo, useSyncExternalStore } from 'react';
import { DEFAULT_EXAM, examForQuestionId, type ExamGuide } from '@/domain/exam-guide';
import type { Question } from '@/domain/questions/types';
import type { StoreSnapshot, UserData } from '@/storage/store';
import { currentExam, useAddressExam } from './CurrentExam';
import { useExamBankState, type QuestionBankState } from './QuestionBankProvider';
import type { QuestionBank } from './questionBank';
import { useAppStore } from './StoreProvider';

function useSnapshot(): StoreSnapshot {
  const store = useAppStore();
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

/**
 * Every exam's user data. Only for shared pages that manage all of it (settings, export);
 * pages about one exam use `useUserData()`.
 */
export function useAllUserData(): UserData {
  return useSnapshot().data;
}

/** Whether a question id belongs to an exam (ids without a known prefix are CLF-C02). */
function inExam(questionId: string, examId: string): boolean {
  return (examForQuestionId(questionId) ?? DEFAULT_EXAM).id === examId;
}

function pick<T>(record: Readonly<Record<string, T>>, examId: string): Record<string, T> {
  return Object.fromEntries(Object.entries(record).filter(([id]) => inExam(id, examId)));
}

/** The user data that belongs to one exam (D-066). The active exam and settings are shared. */
export function scopeToExam(data: UserData, examId: string): UserData {
  return {
    ...data,
    progress: pick(data.progress, examId),
    bookmarks: pick(data.bookmarks, examId),
    sessions: data.sessions.filter((session) => session.examId === examId),
    attempts: data.attempts.filter((attempt) => attempt.examId === examId),
  };
}

/**
 * The current exam's user data (progress, bookmarks, sessions, attempts), plus the shared
 * active exam and settings. Re-renders when any of it changes.
 */
export function useUserData(): UserData {
  const data = useAllUserData();
  const { id } = useCurrentExam();
  return useMemo(() => scopeToExam(data, id), [data, id]);
}

/**
 * The exam the current page is about: the one in the address, or on shared pages (settings,
 * privacy) the one the learner used last (D-066).
 */
export function useCurrentExam(): ExamGuide {
  return currentExam(useAddressExam(), useAllUserData().preferences.exam);
}

export function useStorageNotices() {
  return useSnapshot().notices;
}

export function useIsBookmarked(questionId: string): boolean {
  return questionId in useAllUserData().bookmarks;
}

/** The current exam's question bank state, loading it if needed. */
export function useQuestionBankState(): { state: QuestionBankState; retry: () => void } {
  return useExamBankState(useCurrentExam().id);
}

/** The current exam's loaded bank. Only for pages under `RequireQuestions`. */
export function useQuestionBank(): QuestionBank {
  const { state } = useQuestionBankState();
  if (state.status !== 'ready') throw new Error('The question bank is not loaded yet.');
  return state.bank;
}

/** Questions learners may practise, plus lookups. Pages under `RequireQuestions` only. */
export function usePracticeQuestions(): {
  questions: readonly Question[];
  byId: ReadonlyMap<string, Question>;
  ids: ReadonlySet<string>;
} {
  return useQuestionBank().practice;
}

/** Exam-eligible questions and which exams the bank can supply. Pages under `RequireQuestions` only. */
export function useExamQuestions(): QuestionBank['examQuestions'] {
  return useQuestionBank().examQuestions;
}

/** The exam in progress, whichever exam it belongs to (one at a time, D-066). */
export function useActiveExam() {
  return useAllUserData().activeExam;
}

/** The current exam's submitted attempts, newest first. */
export function useExamAttempts() {
  return useUserData().attempts;
}

export function usePreferences() {
  return useAllUserData().preferences;
}
