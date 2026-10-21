import { Link } from 'react-router';
import { X } from 'lucide-react';
import { IconButton } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import type { StorageNotice } from '@/storage/store';
import { useAppStore } from '@/state/StoreProvider';
import { useStorageNotices } from '@/state/hooks';

const AREA_LABEL = {
  progress: 'practice progress',
  bookmarks: 'bookmarks',
  sessions: 'practice session history',
  activeExam: 'in-progress exam',
  attempts: 'exam history',
  questionArchive: 'saved exam questions',
  preferenceOverrides: 'settings',
} as const;

function describe(notice: StorageNotice): {
  title: string;
  body: string;
  tone: 'warning' | 'danger';
} {
  switch (notice.kind) {
    case 'unavailable':
      return {
        tone: 'warning',
        title: "Progress won't be saved",
        body: 'This browser is blocking local storage (for example in a private window). You can still practise, but your progress is lost when you close the tab.',
      };
    case 'recovered':
      if (notice.area === 'activeExam') {
        return {
          tone: 'warning',
          title: "Your in-progress exam couldn't be restored",
          body: 'The saved exam data was damaged, so it could not be resumed safely. A copy was kept in this browser. You can start a new exam.',
        };
      }
      return {
        tone: 'warning',
        title: `Some saved ${AREA_LABEL[notice.area]} couldn't be read`,
        body: notice.backupKey
          ? 'Unreadable entries were skipped. A copy of the original data was kept in this browser.'
          : 'Unreadable entries were skipped.',
      };
    case 'newer-version':
      return {
        tone: 'warning',
        title: `Your ${AREA_LABEL[notice.area]} came from a newer version of CloudPrep`,
        body: "To protect it, changes won't be saved until you reload to get the latest version.",
      };
    case 'write-failed':
      return {
        tone: 'danger',
        title: `Couldn't save your ${AREA_LABEL[notice.area]}`,
        body:
          notice.reason === 'quota'
            ? 'Browser storage is full. Your latest changes are kept until you close the tab.'
            : 'The browser refused to save. Your latest changes are kept until you close the tab.',
      };
  }
}

/** Non-blocking banners for storage problems. */
export function StorageNotices() {
  const store = useAppStore();
  const notices = useStorageNotices();
  if (notices.length === 0) return null;
  return (
    <div className="mb-6 flex flex-col gap-3">
      {notices.map((notice) => {
        const { title, body, tone } = describe(notice);
        return (
          <Notice
            key={notice.id}
            tone={tone}
            title={title}
            action={
              <IconButton
                label="Dismiss"
                icon={X}
                size="sm"
                onClick={() => {
                  store.dismissNotice(notice.id);
                }}
              />
            }
          >
            {body}
            {(notice.kind === 'recovered' || notice.kind === 'newer-version') && (
              <>
                {' '}
                <Link
                  to="/settings#recovery"
                  className="font-medium text-accent-fg underline-offset-4 hover:underline"
                >
                  Go to Recovery
                </Link>
              </>
            )}
          </Notice>
        );
      })}
    </div>
  );
}
