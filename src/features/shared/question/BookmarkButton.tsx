import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/state/StoreProvider';
import { useIsBookmarked } from '@/state/hooks';

/** Toggle button; `aria-pressed` tells assistive technology whether the question is saved. */
export function BookmarkButton({ questionId }: { questionId: string }) {
  const store = useAppStore();
  const bookmarked = useIsBookmarked(questionId);
  return (
    <Button
      variant="ghost"
      size="sm"
      icon={bookmarked ? BookmarkCheck : Bookmark}
      aria-pressed={bookmarked}
      onClick={() => {
        store.toggleBookmark(questionId, Date.now());
      }}
      className={bookmarked ? 'text-accent-fg' : undefined}
    >
      {bookmarked ? 'Bookmarked' : 'Bookmark'}
    </Button>
  );
}
