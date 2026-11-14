import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { describeGuestData, useGuestImport } from './useGuestImport';

/**
 * Asked once per account, after signing in on a browser that has guest data: add it to the
 * account or not. Guest data stays in the browser either way. Settings offers it again.
 */
export function GuestDataPrompt() {
  const guestImport = useGuestImport();
  const { showToast } = useToast();

  return (
    <ConfirmDialog
      open={guestImport.shouldAsk}
      title="Add this browser's progress to your account?"
      description={
        <>
          This browser has progress from using CloudPrep without signing in:{' '}
          {describeGuestData(guestImport.counts)}. Add it to your account to keep it on every
          device. Only do this if it&apos;s yours.
        </>
      }
      confirmLabel="Add to my account"
      cancelLabel="Not now"
      onConfirm={() => {
        guestImport.add();
        showToast({ title: 'Progress added to your account', tone: 'success' });
      }}
      onCancel={() => {
        guestImport.dismiss();
        showToast({
          title: 'Not added',
          description: 'You can add it later from Settings.',
          tone: 'info',
        });
      }}
    />
  );
}
