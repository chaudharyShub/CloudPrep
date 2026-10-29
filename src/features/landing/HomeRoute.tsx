import { Navigate } from 'react-router';
import { BrandLoading } from '@/components/brand/BrandLoading';
import { useAuth } from '@/state/AuthProvider';
import { LandingPage } from './LandingPage';

/** `/`: guests see the landing page; signed-in users go straight to the dashboard (D-057). */
export function HomeRoute() {
  const { state } = useAuth();
  if (state.status === 'loading') return <BrandLoading message="Opening CloudPrep…" />;
  if (state.status === 'signed-in') return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
}
