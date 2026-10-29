import { Navigate, type RouteObject } from 'react-router';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { RouteErrorPage } from '@/features/errors/RouteErrorPage';
import { RequireQuestions } from '@/features/shared/RequireQuestions';
import { AppLayout } from './layouts/AppLayout';
import { ExamLayout } from './layouts/ExamLayout';
import { RootLayout } from './layouts/RootLayout';
import {
  AdminPage,
  AuthCallbackPage,
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
  SignInPage,
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
          // Open to guests (D-045): Learning mode, bookmarks, settings and sign-in.
          {
            // Pages that use questions wait for the bank (D-046).
            element: <RequireQuestions />,
            children: [
              { path: 'practice', element: <PracticePage /> },
              { path: 'practice/session', element: <PracticeSessionPage /> },
              { path: 'bookmarks', element: <BookmarksPage /> },
            ],
          },
          { path: 'privacy', element: <PrivacyPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'sign-in', element: <SignInPage /> },
          { path: 'auth/callback', element: <AuthCallbackPage /> },
          {
            // Signed-in only.
            element: <RequireAuth />,
            children: [
              // Admins only (D-054): the database checks access; not in the navigation.
              { path: 'admin', element: <AdminPage /> },
              {
                element: <RequireQuestions />,
                children: [
                  { path: 'dashboard', element: <DashboardPage /> },
                  { path: 'exam', element: <ExamEntryPage /> },
                  { path: 'exam/check-in', element: <CheckInPage /> },
                  { path: 'results/:attemptId', element: <ResultsPage /> },
                  { path: 'results/:attemptId/review', element: <AnswerReviewPage /> },
                  { path: 'progress', element: <ProgressPage /> },
                  { path: 'history', element: <HistoryPage /> },
                ],
              },
            ],
          },
          ...(import.meta.env.DEV ? [{ path: '__ui', element: <DesignSystemPage /> }] : []),
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <RequireQuestions />,
            children: [
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
        ],
      },
    ],
  },
];
