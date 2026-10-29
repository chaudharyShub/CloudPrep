import { NavLink } from 'react-router';
import { ADMIN_NAV, PRIMARY_NAV, SECONDARY_NAV, type NavItem } from '@/app/navigation';
import { cn } from '@/lib/cn';
import { useIsAdmin } from '@/state/AdminProvider';

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

/** Main navigation links. NavLink sets aria-current="page" on the active item. */
export function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const isAdmin = useIsAdmin();
  return (
    <nav aria-label="Main" className="flex flex-col gap-3">
      <ul className="flex flex-col gap-0.5">
        {PRIMARY_NAV.map((item) => (
          <NavItemLink key={item.to} item={item} onNavigate={onNavigate} />
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
