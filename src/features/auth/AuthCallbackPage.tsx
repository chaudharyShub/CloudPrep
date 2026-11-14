import { BrandLoading } from '@/components/brand/BrandLoading';
import { Link, Navigate, useLocation, useSearchParams } from 'react-router';
import { PageHeader } from '@/components/layout/PageHeader';
import { buttonClasses } from '@/components/ui/buttonStyles';
import { Notice } from '@/components/ui/Notice';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAuth } from '@/state/AuthProvider';
import { callbackError, safeNextPath, signInPath } from './redirect';

/** Where sign-in links and Google return to. The auth client finishes the sign-in. */
export function AuthCallbackPage() {
  const { state } = useAuth();
  const [params] = useSearchParams();
  const location = useLocation();
  const next = safeNextPath(params.get('next'));
  const error = callbackError(location.search, location.hash);
  useDocumentTitle('Signing in');

  if (state.status === 'signed-in') return <Navigate to={next} replace />;
  if (state.status === 'loading' && !error) {
    return <BrandLoading message="Signing you in…" />;
  }

  return (
    <>
      <PageHeader title="Sign-in didn't work" />
      <div className="flex max-w-prose flex-col gap-6">
        <Notice tone="danger">
          {error ? `${error}. ` : ''}
          Sign-in links work once, expire after an hour, and must be opened in the same browser that
          asked for them.
        </Notice>
        <div>
          <Link to={signInPath(next)} className={buttonClasses({ variant: 'primary' })}>
            Try again
          </Link>
        </div>
      </div>
    </>
  );
}
