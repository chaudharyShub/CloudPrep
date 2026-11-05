import { Link } from 'react-router';
import { DEVELOPER, FRONTEND_PREP, MAKER_BRAND } from '@/app/developer';
import { LogoTile } from '@/components/brand/LogoMark';
import { MakerMark } from '@/components/brand/MakerMark';
import { ExternalLink } from '@/components/ui/ExternalLink';
import { useCurrentExam } from '@/state/hooks';

export function Brand({ onNavigate }: { onNavigate?: () => void }) {
  const exam = useCurrentExam();
  return (
    <Link to="/" onClick={onNavigate} className="flex items-center gap-2.5 rounded-sm">
      <LogoTile size={32} />
      <span className="flex flex-col leading-tight">
        <span className="font-serif text-[1.375rem] font-semibold text-fg">CloudPrep</span>
        <span className="text-xs text-fg-subtle">{exam.code} practice</span>
      </span>
    </Link>
  );
}

/** The unofficial-tool note. `compact` is the short form for the narrow sidebar and menu. */
export function UnofficialNote({ compact = false }: { compact?: boolean }) {
  return (
    <p
      className={
        compact
          ? 'text-xs leading-relaxed text-fg-subtle'
          : 'text-[0.8125rem] leading-relaxed text-fg-subtle'
      }
    >
      {compact
        ? 'Unofficial practice tool, not affiliated with or endorsed by AWS.'
        : 'Unofficial practice tool. Not affiliated with or endorsed by Amazon Web Services.'}{' '}
      <Link
        to="/privacy"
        className="text-accent-fg underline underline-offset-2 hover:text-accent-hover"
      >
        Privacy
      </Link>
    </p>
  );
}

/**
 * The shared "Shubham Works" footer (D-062), the same on all the developer's sites: maker mark,
 * umbrella line, credit (D-056) and links to the developer's other sites (D-059).
 */
export function MadeBy() {
  return (
    <div className="space-y-1 text-xs leading-relaxed text-fg-subtle">
      <p className="flex items-center gap-1.5 font-semibold text-fg-muted">
        <MakerMark size={20} className="shrink-0 text-maker" />A {MAKER_BRAND} project
      </p>
      <p>
        Made by{' '}
        <ExternalLink href={DEVELOPER.url} className="font-normal">
          {DEVELOPER.name}
        </ExternalLink>
      </p>
      {/* The developer's other sites; the current one is already named in the header. */}
      <p>
        Also:{' '}
        <ExternalLink href={FRONTEND_PREP.url} className="font-normal">
          {FRONTEND_PREP.name}
        </ExternalLink>
      </p>
    </div>
  );
}
