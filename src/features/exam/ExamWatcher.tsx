import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { isExpired } from '@/domain/exam/timer';
import { useToast } from '@/components/ui/Toast';
import { useNow } from '@/hooks/useNow';
import { useActiveExam } from '@/state/hooks';
import { useExamActions } from './useExamActions';

/**
 * Mounted once at the app root. Submits the active exam when its time runs out, on any page,
 * including when the app loads with an exam that expired while it was closed.
 * Exam pages redirect to the results themselves; elsewhere a notification is shown.
 */
export function ExamWatcher() {
  const exam = useActiveExam();
  const { submit } = useExamActions();
  const { showToast } = useToast();
  const { pathname } = useLocation();
  const now = useNow(1000, exam !== null);
  const isFirstCheck = useRef(true);

  useEffect(() => {
    const firstCheck = isFirstCheck.current;
    isFirstCheck.current = false;
    if (!exam) return;
    const needsSubmit = exam.status === 'submitted' || isExpired(exam.endsAt, Date.now());
    if (!needsSubmit) return;

    const reason =
      exam.status === 'submitted'
        ? (exam.submitReason ?? 'manual')
        : firstCheck
          ? 'expired_while_away'
          : 'time_expired';
    const attempt = submit(reason);
    if (attempt && !pathname.startsWith('/exam')) {
      showToast({
        tone: 'warning',
        title: 'Your exam time ran out',
        description: 'It was submitted automatically. Open Exam history to see your results.',
        durationMs: null,
      });
    }
  }, [exam, now, submit, showToast, pathname]);

  return null;
}
