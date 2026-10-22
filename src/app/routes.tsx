import { Navigate, type RouteObject } from 'react-router';
import { RouteErrorPage } from '@/features/errors/RouteErrorPage';
import { AppLayout } from './layouts/AppLayout';
import { ExamLayout } from './layouts/ExamLayout';
import { RootLayout } from './layouts/RootLayout';
import {
  BookmarksPage,
  CheckInPage,
  DashboardPage,
  DesignSystemPage,
  ExamEntryPage,
  ExamReviewPage,
  ExamSessionPage,
  HistoryPage,
  NotFoundPage,
  PracticePage,
  PracticeSessionPage,
  AnswerReviewPage,
  PrivacyPage,
  ProgressPage,
  ResultsPage,
  SettingsPage,
} from './pages';

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'practice', element: <PracticePage /> },
          { path: 'practice/session', element: <PracticeSessionPage /> },
          { path: 'exam', element: <ExamEntryPage /> },
          { path: 'exam/check-in', element: <CheckInPage /> },
          { path: 'results/:attemptId', element: <ResultsPage /> },
          { path: 'results/:attemptId/review', element: <AnswerReviewPage /> },
          { path: 'progress', element: <ProgressPage /> },
          { path: 'privacy', element: <PrivacyPage /> },
          { path: 'history', element: <HistoryPage /> },
          { path: 'bookmarks', element: <BookmarksPage /> },
          { path: 'settings', element: <SettingsPage /> },
          ...(import.meta.env.DEV ? [{ path: '__ui', element: <DesignSystemPage /> }] : []),
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      {
        // Focused exam chrome without the sidebar.
        element: <ExamLayout />,
        children: [
          { path: 'exam/session', element: <ExamSessionPage /> },
          { path: 'exam/review', element: <ExamReviewPage /> },
        ],
      },
    ],
  },
];
