import { useId, useRef, useState, type ChangeEvent } from 'react';
import {
  ArchiveRestore,
  Download,
  FileUp,
  HardDrive,
  Trash2,
  TriangleAlert,
  Upload,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { buttonClasses } from '@/components/ui/buttonStyles';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SegmentedControl } from '@/components/ui/FormControls';
import { Notice } from '@/components/ui/Notice';
import { useToast } from '@/components/ui/Toast';
import { downloadText, formatBytes } from '@/lib/download';
import { formatDateTime } from '@/lib/format';
import { useAppStore } from '@/state/StoreProvider';
import { useUserData } from '@/state/hooks';
import type { BackupInfo, ImportMode } from '@/storage/store';
import {
  AREA_LABELS,
  describeImportError,
  exportFileName,
  MAX_IMPORT_BYTES,
  parseImport,
  type ImportResult,
} from '@/storage/transfer';

type ClearAction = 'exam' | 'learning' | 'history' | 'all';
type ReadyImport = Extract<ImportResult, { ok: true }> & { source: string };

const SOURCE_LABELS: Record<string, string> = {
  snapshot: 'Full backup',
  progress: 'Unreadable practice progress',
  bookmarks: 'Unreadable bookmarks',
  practiceSessions: 'Unreadable practice sessions',
  activeExam: 'Unreadable exam in progress',
  examAttempts: 'Unreadable exam history',
  questionArchive: 'Unreadable saved questions',
  preferences: 'Unreadable settings',
};

