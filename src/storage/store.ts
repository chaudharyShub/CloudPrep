import { type ExamAttempt } from '@/domain/exam/attempt';
import { examReducer, type ExamAction, type ExamSession } from '@/domain/exam/session';
import { recordAnswer, type AnswerRecord, type ProgressMap } from '@/domain/practice/progress';
import type { PracticeSessionSummary } from '@/domain/practice/session';
import type { Question } from '@/domain/questions/types';
import { snapshotKey } from '@/domain/exam/attempt';
import {
  BOOKMARKS_AREA,
  MAX_SESSION_SUMMARIES,
  PROGRESS_AREA,
  SESSIONS_AREA,
  type Bookmarks,
} from './areas';
import { QUESTION_ARCHIVE_AREA, type QuestionArchive } from './archiveArea';
import { EXAM_ATTEMPTS_AREA, MAX_EXAM_ATTEMPTS } from './attemptsArea';
import type { StorageDriver } from './driver';
import {
  BACKUP_PREFIX,
  KEY_PREFIX,
  MAX_BACKUPS_PER_KEY,
  readArea,
  storageKey,
  writeArea,
  type AreaDefinition,
  type ReadResult,
} from './envelope';
import { ACTIVE_EXAM_AREA } from './examAreas';
import {
  effectivePreferences,
  PREFERENCES_AREA,
  type PreferenceOverrides,
  type Preferences,
} from './preferencesArea';
import {
  buildExport,
  mergeData,
  replaceData,
  type ExportBundle,
  type TransferData,
} from './transfer';

/** Raw values of each storage area. */
interface StoredData {
  readonly progress: ProgressMap;
  readonly bookmarks: Bookmarks;
  readonly sessions: readonly PracticeSessionSummary[];
  /** The exam in progress, if any. */
  readonly activeExam: ExamSession | null;
  /** Submitted exams, newest first. */
  readonly attempts: readonly ExamAttempt[];
  /** Question content per revision used by stored attempts (D-031). */
  readonly questionArchive: QuestionArchive;
  /** Only the settings the learner changed (D-034). */
  readonly preferenceOverrides: PreferenceOverrides;
}

export interface UserData extends StoredData {
  /** Effective settings: defaults plus the learner's overrides. */
  readonly preferences: Preferences;
}

type AreaName = keyof StoredData;

export type StorageNotice =
  | { readonly id: string; readonly kind: 'unavailable' }
  | {
      readonly id: string;
      readonly kind: 'recovered';
      readonly area: AreaName;
      readonly backupKey: string | null;
    }
  | { readonly id: string; readonly kind: 'newer-version'; readonly area: AreaName }
  | {
      readonly id: string;
      readonly kind: 'write-failed';
      readonly area: AreaName;
      readonly reason: 'quota' | 'error';
    };

export interface StoreSnapshot {
  readonly data: UserData;
  readonly notices: readonly StorageNotice[];
}

export interface BackupInfo {
  key: string;
  /** Area name for copies of unreadable data, or "snapshot" for full backups. */
  source: string;
  createdAt: number;
  bytes: number;
}

export type ImportMode = 'merge' | 'replace';

export interface AppStore {
  getSnapshot: () => StoreSnapshot;
  subscribe: (listener: () => void) => () => void;
  /** True when data is written to persistent browser storage. */
  readonly persistent: boolean;

  // Learning
  recordAnswer: (record: AnswerRecord) => void;
  /** Returns the new bookmarked state. */
  toggleBookmark: (questionId: string, at: number) => boolean;
  addSessionSummary: (summary: PracticeSessionSummary) => void;

  // Exams
  /** Starts an exam. Refuses (returns false) if another exam is still in progress. */
  startExam: (session: ExamSession) => boolean;
  /** Applies an exam action to the active exam and saves it immediately. */
  dispatchExam: (action: ExamAction) => ExamSession | null;
  /**
   * Stores a submitted attempt, records answered questions in practice progress, archives the
   * question revisions used, and clears the active exam. Idempotent per attempt id.
   */
  completeExam: (attempt: ExamAttempt, questions: readonly Question[]) => boolean;

