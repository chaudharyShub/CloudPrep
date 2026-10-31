import { Link } from 'react-router';
import { DEVELOPER, FRONTEND_PREP } from '@/app/developer';
import { LogoTile } from '@/components/brand/LogoMark';
import { ExternalLink } from '@/components/ui/ExternalLink';

export function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link to="/" onClick={onNavigate} className="flex items-center gap-2.5 rounded-sm">
      <LogoTile size={32} />
      <span className="flex flex-col leading-tight">
        <span className="font-serif text-[1.375rem] font-semibold text-fg">CloudPrep</span>
        <span className="text-xs text-fg-subtle">CLF-C02 practice</span>
      </span>
    </Link>
  );
}

export function UnofficialNote() {
  return (
    <p className="text-[0.8125rem] leading-relaxed text-fg-subtle">
      Unofficial practice tool. Not affiliated with or endorsed by Amazon Web Services.{' '}
      <Link
        to="/privacy"
        className="text-accent-fg underline underline-offset-2 hover:text-accent-hover"
      >
        Privacy
      </Link>
    </p>
  );
}

/** Credit for the developer (D-056) and a link to their other practice site (D-059). */
export function MadeBy() {
  return (
    <div className="space-y-1 text-xs text-fg-subtle">
      <p>
        Made by{' '}
        <ExternalLink href={DEVELOPER.url} className="font-normal">
          {DEVELOPER.name}
        </ExternalLink>
      </p>
      <p>
        Also by me:{' '}
        <ExternalLink href={FRONTEND_PREP.url} className="font-normal">
          {FRONTEND_PREP.name}
        </ExternalLink>
      </p>
    </div>
  );
}
