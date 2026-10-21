import { NavLink } from 'react-router';
import { PRIMARY_NAV, SECONDARY_NAV, type NavItem } from '@/app/navigation';
import { cn } from '@/lib/cn';

function NavItemLink({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate?: (() => void) | undefined;
}) {
  const Icon = item.icon;
  return (
    <li>
      <NavLink
        to={item.to}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            'group flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
            isActive ? 'bg-surface-3 text-fg' : 'text-fg-muted hover:bg-surface-2 hover:text-fg',
          )
        }
      >
        {({ isActive }) => (
          <>
            <Icon
              size={20}
              strokeWidth={1.75}
              aria-hidden="true"
              className={cn(
                'shrink-0',
                isActive ? 'text-accent-fg' : 'text-fg-subtle group-hover:text-fg-muted',
              )}
            />
            {item.label}
          </>
        )}
      </NavLink>
    </li>
  );
}

/** Main navigation links. NavLink sets aria-current="page" on the active item. */
export function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Main" className="flex flex-1 flex-col gap-6">
      <ul className="flex flex-col gap-1">
        {PRIMARY_NAV.map((item) => (
          <NavItemLink key={item.to} item={item} onNavigate={onNavigate} />
        ))}
      </ul>
      <ul className="mt-auto flex flex-col gap-1 border-t border-border pt-4">
        {SECONDARY_NAV.map((item) => (
          <NavItemLink key={item.to} item={item} onNavigate={onNavigate} />
        ))}
      </ul>
    </nav>
  );
}
