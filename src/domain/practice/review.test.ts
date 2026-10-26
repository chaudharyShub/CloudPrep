import { describe, expect, it } from 'vitest';
import { recordAnswer, type ProgressMap } from './progress';
import {
  dueDay,
  dueQuestionIds,
  isDue,
  legacyReviewLevel,
  localDay,
  MAX_REVIEW_LEVEL,
  nextReviewLevel,
  REVIEW_INTERVAL_DAYS,
  reviewOverview,
  type ReviewState,
} from './review';

/** Local time, so the tests hold in any time zone. */
const at = (day: number, hour = 12) => new Date(2026, 9, day, hour).getTime();
const state = (reviewLevel: number, answeredAt: number, correct = true): ReviewState => ({
  lastResult: correct ? 'correct' : 'incorrect',
  lastAnsweredAt: answeredAt,
  reviewLevel,
});

describe('review schedule', () => {
  it('AC-R.1 uses 1, 3, 7, 21 and 60 days by level', () => {
    expect(REVIEW_INTERVAL_DAYS).toEqual([1, 3, 7, 21, 60]);
    expect(MAX_REVIEW_LEVEL).toBe(4);
    REVIEW_INTERVAL_DAYS.forEach((days, level) => {
      const answered = state(level, at(1));
      expect(isDue(answered, at(1 + days - 1, 23))).toBe(false);
      expect(isDue(answered, at(1 + days, 0))).toBe(true);
    });
  });

  it('AC-R.1 counts local calendar days: a late-evening answer is due the next morning', () => {
    const lateAnswer = state(0, at(5, 23));
    expect(isDue(lateAnswer, at(6, 7))).toBe(true);
    expect(dueDay(lateAnswer)).toBe(localDay(at(6)));
  });

  it('AC-R.1 a wrong answer resets the level to 0', () => {
    expect(nextReviewLevel(state(3, at(1)), false, at(30))).toBe(0);
    expect(nextReviewLevel(undefined, false, at(1))).toBe(0);
  });

  it('AC-R.1 a first correct answer starts at level 1', () => {
    expect(nextReviewLevel(undefined, true, at(1))).toBe(1);
  });

  it('AC-R.1 a correct answer moves up one level only when the question was due', () => {
    const level2 = state(2, at(1)); // due on day 8
    expect(nextReviewLevel(level2, true, at(7))).toBe(2);
    expect(nextReviewLevel(level2, true, at(8))).toBe(3);
    // A same-day retry after a mistake doesn't skip ahead.
    expect(nextReviewLevel(state(0, at(1, 9), false), true, at(1, 10))).toBe(0);
  });

  it('AC-R.1 never goes above the top level', () => {
    expect(nextReviewLevel(state(MAX_REVIEW_LEVEL, at(1)), true, at(1) + 400 * 86_400_000)).toBe(
      MAX_REVIEW_LEVEL,
    );
  });

  it('AC-R.1 recordAnswer keeps the level with the progress entry', () => {
    let progress: ProgressMap = {};
    const record = (isCorrect: boolean, when: number, sessionId: string) => {
      progress = recordAnswer(progress, { questionId: 'q', isCorrect, at: when, sessionId });
      return progress['q']?.reviewLevel;
    };
    expect(record(false, at(1, 9), 's1')).toBe(0);
    expect(record(true, at(1, 10), 's2')).toBe(0); // retried the same day
    expect(record(true, at(2), 's3')).toBe(1); // due again the next day
    expect(record(true, at(3), 's4')).toBe(1); // early: due on day 5
    expect(record(true, at(6), 's5')).toBe(2);
    expect(record(false, at(20), 's6')).toBe(0);
  });
});

describe('dueQuestionIds', () => {
  it('AC-R.2 lists due questions, lowest level first, then longest overdue', () => {
    const progress: Record<string, ReviewState> = {
      fresh: state(3, at(20)), // due day 41
      wrong: state(0, at(19), false), // due day 20
      older: state(1, at(10)), // due day 13
      newer: state(1, at(16)), // due day 19
      notYet: state(1, at(19)), // due day 22
    };
    const ids = new Set(Object.keys(progress));
    expect(dueQuestionIds(progress, ids, at(20))).toEqual(['wrong', 'older', 'newer']);
  });

  it('AC-R.2 leaves out questions that are no longer available', () => {
    const progress = { gone: state(0, at(1), false), kept: state(0, at(1), false) };
    expect(dueQuestionIds(progress, new Set(['kept']), at(5))).toEqual(['kept']);
  });
});

describe('reviewOverview', () => {
  it('AC-R.2 counts due and later questions and finds the next due day', () => {
    const progress = {
      a: state(0, at(1), false),
      b: state(1, at(10)), // due day 13
      c: state(2, at(10)), // due day 17
      gone: state(0, at(1), false),
    };
    const ids = new Set(['a', 'b', 'c']);
    expect(reviewOverview(progress, ids, at(11))).toEqual({
      due: 1,
      later: 2,
      nextDueDay: localDay(at(13)),
    });
    expect(reviewOverview({}, ids, at(11))).toEqual({ due: 0, later: 0, nextDueDay: null });
  });
});

describe('legacyReviewLevel', () => {
  it('AC-R.3 estimates a level for progress saved before review levels', () => {
    expect(legacyReviewLevel({ lastResult: 'incorrect', lastIncorrectAt: 5, correct: 3 })).toBe(0);
    expect(legacyReviewLevel({ lastResult: 'correct', lastIncorrectAt: null, correct: 2 })).toBe(2);
    expect(legacyReviewLevel({ lastResult: 'correct', lastIncorrectAt: null, correct: 9 })).toBe(
      MAX_REVIEW_LEVEL,
    );
    expect(legacyReviewLevel({ lastResult: 'correct', lastIncorrectAt: 5, correct: 4 })).toBe(1);
  });
});