/** Data location, export/import, recovery backups, and separate clear actions. */
export function DataManagement() {
  const store = useAppStore();
  // Subscribing re-renders this section whenever stored data changes.
  const data = useUserData();
  const { showToast } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const fileInputId = useId();
  const [importError, setImportError] = useState<string | null>(null);
  const [ready, setReady] = useState<ReadyImport | null>(null);
  const [mode, setMode] = useState<ImportMode>('merge');
  const [confirmImport, setConfirmImport] = useState(false);
  const [clearing, setClearing] = useState<ClearAction | null>(null);
  const [deleting, setDeleting] = useState<BackupInfo | null>(null);

  const backups = store.listBackups();
  const usage = store.storageUsage();
  const hasExam = data.activeExam !== null && data.activeExam.status !== 'submitted';

  function exportNow() {
    const now = Date.now();
    downloadText(exportFileName(now), JSON.stringify(store.exportData(), null, 2));
    showToast({ title: 'Export downloaded', tone: 'success' });
  }

  function loadImport(text: string, source: string, preferredMode: ImportMode = 'merge') {
    const result = parseImport(text);
    if (!result.ok) {
      setReady(null);
      setImportError(describeImportError(result.error));
      return;
    }
    setImportError(null);
    setMode(preferredMode);
    setReady({ ...result, source });
  }

  async function onFileChosen(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow choosing the same file again
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      setReady(null);
      setImportError(describeImportError({ code: 'too-large' }));
      return;
    }
    loadImport(await file.text(), file.name);
  }

  function applyImport() {
    if (!ready) return;
    const backupKey = store.createBackup();
    store.importData(ready.data, mode);
    setConfirmImport(false);
    setReady(null);
    showToast({
      tone: 'success',
      title: mode === 'merge' ? 'Data merged' : 'Data replaced',
      description: backupKey
        ? 'Your previous data was saved as a backup under Recovery.'
        : "Your previous data couldn't be backed up (storage is full or unavailable).",
    });
  }

  function clear(action: ClearAction) {
    setClearing(null);
    if (action === 'exam') store.abandonExam();
    if (action === 'learning') store.clearLearningProgress();
    if (action === 'history') store.clearExamHistory();
    if (action === 'all') store.resetAll();
    showToast({ title: CLEAR_COPY[action].done, tone: 'success' });
  }

  const preview = ready?.preview;
  return (
    <>
      <Card>
        <CardHeader title="Where your data is stored" />
        <CardBody className="flex flex-col gap-3 text-sm text-fg-muted">
          <p className="flex items-center gap-2 text-fg">
            <HardDrive size={16} aria-hidden="true" />
            {store.persistent
              ? `Saved in this browser on this device · about ${formatBytes(usage)}`
              : 'Not being saved: this browser is blocking storage (for example in a private window).'}
          </p>
          <p>
            CloudPrep has no account or server. Your progress, history and settings exist only in
            this browser on this device. They aren&apos;t synced to other browsers or devices, and
            clearing your browsing data (or closing a private window) removes them. Export a copy
            regularly if you want a backup.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Export and import"
          description="Move your data to another browser or keep a backup. The exam in progress, if any, isn't included."
        />
        <CardBody className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={Download} onClick={exportNow}>
              Export data
            </Button>
            <input
              ref={fileInput}
              id={fileInputId}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(event) => {
                void onFileChosen(event);
              }}
            />
            <label htmlFor={fileInputId} className={buttonClasses({ variant: 'secondary' })}>
              <Upload size={18} strokeWidth={1.75} aria-hidden="true" />
              Import data
            </label>
          </div>

          {importError && (
            <Notice tone="danger" title="This file can't be imported">
              {importError}
            </Notice>
          )}

          {ready && preview && (
            <section
              aria-labelledby={`${fileInputId}-preview`}
              className="rounded-md border border-border-strong bg-surface-2 p-4"
            >
              <h3
                id={`${fileInputId}-preview`}
                className="flex items-center gap-2 text-sm font-semibold text-fg"
              >
                <FileUp size={16} aria-hidden="true" />
                Ready to import: {ready.source}
              </h3>
              {preview.exportedAt && (
                <p className="mt-1 text-xs text-fg-muted">
                  Exported {formatDateTime(Date.parse(preview.exportedAt))}
                </p>
              )}
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-3">
                {[
                  ['Exams', preview.attempts],
                  ['Practised questions', preview.progressQuestions],
                  ['Bookmarks', preview.bookmarks],
                  ['Practice sessions', preview.sessions],
                  ['Changed settings', preview.settings],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-fg-muted">{label}</dt>
                    <dd className="font-medium text-fg tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
              {preview.attemptRange && (
                <p className="mt-2 text-xs text-fg-muted">
                  Exams from {formatDateTime(preview.attemptRange.from)} to{' '}
                  {formatDateTime(preview.attemptRange.to)}
                </p>
              )}
              {preview.skippedEntries > 0 && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-warning">
                  <TriangleAlert size={14} aria-hidden="true" />
                  {preview.skippedEntries} invalid entr{preview.skippedEntries === 1 ? 'y' : 'ies'}{' '}
                  in the file will be skipped.
                </p>
              )}
              {preview.missingAreas.length > 0 && (
                <p className="mt-2 text-xs text-fg-muted">
                  Not in this file (left unchanged):{' '}
                  {preview.missingAreas.map((area) => AREA_LABELS[area]).join(', ')}.
                </p>
              )}
              <div className="mt-4">
                <SegmentedControl
                  label="How to import"
                  value={mode}
                  onValueChange={setMode}
                  options={[
                    { value: 'merge', label: 'Merge with my data' },
                    { value: 'replace', label: 'Replace my data' },
                  ]}
                  description={
                    mode === 'merge'
                      ? 'Adds exams, sessions and bookmarks you don’t have. For practice progress, keeps whichever record has more answers. Keeps your current settings.'
                      : 'Replaces your data with the file’s, for everything the file contains. A backup of your current data is saved first.'
                  }
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    setConfirmImport(true);
                  }}
                >
                  {mode === 'merge' ? 'Merge data' : 'Replace data'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setReady(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </section>
          )}
        </CardBody>
      </Card>

      <Card id="recovery" className="scroll-mt-24">
        <CardHeader
          title="Recovery"
          description="Copies CloudPrep kept in this browser: full backups made before imports, and copies of any saved data that couldn't be read."
        />
        <CardBody>
          {backups.length === 0 ? (
            <p className="text-sm text-fg-muted">No backups or recovered copies.</p>
          ) : (
            <ul className="divide-y divide-border">
              {backups.map((backup) => (
                <li
                  key={backup.key}
                  className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm">
                    <span className="flex items-center gap-2 text-fg">
                      {SOURCE_LABELS[backup.source] ?? 'Saved copy'}
                      {backup.source !== 'snapshot' && <Badge tone="warning">Damaged data</Badge>}
                    </span>
                    <span className="text-xs text-fg-muted">
                      {backup.createdAt ? formatDateTime(backup.createdAt) : 'Unknown date'} ·{' '}
                      {formatBytes(backup.bytes)}
                    </span>
                  </span>
                  <span className="flex flex-wrap gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Download}
                      aria-label={`Download ${SOURCE_LABELS[backup.source] ?? 'saved copy'}`}
                      onClick={() => {
                        const text = store.readBackup(backup.key);
                        if (text !== null)
                          downloadText(`cloudprep-${backup.source}-${backup.createdAt}.json`, text);
                      }}
                    >
                      Download
                    </Button>
                    {backup.source === 'snapshot' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={ArchiveRestore}
                        onClick={() => {
                          const text = store.readBackup(backup.key);
                          if (text !== null)
                            loadImport(
                              text,
                              `Backup from ${formatDateTime(backup.createdAt)}`,
                              'replace',
                            );
                        }}
                      >
                        Restore
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Trash2}
                      aria-label={`Delete ${SOURCE_LABELS[backup.source] ?? 'saved copy'}`}
                      onClick={() => {
                        setDeleting(backup);
                      }}
                    >
                      Delete
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Clear data"
          description="Each action clears only what it says and asks for confirmation first."
        />
        <CardBody>
          <ul className="divide-y divide-border">
            {(['exam', 'learning', 'history', 'all'] as const).map((action) => {
              const copy = CLEAR_COPY[action];
              const disabled =
                (action === 'exam' && !hasExam) ||
                (action === 'learning' &&
                  Object.keys(data.progress).length === 0 &&
                  data.sessions.length === 0) ||
                (action === 'history' && data.attempts.length === 0);
              return (
                <li
                  key={action}
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="text-sm font-medium text-fg">{copy.title}</h3>
                    <p className="mt-1 text-sm text-fg-muted">{copy.summary}</p>
                  </div>
                  <Button
                    variant={action === 'all' ? 'danger' : 'secondary'}
                    size="sm"
                    icon={Trash2}
                    disabled={disabled}
                    onClick={() => {
                      setClearing(action);
                    }}
                    className="shrink-0"
                  >
                    {copy.button}
                  </Button>
                </li>
              );
            })}
          </ul>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={confirmImport}
        title={mode === 'merge' ? 'Merge this data?' : 'Replace your data?'}
        description={
          mode === 'merge'
            ? 'The file’s data will be added to yours. A backup of your current data is saved first.'
            : 'Everything the file contains replaces your current data. A backup of your current data is saved first, under Recovery.'
        }
        confirmLabel={mode === 'merge' ? 'Merge data' : 'Replace data'}
        tone={mode === 'replace' ? 'danger' : 'primary'}
        {...(mode === 'replace' ? { confirmationText: 'REPLACE' } : {})}
        onCancel={() => {
          setConfirmImport(false);
        }}
        onConfirm={applyImport}
      />
      <ConfirmDialog
        open={clearing !== null}
        title={clearing ? CLEAR_COPY[clearing].confirmTitle : ''}
        description={clearing ? CLEAR_COPY[clearing].confirmBody : ''}
        confirmLabel={clearing ? CLEAR_COPY[clearing].button : ''}
        tone="danger"
        {...(clearing === 'all' ? { confirmationText: 'RESET' } : {})}
        onCancel={() => {
          setClearing(null);
        }}
        onConfirm={() => {
          if (clearing) clear(clearing);
        }}
      />
      <ConfirmDialog
        open={deleting !== null}
        title="Delete this copy?"
        description="It will be removed from this browser. Download it first if you might need it."
        confirmLabel="Delete copy"
        tone="danger"
        onCancel={() => {
          setDeleting(null);
        }}
        onConfirm={() => {
          if (deleting) store.deleteBackup(deleting.key);
          setDeleting(null);
        }}
      />
    </>
  );
}

const CLEAR_COPY: Record<
  ClearAction,
  {
    title: string;
    summary: string;
    button: string;
    confirmTitle: string;
    confirmBody: string;
    done: string;
  }
> = {
  exam: {
    title: 'Exam in progress',
    summary: 'Discard the exam you are taking. It won’t be scored or saved to history.',
    button: 'Discard exam',
    confirmTitle: 'Discard the exam in progress?',
    confirmBody:
      'Its answers are deleted and it won’t appear in your history. This can’t be undone.',
    done: 'Exam discarded',
  },
  learning: {
    title: 'Learning progress',
    summary:
      'Practice answers, mistake history and practice session summaries. Exam history and bookmarks are kept.',
    button: 'Clear progress',
    confirmTitle: 'Clear learning progress?',
    confirmBody:
      'Practice answers, mistakes and session summaries are deleted from this browser. This can’t be undone; export your data first if you want a copy.',
    done: 'Learning progress cleared',
  },
  history: {
    title: 'Exam history',
    summary: 'Submitted exams and their saved questions. Learning progress is kept.',
    button: 'Clear history',
    confirmTitle: 'Clear exam history?',
    confirmBody:
      'All submitted exam results are deleted from this browser. This can’t be undone; export your data first if you want a copy.',
    done: 'Exam history cleared',
  },
  all: {
    title: 'Everything',
    summary:
      'All CloudPrep data in this browser: progress, history, bookmarks, settings, backups and any exam in progress.',
    button: 'Reset everything',
    confirmTitle: 'Reset all CloudPrep data?',
    confirmBody:
      'Everything CloudPrep stores in this browser is deleted, including backups. This can’t be undone.',
    done: 'All data was reset',
  },
};
