import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { TriangleAlert } from 'lucide-react';
import { LogoTile } from '@/components/brand/LogoMark';
import { Button } from '@/components/ui/Button';
import { buttonClasses } from '@/components/ui/buttonStyles';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/** Shown when a route throws while loading or rendering. */
export function RouteErrorPage() {
  const error = useRouteError();
  useDocumentTitle('Something went wrong');

  const detail = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : null;

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-8 flex items-center gap-2.5">
          <LogoTile size={32} />
          <span className="text-sm font-semibold text-fg">CloudPrep</span>
        </div>
        <span className="mb-4 flex size-12 items-center justify-center rounded-lg border border-border bg-surface-2 text-danger">
          <TriangleAlert size={22} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <h1 className="text-xl font-semibold text-fg">Something went wrong</h1>
        <p className="mt-2 text-sm text-fg-muted">
          CloudPrep hit an unexpected error. Reloading usually fixes it.
        </p>
        {detail && (
          <p className="mt-4 rounded-md border border-border bg-surface px-3 py-2 font-mono text-xs break-all text-fg-muted">
            {detail}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => {
              window.location.reload();
            }}
          >
            Reload
          </Button>
          <Link to="/dashboard" reloadDocument className={buttonClasses({ variant: 'secondary' })}>
            Go to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
