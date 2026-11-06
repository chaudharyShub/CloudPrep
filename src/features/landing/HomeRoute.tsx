import { Navigate } from 'react-router';
import { examPath } from '@/app/paths';
import { BrandLoading } from '@/components/brand/BrandLoading';
import { useAuth } from '@/state/AuthProvider';
import { useCurrentExam } from '@/state/hooks';
import { LandingPage } from './LandingPage';

/**
 * `/` and each exam's own page (`/saa-c03`, D-066): guests see the landing page; signed-in
 * users go straight to the dashboard of that exam, or of the exam they used last (D-057).
 */
export function HomeRoute() {
  const { state } = useAuth();
  const exam = useCurrentExam();
  if (state.status === 'loading') return <BrandLoading message="Opening CloudPrep…" />;
  if (state.status === 'signed-in') return <Navigate to={examPath(exam.id, 'dashboard')} replace />;
  return <LandingPage />;
}
