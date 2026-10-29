import type { LucideIcon } from 'lucide-react';
import { PAGE_ICONS } from '@/components/layout/pageIcons';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const PRIMARY_NAV: readonly NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: PAGE_ICONS.dashboard },
  { to: '/practice', label: 'Learning mode', icon: PAGE_ICONS.practice },
  { to: '/exam', label: 'Mock exam', icon: PAGE_ICONS.exam },
  { to: '/history', label: 'Exam history', icon: PAGE_ICONS.history },
  { to: '/progress', label: 'Progress', icon: PAGE_ICONS.progress },
  { to: '/bookmarks', label: 'Bookmarks', icon: PAGE_ICONS.bookmarks },
];

export const SECONDARY_NAV: readonly NavItem[] = [
  { to: '/settings', label: 'Settings', icon: PAGE_ICONS.settings },
];

/** Shown only to admins (D-055), below the secondary links. */
export const ADMIN_NAV: NavItem = { to: '/admin', label: 'Admin', icon: PAGE_ICONS.admin };