  /** Deletes the practice-integrity events stored with one attempt. */
  clearIntegrityLog: (attemptId: string) => void;

  // Settings
  setPreferences: (patch: Partial<Preferences>) => void;
  /** Clears saved settings so every setting uses its default. */
  resetPreferences: () => void;

  // Data management
  /** Discards the in-progress exam without recording it. */
  abandonExam: () => void;
  /** Clears practice progress (including mistake history) and practice session summaries. */
  clearLearningProgress: () => void;
  /** Clears submitted exams and their saved questions. Practice progress is kept. */
  clearExamHistory: () => void;
  /** Deletes all CloudPrep data in this browser, including backups and settings. */
  resetAll: () => void;
  exportData: () => ExportBundle;
  /** Applies validated import data (see `parseImport`). */
  importData: (incoming: Partial<TransferData>, mode: ImportMode) => void;
  /**
   * Saves a full backup (an export) in browser storage before a destructive change.
   * Returns its key, or null if it couldn't be stored (e.g. storage full).
   */
  createBackup: () => string | null;
  listBackups: () => BackupInfo[];
  readBackup: (key: string) => string | null;
  deleteBackup: (key: string) => void;
  /** Approximate characters used by CloudPrep in browser storage. */
  storageUsage: () => number;

  dismissNotice: (id: string) => void;
  /** Re-reads storage after another tab changed it (`storage` event). */
  handleExternalChange: (key: string | null) => void;
}

const AREAS: { [K in AreaName]: AreaDefinition<StoredData[K]> } = {
  progress: PROGRESS_AREA,
  bookmarks: BOOKMARKS_AREA,
  sessions: SESSIONS_AREA,
  activeExam: ACTIVE_EXAM_AREA,
  attempts: EXAM_ATTEMPTS_AREA,
  questionArchive: QUESTION_ARCHIVE_AREA,
  preferenceOverrides: PREFERENCES_AREA,
};
const AREA_NAMES = Object.keys(AREAS) as AreaName[];
const EMPTY: StoredData = {
  progress: {},
  bookmarks: {},
  sessions: [],
  activeExam: null,
  attempts: [],
  questionArchive: {},
  preferenceOverrides: {},
};
const SNAPSHOT_BACKUP = 'snapshot';

function withPreferences(stored: StoredData): UserData {
  return { ...stored, preferences: effectivePreferences(stored.preferenceOverrides) };
}

export interface CreateAppStoreOptions {
  driver: StorageDriver;
  /** False when the driver is an in-memory fallback because browser storage is unavailable. */
  persistent: boolean;
  now?: () => number;
}

