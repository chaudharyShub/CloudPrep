import { Outlet } from 'react-router';
import { RotateCcw } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useQuestionBankState } from '@/state/QuestionBankProvider';

/** Route guard for pages that use questions: waits for the bank, or explains why it failed. */
export function RequireQuestions() {
  const { state, retry } = useQuestionBankState();
  if (state.status === 'ready') return <Outlet />;
  if (state.status === 'loading') {
    return (
      <>
        <p role="status" className="sr-only">
          Loading questions…
        </p>
        <PageSkeleton />
      </>
    );
  }
  return (
    <>
      <PageHeader title="Questions unavailable" />
      <div className="flex max-w-prose flex-col gap-6">
        <Notice
          tone="danger"
          title="The questions couldn't be loaded"
          action={
            <Button variant="secondary" size="sm" icon={RotateCcw} onClick={retry}>
              Try again
            </Button>
          }
        >
          {state.message} Check your connection and try again. Your progress is safe.
        </Notice>
      </div>
    </>
  );
}
