import { describe, expect, it } from 'vitest';
import { lastActivity, sortByActivity, summarizeUsers, type AdminUser } from './users';

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 9, 29);

function user(id: string, patch: Partial<AdminUser> = {}): AdminUser {
  return {
    id,
    email: `${id}@example.com`,
    name: null,
    provider: 'google',
    signedUpAt: NOW - 30 * DAY,
    lastSignInAt: null,
    questionsAnswered: 0,
    lastAnsweredAt: null,
    practiceSessions: 0,
    examAttempts: 0,
    bestExamPercent: null,
    lastExamAt: null,
    ...patch,
  };
}

describe('admin overview', () => {
  it('AC-A.3 last activity is the newest of sign-up, sign-in, answer and exam', () => {
    expect(lastActivity(user('a'))).toBe(NOW - 30 * DAY);
    expect(
      lastActivity(
        user('a', {
          lastSignInAt: NOW - 5 * DAY,
          lastAnsweredAt: NOW - 2 * DAY,
          lastExamAt: NOW - 3 * DAY,
        }),
      ),
    ).toBe(NOW - 2 * DAY);
  });

  it('AC-A.3 summary counts users, weekly actives and totals', () => {
    const users = [
      user('a', { lastSignInAt: NOW - DAY, questionsAnswered: 40, examAttempts: 2 }),
      user('b', { lastExamAt: NOW - 7 * DAY, questionsAnswered: 10, examAttempts: 1 }),
      user('c', { lastAnsweredAt: NOW - 8 * DAY, questionsAnswered: 5 }),
    ];
    expect(summarizeUsers(users, NOW)).toEqual({
      users: 3,
      activeLastWeek: 2,
      questionsAnswered: 55,
      examAttempts: 3,
    });
    expect(summarizeUsers([], NOW)).toEqual({
      users: 0,
      activeLastWeek: 0,
      questionsAnswered: 0,
      examAttempts: 0,
    });
  });

  it('AC-A.3 users are sorted most recently active first', () => {
    const users = [
      user('old'),
      user('new', { lastSignInAt: NOW - DAY }),
      user('mid', { lastAnsweredAt: NOW - 10 * DAY }),
    ];
    expect(sortByActivity(users).map((u) => u.id)).toEqual(['new', 'mid', 'old']);
    expect(users[0]?.id).toBe('old');
  });
});
