/** Formats a 0–1 ratio as a whole percentage, or an em dash when there is no value yet. */
export function formatPercent(ratio: number | null): string {
  if (ratio === null || !Number.isFinite(ratio)) return '—';
  return `${Math.round(ratio * 100)}%`;
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

export function formatDateTime(timestamp: number): string {
  return dateFormatter.format(new Date(timestamp));
}

/** A duration in whole minutes, rounded up so a started minute counts: "71 min". */
export function formatMinutes(ms: number): string {
  return `${Math.max(0, Math.ceil(ms / 60_000))} min`;
}