export function createAppStore({
  driver,
  persistent,
  now = Date.now,
}: CreateAppStoreOptions): AppStore {
  const listeners = new Set<() => void>();
  const readOnly = new Set<AreaName>();
  let notices: StorageNotice[] = persistent ? [] : [{ id: 'unavailable', kind: 'unavailable' }];

  function noticeFor(area: AreaName, result: ReadResult<unknown>): StorageNotice | null {
    if (result.status === 'recovered') {
      return { id: `recovered:${area}`, kind: 'recovered', area, backupKey: result.backupKey };
    }
    if (result.status === 'newer-version') {
      return { id: `newer:${area}`, kind: 'newer-version', area };
    }
    return null;
  }

  function addNotice(notice: StorageNotice) {
    notices = [...notices.filter((existing) => existing.id !== notice.id), notice];
  }

  function load<K extends AreaName>(area: K): StoredData[K] {
    const result = readArea(driver, AREAS[area], now());
    if (result.status === 'newer-version') readOnly.add(area);
    else readOnly.delete(area);
    const notice = noticeFor(area, result);
    if (notice) addNotice(notice);
    return result.value;
  }

  let stored: StoredData = Object.fromEntries(
    AREA_NAMES.map((area) => [area, load(area)]),
  ) as unknown as StoredData;
  let snapshot: StoreSnapshot = { data: withPreferences(stored), notices };

  function emit() {
    snapshot = { data: withPreferences(stored), notices };
    for (const listener of listeners) listener();
  }

  /** Saves one area. Returns false if the write failed (the in-memory value still updates). */
  function save<K extends AreaName>(area: K, value: StoredData[K]): void {
    stored = { ...stored, [area]: value };
    if (readOnly.has(area)) return;
    const result = writeArea(driver, AREAS[area], value, now());
    if (result.ok) notices = notices.filter((notice) => notice.id !== `write:${area}`);
    else addNotice({ id: `write:${area}`, kind: 'write-failed', area, reason: result.reason });
  }

  function update<K extends AreaName>(area: K, value: StoredData[K]) {
    if (value === stored[area]) return;
    save(area, value);
    emit();
  }

  function removeArea(area: AreaName) {
    readOnly.delete(area);
    notices = notices.filter((notice) => !('area' in notice) || notice.area !== area);
    try {
      driver.removeItem(storageKey(AREAS[area].name));
    } catch {
      // The in-memory reset still applies.
    }
    stored = { ...stored, [area]: EMPTY[area] };
  }

  function transferData(): TransferData {
    return {
      preferences: stored.preferenceOverrides,
      progress: stored.progress,
      bookmarks: stored.bookmarks,
      sessions: stored.sessions,
      attempts: stored.attempts,
      questionArchive: stored.questionArchive,
    };
  }

  function backupKeys(): string[] {
    try {
      return driver.keys().filter((key) => key.startsWith(BACKUP_PREFIX));
    } catch {
      return [];
    }
  }

  return {
    persistent,
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    recordAnswer(record) {
      update('progress', recordAnswer(stored.progress, record));
    },
    toggleBookmark(questionId, at) {
      const current = stored.bookmarks;
      if (questionId in current) {
        update(
          'bookmarks',
          Object.fromEntries(Object.entries(current).filter(([id]) => id !== questionId)),
        );
        return false;
      }
      update('bookmarks', { ...current, [questionId]: { addedAt: at } });
      return true;
    },
    addSessionSummary(summary) {
      if (stored.sessions.some((existing) => existing.id === summary.id)) return;
      update('sessions', [summary, ...stored.sessions].slice(0, MAX_SESSION_SUMMARIES));
    },

    startExam(session) {
      const current = stored.activeExam;
      if (current && current.status !== 'submitted') return false;
      update('activeExam', session);
      return true;
    },
    dispatchExam(action) {
      const current = stored.activeExam;
      if (!current) return null;
      const next = examReducer(current, action);
      update('activeExam', next);
      return next;
    },
    completeExam(attempt, questions) {
      const active = stored.activeExam;
      if (stored.attempts.some((existing) => existing.id === attempt.id)) {
        if (active?.id === attempt.id) update('activeExam', null);
        return false;
      }
      // History first: if the tab closes between writes, the leftover active exam is
      // recognised as already recorded and cleared on the next load.
      const attempts = [attempt, ...stored.attempts].slice(0, MAX_EXAM_ATTEMPTS);
      save('attempts', attempts);
      // Archive each question revision used (once), and drop revisions no attempt uses.
      const used = new Set(
        attempts.flatMap((a) => a.questions.map((q) => snapshotKey(q.questionId, q.revision))),
      );
      const archive: Record<string, Question> = Object.fromEntries(
        Object.entries(stored.questionArchive).filter(([key]) => used.has(key)),
      );
      for (const question of questions) {
        const key = snapshotKey(question.id, question.revision);
        if (used.has(key)) archive[key] ??= question;
      }
      save('questionArchive', archive);
      let progress = stored.progress;
      for (const question of attempt.questions) {
        if (question.outcome === 'unanswered') continue;
        progress = recordAnswer(progress, {
          questionId: question.questionId,
          isCorrect: question.outcome === 'correct',
          at: attempt.submittedAt,
          sessionId: attempt.id,
        });
      }
      save('progress', progress);
      if (active?.id === attempt.id) save('activeExam', null);
      emit();
      return true;
    },

    clearIntegrityLog(attemptId) {
      update(
        'attempts',
        stored.attempts.map((attempt) =>
          attempt.id === attemptId
            ? { ...attempt, integrity: { mode: attempt.integrity.mode, events: [] } }
            : attempt,
        ),
      );
    },
    setPreferences(patch) {
      update('preferenceOverrides', { ...stored.preferenceOverrides, ...patch });
    },
    resetPreferences() {
      removeArea('preferenceOverrides');
      emit();
    },

    abandonExam() {
      const active = stored.activeExam;
      if (active && active.status !== 'submitted') update('activeExam', null);
    },
    clearLearningProgress() {
      removeArea('progress');
      removeArea('sessions');
      emit();
    },
    clearExamHistory() {
      removeArea('attempts');
      removeArea('questionArchive');
      emit();
    },
    resetAll() {
      for (const area of AREA_NAMES) removeArea(area);
      try {
        for (const key of driver.keys()) if (key.startsWith(KEY_PREFIX)) driver.removeItem(key);
      } catch {
        // Best effort.
      }
      notices = notices.filter((notice) => notice.kind === 'unavailable');
      emit();
    },

    exportData() {
      return buildExport(transferData(), now());
    },
    importData(incoming, mode) {
      const next =
        mode === 'merge'
          ? mergeData(transferData(), incoming)
          : replaceData(transferData(), incoming);
      save('preferenceOverrides', next.preferences);
      save('progress', next.progress);
      save('bookmarks', next.bookmarks);
      save('sessions', next.sessions);
      save('attempts', next.attempts);
      save('questionArchive', next.questionArchive);
      emit();
    },
    createBackup() {
      const prefix = `${BACKUP_PREFIX}${SNAPSHOT_BACKUP}:`;
      const key = `${prefix}${now()}`;
      try {
        driver.setItem(key, JSON.stringify(buildExport(transferData(), now())));
      } catch {
        return null;
      }
      const old = backupKeys()
        .filter((k) => k.startsWith(prefix))
        .sort((a, b) => Number(b.slice(prefix.length)) - Number(a.slice(prefix.length)))
        .slice(MAX_BACKUPS_PER_KEY);
      for (const stale of old) {
        try {
          driver.removeItem(stale);
        } catch {
          // Best effort.
        }
      }
      return key;
    },
    listBackups() {
      return backupKeys()
        .map((key) => {
          const rest = key.slice(BACKUP_PREFIX.length);
          const split = rest.lastIndexOf(':');
          let bytes = 0;
          try {
            bytes = driver.getItem(key)?.length ?? 0;
          } catch {
            // Unknown size.
          }
          return {
            key,
            source: rest.slice(0, split),
            createdAt: Number(rest.slice(split + 1)) || 0,
            bytes,
          };
        })
        .sort((a, b) => b.createdAt - a.createdAt);
    },
    readBackup(key) {
      if (!key.startsWith(BACKUP_PREFIX)) return null;
      try {
        return driver.getItem(key);
      } catch {
        return null;
      }
    },
    deleteBackup(key) {
      if (!key.startsWith(BACKUP_PREFIX)) return;
      try {
        driver.removeItem(key);
      } catch {
        // Best effort.
      }
      emit();
    },
    storageUsage() {
      try {
        return driver
          .keys()
          .filter((key) => key.startsWith(KEY_PREFIX))
          .reduce((sum, key) => sum + key.length + (driver.getItem(key)?.length ?? 0), 0);
      } catch {
        return 0;
      }
    },

    dismissNotice(id) {
      notices = notices.filter((notice) => notice.id !== id);
      emit();
    },
    handleExternalChange(key) {
      // `null` means another tab cleared all storage.
      const changed = AREA_NAMES.filter(
        (area) => key === null || key === storageKey(AREAS[area].name),
      );
      if (changed.length === 0) return;
      for (const area of changed) stored = { ...stored, [area]: load(area) };
      emit();
    },
  };
}
