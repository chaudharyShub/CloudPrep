/** What to practise. Passed to /practice/session as router state. */
export interface SessionSetup {
  /** Shown as the session title, e.g. "Security and Compliance". */
  label: string;
  /** Candidate question ids (already filtered). */
  questionIds: string[];
  /** Maximum questions to ask; `null` = all candidates. */
  limit: number | null;
}

export const SESSION_PATH = '/practice/session';

/** Router state is untrusted (it survives reloads in history); validate before use. */
export function parseSessionSetup(state: unknown): SessionSetup | null {
  if (typeof state !== 'object' || state === null) return null;
  const setup = (state as { setup?: unknown }).setup;
  if (typeof setup !== 'object' || setup === null) return null;
  const { label, questionIds, limit } = setup as Record<string, unknown>;
  if (typeof label !== 'string') return null;
  if (!Array.isArray(questionIds) || !questionIds.every((id) => typeof id === 'string')) {
    return null;
  }
  if (limit !== null && !(typeof limit === 'number' && Number.isInteger(limit) && limit > 0)) {
    return null;
  }
  return { label, questionIds, limit };
}

export function sessionState(setup: SessionSetup): { setup: SessionSetup } {
  return { setup };
}
