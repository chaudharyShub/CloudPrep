import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { findExam } from '@/domain/exam-guide';
import { buildQuestionBank, type QuestionBank } from './questionBank';
import type { BankSnapshot, QuestionLoader } from './questionLoader';

export type QuestionBankState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly bank: QuestionBank }
  | { readonly status: 'error'; readonly message: string };

interface ContextValue {
  /** State per exam id; exams not requested yet are missing. */
  readonly states: ReadonlyMap<string, QuestionBankState>;
  /** Starts loading an exam's bank unless it has started. */
  readonly request: (examId: string) => void;
  readonly retry: (examId: string) => void;
}

const QuestionBankContext = createContext<ContextValue | null>(null);

export const QUESTIONS_UNAVAILABLE =
  "Questions can't be loaded because this site isn't connected to its database.";

const LOADING: QuestionBankState = { status: 'loading' };

export interface QuestionBankProviderProps {
  /** The loader for one exam's bank, or null when the site has no question source. */
  loaderFor: (examId: string) => QuestionLoader | null;
  /** Start ready with these banks and never load them (tests). */
  initialBanks?: readonly QuestionBank[];
  children: ReactNode;
}

/**
 * Loads question banks, one per exam, when a page first needs one (D-046, D-066): from the
 * cache at once when there is one, then checks the published version and downloads a newer
 * bank if needed. Without a cache, pages wait for the download; if it fails they show an
 * error with a retry.
 */
export function QuestionBankProvider({
  loaderFor,
  initialBanks,
  children,
}: QuestionBankProviderProps) {
  const [fixed] = useState(() => new Set((initialBanks ?? []).map((bank) => bank.exam.id)));
  const [states, setStates] = useState<ReadonlyMap<string, QuestionBankState>>(
    () => new Map((initialBanks ?? []).map((bank) => [bank.exam.id, { status: 'ready', bank }])),
  );
  /** The latest run per exam; a newer run (retry) or unmounting deactivates older ones. */
  const runs = useRef(new Map<string, { active: boolean }>());
  const loaders = useRef(new Map<string, QuestionLoader | null>());

  const update = useCallback(
    (examId: string, next: (current: QuestionBankState | undefined) => QuestionBankState) => {
      setStates((previous) => {
        const current = previous.get(examId);
        const value = next(current);
        return value === current ? previous : new Map(previous).set(examId, value);
      });
    },
    [],
  );

  const start = useCallback(
    (examId: string) => {
      const exam = findExam(examId);
      if (!exam || fixed.has(examId)) return;
      const previous = runs.current.get(examId);
      if (previous) previous.active = false;
      const run = { active: true };
      runs.current.set(examId, run);
      if (!loaders.current.has(examId)) loaders.current.set(examId, loaderFor(examId));
      const loader = loaders.current.get(examId) ?? null;
      if (!loader) {
        update(examId, () => ({ status: 'error', message: QUESTIONS_UNAVAILABLE }));
        return;
      }
      update(examId, (current) => (current?.status === 'ready' ? current : LOADING));
      const show = (snapshot: BankSnapshot) => {
        if (!run.active) return;
        update(examId, (current) =>
          current?.status === 'ready' && current.bank.version === snapshot.version
            ? current
            : {
                status: 'ready',
                bank: buildQuestionBank(snapshot.questions, snapshot.version, exam),
              },
        );
      };
      void (async () => {
        const cached = await loader.cached().catch(() => null);
        if (cached) show(cached);
        try {
          show(await loader.latest(cached));
        } catch (error) {
          // With a cached bank the app keeps working (e.g. offline); otherwise say why.
          if (run.active && !cached) {
            update(examId, () => ({
              status: 'error',
              message:
                error instanceof Error ? error.message : 'The questions could not be loaded.',
            }));
          }
        }
      })();
    },
    [fixed, loaderFor, update],
  );

  const request = useCallback(
    (examId: string) => {
      if (!runs.current.has(examId)) start(examId);
    },
    [start],
  );

  const retry = useCallback(
    (examId: string) => {
      update(examId, () => LOADING);
      start(examId);
    },
    [start, update],
  );

  useEffect(() => {
    const current = runs.current;
    return () => {
      // Stop updates from runs in flight; a remount (StrictMode) starts them again.
      for (const run of current.values()) run.active = false;
      current.clear();
    };
  }, []);

  const value = useMemo(() => ({ states, request, retry }), [states, request, retry]);
  return <QuestionBankContext value={value}>{children}</QuestionBankContext>;
}

/**
 * One exam's bank state, loading it if needed; `null` (no exam) reads as loading.
 * Pages use `useQuestionBankState()` from `state/hooks`, which picks the current exam.
 */
// eslint-disable-next-line react-refresh/only-export-components -- hook belongs with its provider
export function useExamBankState(examId: string | null): {
  state: QuestionBankState;
  retry: () => void;
} {
  const value = use(QuestionBankContext);
  if (!value) throw new Error('useExamBankState must be used inside <QuestionBankProvider>.');
  const { states, request, retry } = value;
  useEffect(() => {
    if (examId) request(examId);
  }, [examId, request]);
  const retryExam = useCallback(() => {
    if (examId) retry(examId);
  }, [examId, retry]);
  return { state: (examId ? states.get(examId) : undefined) ?? LOADING, retry: retryExam };
}
