/**
 * The Shubham Works maker mark (D-062), the "Dial": a wide, squared SW inside a ring, shared by
 * all the developer's sites. It takes the text colour (CloudPrep colours it with `text-maker`).
 * `detailed` adds the inner ring and tick marks, for 32px and up; small sizes drop them.
 * The same drawing is in docs/SHUBHAM_WORKS.md and docs/brand/; keep them in sync.
 */

// Squared letters on a 48×48 grid, drawn as strokes: S, then W (a squared U with a centre stem).
const LETTERS =
  'M22.5 19.5H13a2 2 0 0 0-2 2V22a2 2 0 0 0 2 2h7.5a2 2 0 0 1 2 2v.5a2 2 0 0 1-2 2H11' +
  'M25.5 19.5v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-7M31.5 22v6.5';
const TICK_COUNT = 60;

function ticks(): string {
  let d = '';
  for (let i = 0; i < TICK_COUNT; i++) {
    const angle = (i / TICK_COUNT) * Math.PI * 2;
    const inner = i % 5 === 0 ? 20.6 : 21.4;
    const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
    d += `M${(24 + cos * inner).toFixed(2)} ${(24 + sin * inner).toFixed(2)}L${(24 + cos * 23).toFixed(2)} ${(24 + sin * 23).toFixed(2)}`;
  }
  return d;
}
const TICKS = ticks();

export function MakerMark({
  size = 20,
  detailed = false,
  className,
}: {
  size?: number;
  detailed?: boolean;
  className?: string;
}) {
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
      {detailed ? (
        <>
          <circle cx="24" cy="24" r="19" strokeWidth={1.8} />
          <circle cx="24" cy="24" r="16.5" strokeWidth={0.8} opacity={0.7} />
          <path d={TICKS} strokeWidth={0.7} />
          <path d={LETTERS} strokeWidth={3} />
        </>
      ) : (
        <>
          <circle cx="24" cy="24" r="21.5" strokeWidth={3} />
          {/* Larger letters, so they stay readable at 16–20px. */}
          <path
            d={LETTERS}
            strokeWidth={2.5}
            transform="translate(24 24) scale(1.18) translate(-24.25 -24)"
          />
        </>
      )}
    </svg>
  );
}
