import { useState } from 'react';
import { Link } from 'react-router';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { ExamAttempt } from '@/domain/exam/attempt';
import { EVENT_DESCRIPTIONS, summarizeLog } from '@/domain/exam/integrity';
import { MAX_STRIKES, proctorStatus, type ProctorRole } from '@/domain/exam/proctor';
import { useAppStore } from '@/state/StoreProvider';

function elapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

const timeFormat = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
});

const ROLE_TEXT: Record<ProctorRole, string> = {
  info: 'Logged',
  warning: 'Warning',
  'final-warning': 'Final warning',
  merged: 'Same incident',
  ended: 'Exam ended',
};

const DESCRIPTIONS = {
  focus:
    'Strict practice with focus monitoring. Events are browser signals, not evidence: each one can have an innocent cause.',
  webcam:
    'Strict practice with webcam checks (a retired mode). Events are browser signals, not evidence: each one can have an innocent cause.',
  proctored:
    'AI-proctored exam. The proctor applied strict rules to these events; its detection is approximate.',
} as const;

/**
 * Timeline of integrity events. Strict practice shows no verdict: browser events are
 * imperfect signals. Proctored exams also show what the proctor did about each event.
 */
export function IntegrityReport({ attempt }: { attempt: ExamAttempt }) {
  const store = useAppStore();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { mode, events } = attempt.integrity;
  if (mode === 'standard') return null;
  const counts = summarizeLog(attempt.integrity);
  const hidden = counts['tab-hidden'] ?? 0;
  const blurred = counts['window-blur'] ?? 0;
  const exits = counts['fullscreen-exited'] ?? 0;
  const proctored = mode === 'proctored';
  const verdict = proctored ? proctorStatus(attempt.integrity) : null;

  return (
    <Card className="mt-6">
      <CardHeader
        title={proctored ? 'Proctor report' : 'Practice integrity report'}
        description={DESCRIPTIONS[mode]}
        action={
          events.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              icon={Trash2}
              onClick={() => {
                setConfirmDelete(true);
              }}
            >
              Delete log
            </Button>
          )
        }
      />
      <CardBody>
        {events.length === 0 ? (
          <p className="text-sm text-fg-muted">No events are stored for this exam.</p>
        ) : (
          <>
            {verdict ? (
              <p className="mb-4 text-sm text-fg-muted">
                {verdict.endedBy
                  ? `The proctor ended the exam: ${EVENT_DESCRIPTIONS[verdict.endedBy.type].label}.`
                  : `Warnings: ${String(verdict.strikeCount)} of ${String(MAX_STRIKES - 1)}. The exam wasn’t ended.`}
              </p>
            ) : (
              <p className="mb-4 text-sm text-fg-muted">
                Tab hidden {hidden} time{hidden === 1 ? '' : 's'} · window lost focus {blurred} time
                {blurred === 1 ? '' : 's'} · fullscreen exited {exits} time{exits === 1 ? '' : 's'}.
                CloudPrep doesn&apos;t judge what these mean.
              </p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Integrity events in time order</caption>
                <thead>
                  <tr className="border-b border-border text-left text-xs text-fg-muted">
                    <th scope="col" className="pb-2 font-medium">
                      Time
                    </th>
                    <th scope="col" className="pb-2 font-medium">
                      Category
                    </th>
                    <th scope="col" className="pb-2 font-medium">
                      Event
                    </th>
                    <th scope="col" className="pb-2 font-medium">
                      {proctored ? 'Proctor' : 'Action needed'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event, index) => {
                    const info = EVENT_DESCRIPTIONS[event.type];
                    return (
                      <tr
                        key={`${event.at}-${index}`}
                        className="border-b border-border align-top last:border-0"
                      >
                        <td className="py-2 pr-3 whitespace-nowrap text-fg-muted tabular-nums">
                          {elapsed(event.at - attempt.startedAt)}
                          <span className="block text-xs text-fg-subtle">
                            {timeFormat.format(event.at)}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-fg-muted">{info.category}</td>
                        <td className="py-2 pr-3">
                          <span className="font-medium text-fg">{info.label}</span>
                          <span className="block text-fg-muted">{info.explanation}</span>
                        </td>
                        <td className="py-2 text-fg-muted">
                          {verdict ? (
                            <>
                              <span className="font-medium text-fg">
                                {ROLE_TEXT[verdict.roles[index] ?? 'info']}
                              </span>
                              {info.action && <span className="block">{info.action}</span>}
                            </>
                          ) : (
                            (info.action ?? 'None')
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
        <p className="mt-4 text-xs text-fg-subtle">
          Stored only in this browser: event type and time, nothing else.{' '}
          <Link
            to="/privacy"
            className="font-medium text-accent-fg underline-offset-4 hover:underline"
          >
            Privacy details
          </Link>
        </p>
      </CardBody>
      <ConfirmDialog
        open={confirmDelete}
        title="Delete this integrity log?"
        description="The event timeline for this exam is removed from this browser. Your score is unaffected."
        confirmLabel="Delete log"
        tone="danger"
        onCancel={() => {
          setConfirmDelete(false);
        }}
        onConfirm={() => {
          setConfirmDelete(false);
          store.clearIntegrityLog(attempt.id);
        }}
      />
    </Card>
  );
}
