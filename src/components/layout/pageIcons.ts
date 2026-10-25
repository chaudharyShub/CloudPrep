import {
  Bookmark,
  ClipboardCheck,
  GraduationCap,
  History,
  LayoutDashboard,
  Lock,
  Settings,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

/** One icon per main page, shared by the navigation and the page titles (D-050). */
export const PAGE_ICONS = {
  dashboard: LayoutDashboard,
  practice: GraduationCap,
  exam: ClipboardCheck,
  history: History,
  progress: TrendingUp,
  bookmarks: Bookmark,
  settings: Settings,
  privacy: Lock,
} as const satisfies Record<string, LucideIcon>;
