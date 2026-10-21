import { useMemo, useSyncExternalStore } from 'react';
import { QUESTION_BANK } from '@/content/questions';
import { indexQuestions, practiceableQuestions } from '@/domain/questions/query';
import type { Question } from '@/domain/questions/types';
import type { StoreSnapshot, UserData } from '@/storage/store';
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

const PRACTICE_QUESTIONS = practiceableQuestions(QUESTION_BANK);
const PRACTICE_INDEX = indexQuestions(PRACTICE_QUESTIONS);

/** Questions learners may practise (checked or approved), plus a lookup by id. */
export function usePracticeQuestions(): {
  questions: readonly Question[];
  byId: ReadonlyMap<string, Question>;
  ids: ReadonlySet<string>;
} {
  return useMemo(
    () => ({
      questions: PRACTICE_QUESTIONS,
      byId: PRACTICE_INDEX,
      ids: new Set(PRACTICE_INDEX.keys()),
    }),
    [],
  );
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
