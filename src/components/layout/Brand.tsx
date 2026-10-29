import { Link } from 'react-router';
import { DEVELOPER } from '@/app/developer';
import { LogoTile } from '@/components/brand/LogoMark';
import { ExternalLink } from '@/components/ui/ExternalLink';

export function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link to="/dashboard" onClick={onNavigate} className="flex items-center gap-2.5 rounded-md">
      <LogoTile size={32} />
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-semibold text-fg">CloudPrep</span>
        <span className="text-xs text-fg-subtle">CLF-C02 practice</span>
      </span>
    </Link>
  );
}

export function UnofficialNote() {
  return (
    <p className="text-xs leading-relaxed text-fg-subtle">
      Unofficial practice tool. Not affiliated with or endorsed by Amazon Web Services.{' '}
      <Link to="/privacy" className="underline underline-offset-2 hover:text-fg-muted">
        Privacy
      </Link>
    </p>
  );
}

/** Credit for the developer, under the unofficial note (D-056). */
export function MadeBy() {
  return (
    <p className="text-xs text-fg-subtle">
      Made by{' '}
      <ExternalLink href={DEVELOPER.url} className="font-normal text-fg-muted">
        {DEVELOPER.name}
      </ExternalLink>
    </p>
  );
}
