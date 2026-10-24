import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { buildQuestionBank, type QuestionBank } from './questionBank';
import type { BankSnapshot, QuestionLoader } from './questionLoader';

export type QuestionBankState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly bank: QuestionBank }
  | { readonly status: 'error'; readonly message: string };

interface ContextValue {
  readonly state: QuestionBankState;
  readonly retry: () => void;
}

const QuestionBankContext = createContext<ContextValue | null>(null);

export const QUESTIONS_UNAVAILABLE =
  "Questions can't be loaded because this site isn't connected to its database.";

export interface QuestionBankProviderProps {
  /** Null when the site has no question source (no Supabase settings). */
  loader: QuestionLoader | null;
  /** Start ready with this bank and skip loading (tests). */
  initialBank?: QuestionBank;
  children: ReactNode;
}

/**
 * Loads the question bank (D-046): from the cache at once when there is one, then checks the
 * published version and downloads a newer bank if needed. Without a cache, pages wait for the
 * download; if it fails they show an error with a retry.
 */
export function QuestionBankProvider({ loader, initialBank, children }: QuestionBankProviderProps) {
  const [state, setState] = useState<QuestionBankState>(() =>
    initialBank
      ? { status: 'ready', bank: initialBank }
      : loader
        ? { status: 'loading' }
        : { status: 'error', message: QUESTIONS_UNAVAILABLE },
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (initialBank || !loader) return;
    // An object, so the async callbacks see the cleanup's change.
    const run = { active: true };
    const show = (snapshot: BankSnapshot) => {
      if (!run.active) return;
      setState((current) =>
        current.status === 'ready' && current.bank.version === snapshot.version
          ? current
          : { status: 'ready', bank: buildQuestionBank(snapshot.questions, snapshot.version) },
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
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'The questions could not be loaded.',
          });
        }
      }
    })();
    return () => {
      run.active = false;
    };
  }, [loader, initialBank, attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  const value = useMemo(() => ({ state, retry }), [state, retry]);
  return <QuestionBankContext value={value}>{children}</QuestionBankContext>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook belongs with its provider
export function useQuestionBankState(): ContextValue {
  const value = use(QuestionBankContext);
  if (!value) throw new Error('useQuestionBankState must be used inside <QuestionBankProvider>.');
  return value;
}

/** The loaded bank. Only for pages under `RequireQuestions`, where it is always ready. */
// eslint-disable-next-line react-refresh/only-export-components -- hook belongs with its provider
export function useQuestionBank(): QuestionBank {
  const { state } = useQuestionBankState();
  if (state.status !== 'ready') throw new Error('The question bank is not loaded yet.');
  return state.bank;
}
