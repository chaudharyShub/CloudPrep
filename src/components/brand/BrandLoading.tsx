import { LogoMark } from './LogoMark';

/**
 * A short wait with the logo (D-050): the first download of the questions and signing in.
 * The message is a live status, so screen readers announce it too.
 */
export function BrandLoading({ message }: { message: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <span className="flex size-16 items-center justify-center rounded-xl bg-accent text-on-accent motion-safe:animate-pulse">
        <LogoMark size={54} />
      </span>
      <p role="status" className="text-sm text-fg-muted">
        {message}
      </p>
    </div>
  );
}
