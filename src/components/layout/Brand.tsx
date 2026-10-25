import { Link } from 'react-router';
import { LogoTile } from '@/components/brand/LogoMark';

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
