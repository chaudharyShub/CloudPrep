import { Link } from 'react-router';
import { LogIn } from 'lucide-react';
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
  const label = name ?? email ?? 'Signed in';
  return (
    <div className="flex items-center gap-3 border-t border-border px-2 pt-3">
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-on-accent"
      >
        {initials(label)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.9375rem] font-semibold text-fg">{label}</p>
        {name && email && <p className="truncate text-xs text-fg-subtle">{email}</p>}
        <button
          type="button"
          onClick={signOut.request}
          className="rounded-sm text-sm text-accent-fg underline underline-offset-2 hover:text-accent-hover"
        >
          Sign out
        </button>
      </div>
      {signOut.dialog}
    </div>
  );
}

/** One or two letters for the avatar: initials of a name, or the first letter of an email. */
function initials(label: string): string {
  const words = label.split(/[\s@.]+/).filter(Boolean);
  const letters = label.includes('@')
    ? (words[0] ?? '').slice(0, 1)
    : words
        .slice(0, 2)
        .map((w) => w[0])
        .join('');
  return letters.toUpperCase() || '?';
}
