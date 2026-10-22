import { createContext, use, useEffect, useState, type ReactNode } from 'react';
import type { AuthClient, AuthUser } from '@/backend/auth';

export type AuthState =
  | { readonly status: 'loading'; readonly user: null }
  | { readonly status: 'signed-out'; readonly user: null }
  | { readonly status: 'signed-in'; readonly user: AuthUser };

export interface AuthContextValue {
  readonly state: AuthState;
  readonly client: AuthClient;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toState(user: AuthUser | null): AuthState {
  return user ? { status: 'signed-in', user } : { status: 'signed-out', user: null };
}

/** Tracks who is signed in. Starts as `loading` until the saved session has been read. */
export function AuthProvider({ client, children }: { client: AuthClient; children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null });

  useEffect(() => {
    let active = true;
    const unsubscribe = client.onChange((user) => {
      if (active) setState(toState(user));
    });
    client.getUser().then(
      (user) => {
        if (active) setState(toState(user));
      },
      () => {
        if (active) setState(toState(null));
      },
    );
    return () => {
      active = false;
      unsubscribe();
    };
  }, [client]);

  return <AuthContext value={{ state, client }}>{children}</AuthContext>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook belongs with its provider
export function useAuth(): AuthContextValue {
  const value = use(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>.');
  return value;
}
