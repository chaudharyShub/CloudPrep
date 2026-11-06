import { useCallback } from 'react';
import { buildAttempt, type ExamAttempt } from '@/domain/exam/attempt';
import type { ExamConfig } from '@/domain/exam/config';
import type { IntegrityMode } from '@/domain/exam/integrity';
import { selectExamQuestions, type SelectionResult } from '@/domain/exam/select';
import { createExamSession, type SubmitReason } from '@/domain/exam/session';
import type { Question } from '@/domain/questions/types';
import { newId, newSeed } from '@/lib/ids';
import { useActiveExam, useQuestionBankState } from '@/state/hooks';
import { useExamBankState } from '@/state/QuestionBankProvider';
import { useAppStore } from '@/state/StoreProvider';

export interface ExamActions {
  /**
   * Creates and stores a new exam of the current exam (`config.examId`). Returns the selection
   * result (with shortfalls if any); `started` is false if another exam is in progress.
   */
  start: (
    config: ExamConfig,
    integrityMode?: IntegrityMode,
  ) => SelectionResult & { started: boolean };
  /**
   * Submits the active exam exactly once and stores the attempt. Safe to call repeatedly or
   * concurrently (button + timer): later calls return null. Also null while that exam's
   * question bank is still loading (nothing is submitted then).
   */
  submit: (reason: SubmitReason) => ExamAttempt | null;
}

export function useExamActions(): ExamActions {
  const store = useAppStore();
  // New exams use the current exam's bank; submitting uses the active exam's own bank, which
  // can belong to another exam than the page's (D-066).
  const { state } = useQuestionBankState();
  const bank = state.status === 'ready' ? state.bank : null;
  const active = useActiveExam();
  const activeState = useExamBankState(active?.examId ?? null).state;
  const activeBank = activeState.status === 'ready' ? activeState.bank : null;

  const start = useCallback<ExamActions['start']>(
    (config, integrityMode = 'standard') => {
      if (!bank) throw new Error('The question bank is not loaded yet.');
      if (config.examId !== bank.exam.id) throw new Error('The exam and question bank differ.');
      const { questions: examQuestions, byId } = bank.examQuestions;
      const { attempts, preferences } = store.getSnapshot().data;
      const seed = newSeed();
      const result = selectExamQuestions({
        questions: examQuestions,
        questionCount: config.questionCount,
        domains: bank.exam.domains,
        seed,
        // Question ids are unique across exams, so every attempt can be used here.
        seenIds: new Set(attempts.flatMap((a) => a.questions.map((q) => q.questionId))),
      });
      if (!result.ok) return { ...result, started: false };
      const questions = result.questionIds
        .map((id) => byId.get(id))
        .filter((q): q is Question => q !== undefined);
      const session = createExamSession({
        id: newId(),
        config,
        bankVersion: bank.version,
        seed,
        startedAt: Date.now(),
        questions,
        shuffleOptions: preferences.shuffleOptions,
        integrityMode,
      });
      return { ...result, started: store.startExam(session) };
    },
    [store, bank],
  );

  const submit = useCallback<ExamActions['submit']>(
    (reason) => {
      const current = store.getSnapshot().data.activeExam;
      if (!current || activeBank?.exam.id !== current.examId) return null;
      const { byId } = activeBank.examQuestions;
      // A session left in `submitted` state (e.g. the tab closed mid-save) is finalised as is.
      const submitted =
        current.status === 'submitted'
          ? current
          : store.dispatchExam({ type: 'submit', at: Date.now(), reason });
      if (submitted?.status !== 'submitted') return null;
      const { benchmarkPercent } = store.getSnapshot().data.preferences;
      const attempt = buildAttempt(submitted, byId, benchmarkPercent);
      const used = attempt.questions
        .map((q) => byId.get(q.questionId))
        .filter((q): q is Question => q !== undefined);
      store.completeExam(attempt, used);
      return attempt;
    },
    [store, activeBank],
  );

  return { start, submit };
}
