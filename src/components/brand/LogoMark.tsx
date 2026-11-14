import { LOGO_CLOUD_PATH, LOGO_NODES, LOGO_SMALL_DOTS, LOGO_TRACES_PATH } from './logoPaths';

/** CloudPrep's logo mark. It takes the text colour, so callers colour it with a token class. */
export function LogoMark({ size = 24, className }: { size?: number; className?: string }) {
  const small = size <= 20;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={LOGO_CLOUD_PATH} strokeWidth={small ? 4.6 : 3.4} />
      {!small && <path d={LOGO_TRACES_PATH} strokeWidth={2.4} />}
      <g fill="currentColor" stroke="none">
        {(small ? LOGO_SMALL_DOTS : LOGO_NODES).map(([cx, cy]) => (
          <circle key={`${String(cx)}-${String(cy)}`} cx={cx} cy={cy} r={small ? 3.4 : 3} />
        ))}
      </g>
    </svg>
  );
}

/** The mark on its aubergine tile, as in the sidebar and the app icon. */
export function LogoTile({ size = 32 }: { size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-sm bg-accent text-on-accent"
      style={{ width: size, height: size }}
    >
      <LogoMark size={Math.round(size * 0.86)} />
    </span>
  );
}
