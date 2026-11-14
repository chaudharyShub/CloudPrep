export interface NavItem {
  to: string;
  label: string;
}

/** Pages of the current exam; NavList puts them under its address (D-066). */
export interface ExamNavItem {
  page: string;
  label: string;
}

export const PRIMARY_NAV: readonly ExamNavItem[] = [
  { page: 'dashboard', label: 'Dashboard' },
  { page: 'practice', label: 'Learning mode' },
  { page: 'exam', label: 'Mock exam' },
  { page: 'history', label: 'Exam history' },
  { page: 'progress', label: 'Progress' },
  { page: 'bookmarks', label: 'Bookmarks' },
];

export const SECONDARY_NAV: readonly NavItem[] = [{ to: '/settings', label: 'Settings' }];

/** Shown only to admins (D-055), below the secondary links. */
export const ADMIN_NAV: NavItem = { to: '/admin', label: 'Admin' };
