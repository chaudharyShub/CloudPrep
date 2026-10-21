import {
  Bookmark,
  ClipboardCheck,
  GraduationCap,
  History,
  LayoutDashboard,
  TrendingUp,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const PRIMARY_NAV: readonly NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/practice', label: 'Learning mode', icon: GraduationCap },
  { to: '/exam', label: 'Mock exam', icon: ClipboardCheck },
  { to: '/history', label: 'Exam history', icon: History },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
];

export const SECONDARY_NAV: readonly NavItem[] = [
  { to: '/settings', label: 'Settings', icon: Settings },
];
