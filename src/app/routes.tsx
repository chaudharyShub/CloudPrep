import { Suspense } from 'react';
import type { RouteObject } from 'react-router';
import { BrandLoading } from '@/components/brand/BrandLoading';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { RouteErrorPage } from '@/features/errors/RouteErrorPage';
import { RequireQuestions } from '@/features/shared/RequireQuestions';
import { ExamScope, LegacyRedirect, LegacyResultRedirect } from './ExamScope';
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
  HomeRoute,
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
import { EXAM_PAGES } from './paths';

const home = (
  <Suspense fallback={<BrandLoading message="Opening CloudPrep…" />}>
    <HomeRoute />
  </Suspense>
);

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      // Landing page for guests, dashboard for signed-in users (D-057). No app chrome.
      { index: true, element: home },
      {
        // Pages of one exam live under its id (D-066), e.g. /saa-c03/practice. These have no
        // app chrome: the exam's own landing page and the exam screens.
        path: ':examId',
        element: <ExamScope withChrome />,
        children: [
          { index: true, element: home },
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
      {
        // One layout for every page with the sidebar, so moving between an exam's pages and
        // shared ones keeps it (and moves focus to the new page).
        element: <AppLayout />,
        children: [
          {
            path: ':examId',
            element: <ExamScope />,
            children: [
              // Open to guests (D-045): Learning mode and bookmarks.
              {
                // Pages that use questions wait for the bank (D-046).
                element: <RequireQuestions />,
                children: [
                  { path: 'practice', element: <PracticePage /> },
                  { path: 'practice/session', element: <PracticeSessionPage /> },
                  { path: 'bookmarks', element: <BookmarksPage /> },
                ],
              },
              {
                // Signed-in only.
                element: <RequireAuth />,
                children: [
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
              { path: '*', element: <NotFoundPage /> },
            ],
          },
          // Shared by every exam.
          { path: 'privacy', element: <PrivacyPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'sign-in', element: <SignInPage /> },
          { path: 'auth/callback', element: <AuthCallbackPage /> },
          {
            element: <RequireAuth />,
            children: [
              // Admins only (D-054): the database checks access; not in the navigation.
              { path: 'admin', element: <AdminPage /> },
            ],
          },
          // Addresses from before D-066 open the same page of the exam used last.
          ...EXAM_PAGES.map((page) => ({ path: page, element: <LegacyRedirect page={page} /> })),
          { path: 'results/:attemptId', element: <LegacyResultRedirect /> },
          { path: 'results/:attemptId/review', element: <LegacyResultRedirect review /> },
          ...(import.meta.env.DEV ? [{ path: '__ui', element: <DesignSystemPage /> }] : []),
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
];
