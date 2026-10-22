import { Navigate, Outlet, useLocation } from 'react-router';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/state/AuthProvider';
import { signInPath } from './redirect';

/** Route guard: signed-out visitors go to sign-in and come back here afterwards. */
export function RequireAuth() {
  const { state } = useAuth();
  const location = useLocation();
  if (state.status === 'loading') return <PageSkeleton />;
  if (state.status === 'signed-out') {
    return <Navigate to={signInPath(`${location.pathname}${location.search}`)} replace />;
  }
  return <Outlet />;
}
