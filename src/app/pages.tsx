import { lazy } from 'react';

// Pages load on demand, so the shell renders quickly and each page is its own chunk.
export const HomeRoute = lazy(() =>
  import('@/features/landing/HomeRoute').then((m) => ({ default: m.HomeRoute })),
);
export const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
export const PracticePage = lazy(() =>
  import('@/features/practice/PracticePage').then((m) => ({ default: m.PracticePage })),
);
export const ExamEntryPage = lazy(() =>
  import('@/features/exam/ExamEntryPage').then((m) => ({ default: m.ExamEntryPage })),
);
export const PracticeSessionPage = lazy(() =>
  import('@/features/practice/PracticeSessionPage').then((m) => ({
    default: m.PracticeSessionPage,
  })),
);
export const CheckInPage = lazy(() =>
  import('@/features/exam/proctor/CheckInPage').then((m) => ({ default: m.CheckInPage })),
);
export const ExamSessionPage = lazy(() =>
  import('@/features/exam/ExamSessionPage').then((m) => ({ default: m.ExamSessionPage })),
);
export const ExamReviewPage = lazy(() =>
  import('@/features/exam/ExamReviewPage').then((m) => ({ default: m.ExamReviewPage })),
);
export const ResultsPage = lazy(() =>
  import('@/features/results/ResultsPage').then((m) => ({ default: m.ResultsPage })),
);
export const AnswerReviewPage = lazy(() =>
  import('@/features/results/AnswerReviewPage').then((m) => ({ default: m.AnswerReviewPage })),
);
export const ProgressPage = lazy(() =>
  import('@/features/progress/ProgressPage').then((m) => ({ default: m.ProgressPage })),
);
export const PrivacyPage = lazy(() =>
  import('@/features/privacy/PrivacyPage').then((m) => ({ default: m.PrivacyPage })),
);
export const HistoryPage = lazy(() =>
  import('@/features/history/HistoryPage').then((m) => ({ default: m.HistoryPage })),
);
export const BookmarksPage = lazy(() =>
  import('@/features/bookmarks/BookmarksPage').then((m) => ({ default: m.BookmarksPage })),
);
export const SettingsPage = lazy(() =>
  import('@/features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);
export const SignInPage = lazy(() =>
  import('@/features/auth/SignInPage').then((m) => ({ default: m.SignInPage })),
);
export const AuthCallbackPage = lazy(() =>
  import('@/features/auth/AuthCallbackPage').then((m) => ({ default: m.AuthCallbackPage })),
);
export const AdminPage = lazy(() =>
  import('@/features/admin/AdminPage').then((m) => ({ default: m.AdminPage })),
);
export const NotFoundPage = lazy(() =>
  import('@/features/errors/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);
// Development-only design-system gallery. Only routed when import.meta.env.DEV is true;
// the pure annotation lets the production build drop it entirely.
export const DesignSystemPage = /* @__PURE__ */ lazy(() =>
  import('@/features/dev/DesignSystemPage').then((m) => ({ default: m.DesignSystemPage })),
);
