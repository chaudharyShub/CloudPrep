import { useState, type ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { IconButton } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { cn } from '@/lib/cn';
import { Brand, UnofficialNote } from './Brand';
import { NavList } from './NavList';

/** Top bar with a menu button that opens the navigation drawer (<1024px). */
export function MobileNav({
  className,
  renderAccount,
}: {
  className?: string;
  /** Account block for the drawer; receives a callback that closes the drawer. */
  renderAccount?: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-topbar items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur-sm sm:px-6',
        className,
      )}
    >
      <IconButton
        label="Open navigation"
        icon={Menu}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setOpen(true);
        }}
        className="-ml-2"
      />
      <Brand />
      <Dialog open={open} onClose={close} title="Navigation" hideTitle variant="drawer">
        <div className="flex h-full flex-col gap-8">
          <div className="px-2">
            <Brand onNavigate={close} />
          </div>
          <NavList onNavigate={close} />
          {renderAccount?.(close)}
          <div className="px-2">
            <UnofficialNote />
          </div>
        </div>
      </Dialog>
    </header>
  );
}
