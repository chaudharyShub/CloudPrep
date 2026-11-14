import { NavLink } from 'react-router';
import { ADMIN_NAV, PRIMARY_NAV, SECONDARY_NAV, type NavItem } from '@/app/navigation';
import { useExamPath } from '@/app/paths';
import { cn } from '@/lib/cn';
import { useIsAdmin } from '@/state/AdminProvider';
import { ExamSwitcher } from './ExamSwitcher';

function NavItemLink({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate?: (() => void) | undefined;
}) {
  return (
    <li>
      <NavLink
        to={item.to}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            'flex min-h-10 items-center rounded-full px-4 text-[0.9375rem] transition-colors',
            isActive
              ? 'bg-highlight font-semibold text-on-highlight'
              : 'text-fg-muted hover:bg-surface-2 hover:text-fg',
          )
        }
      >
        {item.label}
      </NavLink>
    </li>
  );
}

/**
 * Main navigation: the exam picker, then the current exam's pages (D-066), then shared ones.
 * NavLink sets aria-current="page" on the active item.
 */
export function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const isAdmin = useIsAdmin();
  const path = useExamPath();
  return (
    <nav aria-label="Main" className="flex flex-col gap-3">
      <ExamSwitcher onNavigate={onNavigate} />
      <ul className="flex flex-col gap-0.5">
        {PRIMARY_NAV.map((item) => (
          <NavItemLink
            key={item.page}
            item={{ to: path(item.page), label: item.label }}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
      <ul className="flex flex-col gap-0.5 border-t border-border pt-3">
        {SECONDARY_NAV.map((item) => (
          <NavItemLink key={item.to} item={item} onNavigate={onNavigate} />
        ))}
        {isAdmin && <NavItemLink item={ADMIN_NAV} onNavigate={onNavigate} />}
      </ul>
    </nav>
  );
}
