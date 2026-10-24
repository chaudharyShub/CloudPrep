import { useCallback, useReducer, useSyncExternalStore } from 'react';
import { hasGuestData } from '@/storage/account';
import { useAuth } from '@/state/AuthProvider';
import { useUserDataScope } from '@/state/UserDataProvider';

export interface GuestImport {
  /** Signed in, and this browser has guest data that could be added. */
  readonly available: boolean;
  /** Not answered yet for this user: show the one-time question. */
  readonly shouldAsk: boolean;
  readonly counts: {
    readonly answered: number;
    readonly bookmarks: number;
    readonly sessions: number;
    readonly exams: number;
  };
  /** Merges guest data into the account (guest data stays as it is). */
  add(): void;
  /** Remembers that the user said "not now". */
  dismiss(): void;
}

/** Adding this browser's guest data to the signed-in account (D-047). */
export function useGuestImport(): GuestImport {
  const { state } = useAuth();
  const { guestStore, account, accounts } = useUserDataScope();
  const guest = useSyncExternalStore(
    guestStore.subscribe,
    guestStore.getSnapshot,
    guestStore.getSnapshot,
  ).data;
  const userId = state.status === 'signed-in' ? state.user.id : null;
  // Re-render after answering, since the flag lives outside React.
  const [, rerender] = useReducer((n: number) => n + 1, 0);

  const available = userId !== null && account?.userId === userId && hasGuestData(guest);
  const shouldAsk = available && !accounts.wasAskedToImport(userId);

  const add = useCallback(() => {
    if (!account || !userId) return;
    account.store.createBackup();
    account.store.importData(
      {
        progress: guest.progress,
        bookmarks: guest.bookmarks,
        sessions: guest.sessions,
        attempts: guest.attempts,
        questionArchive: guest.questionArchive,
      },
      'merge',
    );
    accounts.markAskedToImport(userId);
    rerender();
  }, [account, accounts, guest, userId]);

  const dismiss = useCallback(() => {
    if (!userId) return;
    accounts.markAskedToImport(userId);
    rerender();
  }, [accounts, userId]);

  return {
    available,
    shouldAsk,
    counts: {
      answered: Object.keys(guest.progress).length,
      bookmarks: Object.keys(guest.bookmarks).length,
      sessions: guest.sessions.length,
      exams: guest.attempts.length,
    },
    add,
    dismiss,
  };
}

/** "120 practice answers, 3 bookmarks and 2 mock exams". */
export function describeGuestData(counts: GuestImport['counts']): string {
  const parts = [
    counts.answered > 0 && plural(counts.answered, 'practice answer'),
    counts.bookmarks > 0 && plural(counts.bookmarks, 'bookmark'),
    counts.sessions > 0 && plural(counts.sessions, 'practice session'),
    counts.exams > 0 && plural(counts.exams, 'mock exam'),
  ].filter((part): part is string => typeof part === 'string');
  if (parts.length <= 1) return parts[0] ?? 'nothing';
  return `${parts.slice(0, -1).join(', ')} and ${parts.at(-1) ?? ''}`;
}

function plural(count: number, noun: string): string {
  return `${count.toLocaleString('en')} ${noun}${count === 1 ? '' : 's'}`;
}
