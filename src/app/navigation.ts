export interface NavItem {
  to: string;
  label: string;
}

export const PRIMARY_NAV: readonly NavItem[] = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/practice', label: 'Learning mode' },
  { to: '/exam', label: 'Mock exam' },
  { to: '/history', label: 'Exam history' },
  { to: '/progress', label: 'Progress' },
  { to: '/bookmarks', label: 'Bookmarks' },
];

export const SECONDARY_NAV: readonly NavItem[] = [{ to: '/settings', label: 'Settings' }];

/** Shown only to admins (D-055), below the secondary links. */
export const ADMIN_NAV: NavItem = { to: '/admin', label: 'Admin' };
