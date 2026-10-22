import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { proctorStatus } from '@/domain/exam/proctor';
import { isExpired } from '@/domain/exam/timer';
import { useToast } from '@/components/ui/Toast';
import { useNow } from '@/hooks/useNow';
import { useActiveExam } from '@/state/hooks';
import { useAppStore } from '@/state/StoreProvider';
import { useExamActions } from './useExamActions';

/**
 * Mounted once at the app root. Submits the active exam when its time runs out or the AI
 * proctor ends it, on any page, including when the app loads with an exam that expired while
 * it was closed.
 * Exam pages redirect to the results themselves; elsewhere a notification is shown.
 */
export function ExamWatcher() {
  const exam = useActiveExam();
  const store = useAppStore();
  const { submit } = useExamActions();
  const { showToast } = useToast();
  const { pathname } = useLocation();
  const now = useNow(1000, exam !== null);
  const isFirstCheck = useRef(true);

  useEffect(() => {
    const firstCheck = isFirstCheck.current;
    isFirstCheck.current = false;
    if (!exam) return;
    // The AI proctor's verdict comes from the saved log, so it also applies after a reload.
    const endedByProctor =
      exam.status !== 'submitted' &&
      exam.integrity.mode === 'proctored' &&
      proctorStatus(exam.integrity).endedBy !== null;
    const needsSubmit =
      exam.status === 'submitted' || endedByProctor || isExpired(exam.endsAt, Date.now());
    if (!needsSubmit) return;

    if (endedByProctor) {
      store.dispatchExam({
        type: 'logIntegrity',
        event: { type: 'exam-ended-by-proctor', at: Date.now() },
      });
    }
    const reason =
      exam.status === 'submitted'
        ? (exam.submitReason ?? 'manual')
        : endedByProctor
          ? 'proctor_ended'
          : firstCheck
            ? 'expired_while_away'
            : 'time_expired';
    const attempt = submit(reason);
    if (attempt && !pathname.startsWith('/exam')) {
      showToast({
        tone: 'warning',
        title:
          reason === 'proctor_ended' ? 'The proctor ended your exam' : 'Your exam time ran out',
        description: 'It was submitted automatically. Open Exam history to see your results.',
        durationMs: null,
      });
    }
  }, [exam, now, submit, showToast, pathname, store]);

  return null;
}
