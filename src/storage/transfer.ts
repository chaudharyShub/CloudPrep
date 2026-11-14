import { snapshotKey, type ExamAttempt } from '@/domain/exam/attempt';
import type { ProgressMap, QuestionProgress } from '@/domain/practice/progress';
import type { PracticeSessionSummary } from '@/domain/practice/session';
import type { Question } from '@/domain/questions/types';
import {
  BOOKMARKS_AREA,
  MAX_SESSION_SUMMARIES,
  PROGRESS_AREA,
  SESSIONS_AREA,
  type Bookmarks,
} from './areas';
import { QUESTION_ARCHIVE_AREA, type QuestionArchive } from './archiveArea';
import { EXAM_ATTEMPTS_AREA, MAX_EXAM_ATTEMPTS } from './attemptsArea';
import { APP_ID, decodeArea, type AreaDefinition } from './envelope';
import { isRecord } from './guards';
import { PREFERENCES_AREA, type PreferenceOverrides } from './preferencesArea';

/**
 * Export / import of user data (docs/DECISIONS.md D-035).
 *
 * Imported files are untrusted: they are parsed with JSON.parse only (never evaluated),
 * size-limited, and every area goes through the same version check, migrations and
 * validation as browser storage. Text from a file is only ever rendered as text.
 * The exam in progress is never exported or imported.
 */

export const EXPORT_FORMAT = 1;
export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

/** Data that can be exported and imported. */
export interface TransferData {
  readonly preferences: PreferenceOverrides;
  readonly progress: ProgressMap;
  readonly bookmarks: Bookmarks;
  readonly sessions: readonly PracticeSessionSummary[];
  readonly attempts: readonly ExamAttempt[];
  readonly questionArchive: QuestionArchive;
}

export type TransferAreaName = keyof TransferData;

export const TRANSFER_AREAS: { [K in TransferAreaName]: AreaDefinition<TransferData[K]> } = {
  preferences: PREFERENCES_AREA,
  progress: PROGRESS_AREA,
  bookmarks: BOOKMARKS_AREA,
  sessions: SESSIONS_AREA,
  attempts: EXAM_ATTEMPTS_AREA,
  questionArchive: QUESTION_ARCHIVE_AREA,
};
const TRANSFER_AREA_NAMES = Object.keys(TRANSFER_AREAS) as TransferAreaName[];

export interface ExportBundle {
  app: typeof APP_ID;
  kind: 'export';
  format: number;
  exportedAt: string;
  /** Keyed by storage area name, each with its own schema version. */
  areas: Record<string, { schemaVersion: number; data: unknown }>;
}

export function buildExport(data: TransferData, now: number): ExportBundle {
  const areas: ExportBundle['areas'] = {};
  for (const name of TRANSFER_AREA_NAMES) {
    const area = TRANSFER_AREAS[name];
    areas[area.name] = { schemaVersion: area.currentVersion, data: data[name] };
  }
  return {
    app: APP_ID,
    kind: 'export',
    format: EXPORT_FORMAT,
    exportedAt: new Date(now).toISOString(),
    areas,
  };
}

export function exportFileName(now: number): string {
  return `cloudprep-export-${new Date(now).toISOString().slice(0, 10)}.json`;
}

export interface ImportPreview {
  exportedAt: string | null;
  attempts: number;
  /** Oldest and newest exam completion times in the file. */
  attemptRange: { from: number; to: number } | null;
  progressQuestions: number;
  bookmarks: number;
  sessions: number;
  settings: number;
  /** Invalid entries in the file that will be skipped. */
  skippedEntries: number;
  /** Areas the file doesn't contain; they are left unchanged. */
  missingAreas: TransferAreaName[];
}

export type ImportError =
  | { code: 'too-large' }
  | { code: 'not-json' }
  | { code: 'not-cloudprep' }
  | { code: 'newer-format' }
  | { code: 'newer-area'; area: TransferAreaName }
  | { code: 'invalid-area'; area: TransferAreaName }
  | { code: 'empty' };

export type ImportResult =
  | {
      ok: true;
      /** Only the areas present in the file. */
      data: Partial<TransferData>;
      preview: ImportPreview;
    }
  | { ok: false; error: ImportError };

export function describeImportError(error: ImportError): string {
  switch (error.code) {
    case 'too-large':
      return 'This file is larger than 5 MB, which is far more than a CloudPrep export. Choose a CloudPrep export file.';
    case 'not-json':
      return "This file isn't valid JSON. Choose a file exported from CloudPrep.";
    case 'not-cloudprep':
      return "This file isn't a CloudPrep export.";
    case 'newer-format':
    case 'newer-area':
      return 'This file was exported from a newer version of CloudPrep. Reload the page to update, then try again.';
    case 'invalid-area':
      return `The ${AREA_LABELS[error.area]} in this file are damaged or in an unknown format, so nothing was imported.`;
    case 'empty':
      return 'This export contains no CloudPrep data.';
  }
}

export const AREA_LABELS: Record<TransferAreaName, string> = {
  preferences: 'settings',
  progress: 'practice progress',
  bookmarks: 'bookmarks',
  sessions: 'practice sessions',
  attempts: 'exam history',
  questionArchive: 'saved exam questions',
};

/**
 * Validates an export file's text. Rejects the whole file if any included area is
 * unusable, so an import never half-applies. Individual invalid entries inside an area
 * are skipped and counted in the preview.
 */
