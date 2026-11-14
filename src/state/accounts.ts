import type { StorageDriver } from '@/storage/driver';
import {
  closeAccountCopy,
  markAskedToImport,
  openAccountDriver,
  signedInOwner,
  wasAskedToImport,
} from '@/storage/account';
import { createAppStore, type AppStore } from '@/storage/store';
import { createSyncEngine, type SyncEngine, type UserDataRemote } from '@/storage/sync';

/** A signed-in user's local copy and, when there's a server, its sync. */
export interface AccountSession {
  readonly userId: string;
  readonly store: AppStore;
  /** Null when there's no server (the copy then stays in this browser only). */
  readonly sync: SyncEngine | null;
}

/** Opens and closes account copies, and remembers the one-time guest data question (D-047). */
export interface AccountManager {
  /** The user whose copy is in this browser, used while sign-in is still loading. */
  owner(): string | null;
  open(userId: string): AccountSession;
  /** After sign-out: stops syncing and removes the copy once everything is on the server. */
  close(session: AccountSession): void;
  wasAskedToImport(userId: string): boolean;
  markAskedToImport(userId: string): void;
}

export function createAccountManager({
  base,
  persistent,
  createRemote,
}: {
  base: StorageDriver;
  persistent: boolean;
  /** The server for a user, or null when there is none. */
  createRemote: (userId: string) => UserDataRemote | null;
}): AccountManager {
  return {
    owner: () => signedInOwner(base),
    open(userId) {
      const driver = openAccountDriver(base, userId);
      const store = createAppStore({ driver, persistent });
      const remote = createRemote(userId);
      return {
        userId,
        store,
        sync: remote ? createSyncEngine({ store, remote, driver }) : null,
      };
    },
    close(session) {
      const pending = session.sync?.getStatus().pending ?? 0;
      session.sync?.dispose();
      // Unsent changes stay and are sent at the next sign-in on this browser. Without a
      // server the copy is the only one, so it stays too.
      closeAccountCopy(base, session.userId, !session.sync || pending > 0);
    },
    wasAskedToImport: (userId) => wasAskedToImport(base, userId),
    markAskedToImport: (userId) => {
      markAskedToImport(base, userId);
    },
  };
}
