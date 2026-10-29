import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { Bookmark, BookmarkX, Play } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { buttonClasses } from '@/components/ui/buttonStyles';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppStore } from '@/state/StoreProvider';
import { usePracticeQuestions, useUserData } from '@/state/hooks';
import { formatDateTime } from '@/lib/format';
import { QuestionMeta } from '@/features/shared/question/QuestionMeta';
import { SESSION_PATH, sessionState } from '@/features/practice/sessionSetup';

export function BookmarksPage() {
  const store = useAppStore();
  const navigate = useNavigate();
  const { bookmarks } = useUserData();
  const { byId } = usePracticeQuestions();

  // Newest first; questions no longer in the bank are left out.
  const items = useMemo(
    () =>
      Object.entries(bookmarks)
        .sort(([, a], [, b]) => b.addedAt - a.addedAt)
        .flatMap(([id, entry]) => {
          const question = byId.get(id);
          return question ? [{ question, addedAt: entry.addedAt }] : [];
        }),
    [bookmarks, byId],
  );

  return (
    <>
      <PageHeader
        title="Bookmarks"
        description="Questions you saved to revisit and practise."
        actions={
          items.length > 0 && (
            <Button
              icon={Play}
              onClick={() => {
                void navigate(SESSION_PATH, {
                  state: sessionState({
                    label: 'Bookmarks',
                    questionIds: items.map((item) => item.question.id),
                    limit: null,
                  }),
                });
              }}
            >
              Practise bookmarks ({items.length})
            </Button>
          )
        }
      />
      <Card>
        {items.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No bookmarks yet"
            description="Select Bookmark on any question during practice, and it will appear here."
            action={
              <Link to="/practice" className={buttonClasses({ variant: 'secondary' })}>
                Go to Learning mode
              </Link>
            }
            className="py-16"
          />
        ) : (
          <ul className="divide-y divide-border">
            {items.map(({ question, addedAt }) => (
              <li key={question.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <QuestionMeta question={question} />
                  <p className="mt-2 text-sm text-fg">{question.stem}</p>
                  <p className="mt-1 text-xs text-fg-subtle">Saved {formatDateTime(addedAt)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={BookmarkX}
                  aria-label={`Remove bookmark: ${question.stem}`}
                  onClick={() => {
                    store.toggleBookmark(question.id, Date.now());
                  }}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
