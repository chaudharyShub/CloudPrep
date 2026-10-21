import { DOMAINS, type DomainId } from '@/domain/exam-guide/clf-c02';

export type DomainCounts = Record<DomainId, number>;

/**
 * Splits `total` questions across domains in proportion to the official weightings,
 * using the largest-remainder method:
 *
 * 1. Give each domain floor(total × weight).
 * 2. Hand out the remaining questions one at a time to the domains with the largest
 *    fractional remainders. Ties go to the domain with the larger weight, then to the
 *    lower domain number, so the result is always deterministic.
 *
 * The result always sums to `total`. For 65 questions: 15.6 / 19.5 / 22.1 / 7.8 → 16 / 19 / 22 / 8.
 * The official weights apply to the 50 scored questions; applying them to all 65 is an
 * approximation (docs/DECISIONS.md D-007).
 */
export function allocateByWeight(total: number): DomainCounts {
  if (!Number.isInteger(total) || total < 0)
    throw new RangeError('total must be a non-negative integer');
  const exact = DOMAINS.map((domain) => ({
    domain,
    share: (total * domain.weightPercent) / 100,
  }));
  const counts = Object.fromEntries(
    exact.map(({ domain, share }) => [domain.id, Math.floor(share)]),
  ) as DomainCounts;
  let remaining = total - Object.values(counts).reduce((sum, n) => sum + n, 0);
  const byRemainder = [...exact].sort(
    (a, b) =>
      b.share - Math.floor(b.share) - (a.share - Math.floor(a.share)) ||
      b.domain.weightPercent - a.domain.weightPercent ||
      a.domain.number - b.domain.number,
  );
  for (const { domain } of byRemainder) {
    if (remaining === 0) break;
    counts[domain.id]++;
    remaining--;
  }
  return counts;
}

/** True when every domain has at least as many questions available as it needs. */
export function fitsAvailability(required: DomainCounts, available: DomainCounts): boolean {
  return DOMAINS.every((domain) => available[domain.id] >= required[domain.id]);
}

/** The largest balanced exam (≤ `upTo` questions) the available questions can supply. */
export function maxBalancedQuestionCount(available: DomainCounts, upTo: number): number {
  for (let n = upTo; n > 0; n--) {
    if (fitsAvailability(allocateByWeight(n), available)) return n;
  }
  return 0;
}
