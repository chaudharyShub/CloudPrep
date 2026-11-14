import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useParams } from 'react-router';
import { NotFoundPage } from './pages';
import { TitleExamContext } from '@/hooks/useDocumentTitle';
import { findAvailableExam } from '@/state/CurrentExam';
import { useAllUserData, useCurrentExam, usePreferences } from '@/state/hooks';
import { useAppStore } from '@/state/StoreProvider';
import { AppLayout } from './layouts/AppLayout';
import { examPath } from './paths';

/**
 * Route element for `/:examId/*` (D-066). The pages inside read the exam from the address
 * (`useCurrentExam`); this checks it exists and remembers it as the exam used last. Unknown or
 * unlaunched exams show the not-found page, inside the app chrome (`withChrome` when this
 * route isn't already inside `AppLayout`).
 */
export function ExamScope({ withChrome = false }: { withChrome?: boolean }) {
  const { examId } = useParams();
  const exam = findAvailableExam(examId);
  const store = useAppStore();
  const preferred = usePreferences().exam;

  useEffect(() => {
    if (exam && preferred !== exam.id) store.setPreferences({ exam: exam.id });
  }, [exam, preferred, store]);

  if (!exam) {
    return withChrome ? (
      <AppLayout>
        <NotFoundPage />
      </AppLayout>
    ) : (
      <NotFoundPage />
    );
  }
  return (
    <TitleExamContext value={exam.code}>
      <Outlet />
    </TitleExamContext>
  );
}

/**
 * Old addresses from before D-066 (`/practice`, `/exam`, …) open the same page of the exam
 * used last: CLF-C02 for new visitors and search engines, since it was the only exam.
 */
export function LegacyRedirect({ page }: { page: string }) {
  const location = useLocation();
  const { id } = useCurrentExam();
  // Router state (e.g. a practice session to start) is passed on unread.
  const routerState: unknown = location.state;
  return (
    <Navigate
      to={`${examPath(id, page)}${location.search}${location.hash}`}
      state={routerState}
      replace
    />
  );
}

/** Old result addresses open the result under the exam it belongs to. */
export function LegacyResultRedirect({ review = false }: { review?: boolean }) {
  const { attemptId = '' } = useParams();
  const { search } = useLocation();
  const { attempts } = useAllUserData();
  const current = useCurrentExam();
  const examId = attempts.find((attempt) => attempt.id === attemptId)?.examId ?? current.id;
  const page = `results/${attemptId}${review ? '/review' : ''}`;
  return <Navigate to={`${examPath(examId, page)}${search}`} replace />;
}
