/** One signed-in account as the admin overview shows it (D-054). Times are epoch ms. */
export interface AdminUser {
  readonly id: string;
  readonly email: string | null;
  readonly name: string | null;
  /** How they sign in, e.g. `google` or `email`. */
  readonly provider: string | null;
  readonly signedUpAt: number;
  readonly lastSignInAt: number | null;
  readonly questionsAnswered: number;
  readonly lastAnsweredAt: number | null;
  readonly practiceSessions: number;
  readonly examAttempts: number;
  /** Best exam score (0–100), leaving out proctor-ended attempts; null without one. */
  readonly bestExamPercent: number | null;
  readonly lastExamAt: number | null;
}

export interface AdminSummary {
  readonly users: number;
  /** Users with any activity (sign-in, answer or exam) in the last 7 days. */
  readonly activeLastWeek: number;
  readonly questionsAnswered: number;
  readonly examAttempts: number;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** The latest sign-in, answer or exam, whichever is newest. */
export function lastActivity(user: AdminUser): number {
  return Math.max(
    user.signedUpAt,
    user.lastSignInAt ?? 0,
    user.lastAnsweredAt ?? 0,
    user.lastExamAt ?? 0,
  );
}

export function summarizeUsers(users: readonly AdminUser[], now: number): AdminSummary {
  let activeLastWeek = 0;
  let questionsAnswered = 0;
  let examAttempts = 0;
  for (const user of users) {
    if (now - lastActivity(user) <= WEEK_MS) activeLastWeek += 1;
    questionsAnswered += user.questionsAnswered;
    examAttempts += user.examAttempts;
  }
  return { users: users.length, activeLastWeek, questionsAnswered, examAttempts };
}

/** Most recently active first. */
export function sortByActivity(users: readonly AdminUser[]): AdminUser[] {
  return [...users].sort((a, b) => lastActivity(b) - lastActivity(a));
}
