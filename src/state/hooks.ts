import { useSyncExternalStore } from 'react';
import type { Question } from '@/domain/questions/types';
import type { StoreSnapshot, UserData } from '@/storage/store';
import { useQuestionBank } from './QuestionBankProvider';
import type { QuestionBank } from './questionBank';
import { useAppStore } from './StoreProvider';

function useSnapshot(): StoreSnapshot {
  const store = useAppStore();
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

/** User data (progress, bookmarks, sessions). Re-renders when any of it changes. */
export function useUserData(): UserData {
  return useSnapshot().data;
}

export function useStorageNotices() {
  return useSnapshot().notices;
}

export function useIsBookmarked(questionId: string): boolean {
  return questionId in useUserData().bookmarks;
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
export function useExamQuestions(): QuestionBank['exam'] {
  return useQuestionBank().exam;
}

export function useActiveExam() {
  return useUserData().activeExam;
}

export function useExamAttempts() {
  return useUserData().attempts;
}

export function usePreferences() {
  return useUserData().preferences;
}