export function parseImport(text: string): ImportResult {
  if (text.length > MAX_IMPORT_BYTES) return { ok: false, error: { code: 'too-large' } };
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: { code: 'not-json' } };
  }
  if (!isRecord(json) || json['app'] !== APP_ID || json['kind'] !== 'export') {
    return { ok: false, error: { code: 'not-cloudprep' } };
  }
  if (typeof json['format'] !== 'number' || !Number.isInteger(json['format'])) {
    return { ok: false, error: { code: 'not-cloudprep' } };
  }
  if (json['format'] > EXPORT_FORMAT) return { ok: false, error: { code: 'newer-format' } };
  const areas = json['areas'];
  if (!isRecord(areas)) return { ok: false, error: { code: 'not-cloudprep' } };

  const data: Record<string, unknown> = {};
  const missingAreas: TransferAreaName[] = [];
  let skippedEntries = 0;
  for (const name of TRANSFER_AREA_NAMES) {
    const area = TRANSFER_AREAS[name];
    const payload = areas[area.name];
    if (payload === undefined) {
      missingAreas.push(name);
      continue;
    }
    if (!isRecord(payload)) return { ok: false, error: { code: 'invalid-area', area: name } };
    const decoded = decodeArea(
      area as AreaDefinition<unknown>,
      payload['schemaVersion'],
      payload['data'],
    );
    if (decoded.status === 'newer') return { ok: false, error: { code: 'newer-area', area: name } };
    if (decoded.status === 'invalid')
      return { ok: false, error: { code: 'invalid-area', area: name } };
    data[name] = decoded.value;
    skippedEntries += decoded.dropped;
  }
  if (missingAreas.length === TRANSFER_AREA_NAMES.length) {
    return { ok: false, error: { code: 'empty' } };
  }

  const imported = data as Partial<TransferData>;
  const attempts = imported.attempts ?? [];
  const times = attempts.map((a) => a.submittedAt);
  const exportedAt = typeof json['exportedAt'] === 'string' ? json['exportedAt'] : null;
  return {
    ok: true,
    data: imported,
    preview: {
      exportedAt: exportedAt && !Number.isNaN(Date.parse(exportedAt)) ? exportedAt : null,
      attempts: attempts.length,
      attemptRange: times.length ? { from: Math.min(...times), to: Math.max(...times) } : null,
      progressQuestions: Object.keys(imported.progress ?? {}).length,
      bookmarks: Object.keys(imported.bookmarks ?? {}).length,
      sessions: (imported.sessions ?? []).length,
      settings: Object.keys(imported.preferences ?? {}).length,
      skippedEntries,
      missingAreas,
    },
  };
}

/** For one question, keep the record with more attempts (ties: the more recent answer). */
function pickProgress(a: QuestionProgress, b: QuestionProgress): QuestionProgress {
  if (a.attempts !== b.attempts) return a.attempts > b.attempts ? a : b;
  return b.lastAnsweredAt > a.lastAnsweredAt ? b : a;
}

/** Keeps only archived question revisions that some attempt still uses. */
export function pruneArchive(
  archive: QuestionArchive,
  attempts: readonly ExamAttempt[],
): QuestionArchive {
  const used = new Set(
    attempts.flatMap((a) => a.questions.map((q) => snapshotKey(q.questionId, q.revision))),
  );
  return Object.fromEntries(Object.entries(archive).filter(([key]) => used.has(key)));
}

/**
 * Merge strategy. Deterministic and idempotent: importing the same file twice changes
 * nothing the second time.
 * - Exam attempts and practice sessions: union by id; existing records win on conflict.
 * - Bookmarks: union; the earlier bookmark date is kept.
 * - Practice progress: per question, the record with more attempts (ties: the more recent).
 *   Counts are never added together, which would double-count shared history.
 * - Saved questions: union, then pruned to revisions used by the merged history.
 * - Settings: the current settings are kept.
 */
export function mergeData(current: TransferData, incoming: Partial<TransferData>): TransferData {
  const attempts = unionById(current.attempts, incoming.attempts ?? [])
    .sort((a, b) => b.submittedAt - a.submittedAt)
    .slice(0, MAX_EXAM_ATTEMPTS);
  const sessions = unionById(current.sessions, incoming.sessions ?? [])
    .sort((a, b) => b.finishedAt - a.finishedAt)
    .slice(0, MAX_SESSION_SUMMARIES);

  const bookmarks: Record<string, { addedAt: number }> = { ...current.bookmarks };
  for (const [id, entry] of Object.entries(incoming.bookmarks ?? {})) {
    const existing = bookmarks[id];
    bookmarks[id] = existing && existing.addedAt <= entry.addedAt ? existing : entry;
  }

  const progress: Record<string, QuestionProgress> = { ...current.progress };
  for (const [id, entry] of Object.entries(incoming.progress ?? {})) {
    const existing = progress[id];
    progress[id] = existing ? pickProgress(existing, entry) : entry;
  }

  const archive: Record<string, Question> = {
    ...(incoming.questionArchive ?? {}),
    ...current.questionArchive,
  };
  return {
    preferences: current.preferences,
    progress,
    bookmarks,
    sessions,
    attempts,
    questionArchive: pruneArchive(archive, attempts),
  };
}

/** Replace strategy: areas present in the file replace the current ones; others are kept. */
export function replaceData(current: TransferData, incoming: Partial<TransferData>): TransferData {
  const merged = { ...current, ...incoming };
  return { ...merged, questionArchive: pruneArchive(merged.questionArchive, merged.attempts) };
}

function unionById<T extends { id: string }>(current: readonly T[], incoming: readonly T[]): T[] {
  const ids = new Set(current.map((item) => item.id));
  return [...current, ...incoming.filter((item) => !ids.has(item.id))];
}
