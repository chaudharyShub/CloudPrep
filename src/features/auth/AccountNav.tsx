import { Link } from 'react-router';
import { LogIn, LogOut } from 'lucide-react';
import { IconButton } from '@/components/ui/Button';
import { buttonClasses } from '@/components/ui/buttonStyles';
import { useAuth } from '@/state/AuthProvider';
import { useSignOutConfirmation } from './useSignOutConfirmation';

/** Navigation footer: who is signed in, with sign-out, or a sign-in link for guests. */
export function AccountNav({ onNavigate }: { onNavigate?: () => void }) {
  const { state, client } = useAuth();
  const signOut = useSignOutConfirmation();

  if (state.status === 'loading' || !client.available) return null;

  if (state.status === 'signed-out') {
    return (
      <Link
        to="/sign-in"
        onClick={onNavigate}
        className={buttonClasses({ variant: 'secondary', size: 'sm', className: 'w-full' })}
      >
        <LogIn size={16} strokeWidth={1.75} aria-hidden="true" />
        Sign in
      </Link>
    );
  }

  const { name, email } = state.user;
  return (
    <div className="flex items-center gap-2 px-1">
      <div className="min-w-0 flex-1 text-sm">
        <p className="truncate font-medium text-fg">{name ?? email ?? 'Signed in'}</p>
        {name && email && <p className="truncate text-fg-muted">{email}</p>}
      </div>
      <IconButton label="Sign out" icon={LogOut} size="sm" onClick={signOut.request} />
      {signOut.dialog}
    </div>
  );
}
