import { describe, expect, it } from 'vitest';
import type { DomainId, TaskStatementId } from '@/domain/exam-guide/clf-c02';
import type { AttemptQuestion, ExamAttempt } from '@/domain/exam/attempt';
import { summarizeAttemptQuestions } from '@/domain/exam/attempt';
import { meetsBenchmark, type QuestionOutcome } from '@/domain/exam/scoring';
import { recordAnswer, type ProgressMap } from '@/domain/practice/progress';
import { indexQuestions } from '@/domain/questions/query';
import { makeQuestion } from '@/test/fixtures/questions';
import { nextSteps, weakAreas } from './attemptInsights';
import {
  assessReadiness,
  domainEvidence,
  frequentlyMissedTopics,
  recentScores,
  repeatedMistakes,
  scoreTrend,
} from './readiness';

const TASK: Record<DomainId, TaskStatementId> = { D1: '1.1', D2: '2.1', D3: '3.1', D4: '4.1' };

/** An attempt with `correct[d]` of `total[d]` correct per domain (rest incorrect). */
function attempt(
  id: string,
  perDomain: Partial<Record<DomainId, [correct: number, total: number]>>,
  { submittedAt = 1000, benchmark = 70, unanswered = 0 } = {},
): ExamAttempt {
  const questions: AttemptQuestion[] = [];
  let n = 0;
  for (const [domain, [correct, total]] of Object.entries(perDomain) as [
    DomainId,
    [number, number],
  ][]) {
    for (let i = 0; i < total; i++) {
      const outcome: QuestionOutcome =
        i < correct
          ? 'correct'
          : i < total - (domain === 'D1' ? unanswered : 0)
            ? 'incorrect'
            : 'unanswered';
      questions.push({
        questionId: `${id}-q${n++}`,
        revision: 1,
        domain,
        taskStatement: TASK[domain],
        selectedOptionIds: outcome === 'unanswered' ? [] : ['a'],
        optionOrder: ['a', 'b', 'c', 'd'],
        flagged: false,
        outcome,
      });
    }
  }
  const summary = summarizeAttemptQuestions(questions);
  return {
    id,
    kind: 'full',
    bankVersion: 'v',
    startedAt: 0,
    endsAt: 5_400_000,
    durationMs: 5_400_000,
    submittedAt,
    submitReason: 'manual',
    timeUsedMs: 1000,
    benchmarkPercent: benchmark,
    benchmarkMet: meetsBenchmark(summary, benchmark),
    summary,
    questions,
    unavailableQuestionIds: [],
    integrity: { mode: 'standard', events: [] },
  };
}

const balanced = (id: string, pct: number, at: number) =>
  attempt(
    id,
    {
      D1: [Math.round((16 * pct) / 100), 16],
      D2: [Math.round((19 * pct) / 100), 19],
      D3: [Math.round((22 * pct) / 100), 22],
      D4: [Math.round((8 * pct) / 100), 8],
    },
    { submittedAt: at },
  );

describe('weakAreas and nextSteps', () => {
  it('lists domains below the benchmark, most costly (by exam weight) first', () => {
    const a = attempt('a', { D1: [5, 10], D3: [5, 10], D4: [9, 10] });
    const weak = weakAreas(a, 70);
    // D3 (34%) outranks D1 (24%) at the same score; D4 is above the benchmark.
    expect(weak.domains.map((d) => d.domain)).toEqual(['D3', 'D1']);
  });

  it('lists topics with at least two misses', () => {
    const a = attempt('a', { D1: [1, 4], D2: [3, 4] });
    expect(weakAreas(a, 70).topics).toEqual([{ taskStatement: '1.1', missed: 3, total: 4 }]);
  });

  it('suggests pacing, weak domains, missed questions and a retake', () => {
    const a = attempt('a', { D1: [2, 6], D2: [5, 6] }, { unanswered: 2 });
    const kinds = nextSteps(a).map((s) => s.kind);
    expect(kinds).toEqual(['pacing', 'practise-domain', 'practise-missed', 'retake']);
  });

  it('suggests confirming consistency after meeting the benchmark', () => {
    const a = attempt('a', { D1: [10, 10] });
    expect(nextSteps(a).map((s) => s.kind)).toEqual(['confirm-consistency']);
  });
});

describe('recent scores and trend', () => {
  it('shows nothing and no trend with no history', () => {
    expect(recentScores([])).toEqual([]);
    expect(scoreTrend([])).toEqual({ change: null, direction: null, average: null, count: 0 });
  });

  it('gives no trend from a single attempt', () => {
    expect(scoreTrend([balanced('a', 60, 1)])).toMatchObject({
      change: null,
      direction: null,
      count: 1,
    });
  });

  it('orders recent scores oldest first and measures change across the window', () => {
    // History is stored newest first.
    const history = [balanced('c', 80, 3), balanced('b', 70, 2), balanced('a', 60, 1)];
    expect(recentScores(history).map((s) => s.id)).toEqual(['a', 'b', 'c']);
    const trend = scoreTrend(history);
    expect(trend.direction).toBe('up');
    expect(trend.change).toBeCloseTo(20, 0);
    expect(trend.count).toBe(3);
  });

  it('calls small changes steady', () => {
    const history = [balanced('b', 71, 2), balanced('a', 70, 1)];
    expect(scoreTrend(history).direction).toBe('steady');
  });
});

describe('domainEvidence', () => {
  it('refuses to judge a domain with too few questions, even at 100%', () => {
    const evidence = domainEvidence([attempt('a', { D4: [2, 2] })], 70);
    expect(evidence.find((d) => d.domain === 'D4')).toMatchObject({
      ratio: 1,
      enoughData: false,
      status: 'insufficient',
    });
  });

  it('pools recent exams and labels strengths and weaknesses', () => {
    const history = [
      attempt('b', { D1: [9, 10], D2: [5, 10] }),
      attempt('a', { D1: [8, 10], D2: [6, 10] }),
    ];
    const byDomain = Object.fromEntries(domainEvidence(history, 70).map((d) => [d.domain, d]));
    expect(byDomain['D1']).toMatchObject({ correct: 17, total: 20, status: 'strength' });
    expect(byDomain['D2']).toMatchObject({ correct: 11, total: 20, status: 'weakness' });
  });
});

describe('frequently missed topics and repeated mistakes', () => {
  const q1 = makeQuestion({ id: 'clf-d1-0001', taskStatement: '1.1' });
  const q2 = makeQuestion({ id: 'clf-d1-0002', taskStatement: '1.2' });
  const byId = indexQuestions([q1, q2]);
  const answer = (id: string, ok: boolean, s: string) => ({
    questionId: id,
    isCorrect: ok,
    at: 1,
    sessionId: s,
  });

  function progress(): ProgressMap {
    let p: ProgressMap = {};
    p = recordAnswer(p, answer(q1.id, false, 's1'));
    p = recordAnswer(p, answer(q1.id, false, 's2'));
    p = recordAnswer(p, answer(q1.id, true, 's3'));
    p = recordAnswer(p, answer(q2.id, false, 's1'));
    p = recordAnswer(p, answer('clf-d9-0001', false, 's1')); // not in the bank
    return p;
  }

  it('ranks topics by misses and ignores topics missed only once', () => {
    expect(frequentlyMissedTopics(progress(), byId)).toEqual([
      { taskStatement: '1.1', misses: 2, questions: 1 },
    ]);
  });

  it('lists questions missed at least twice, even if the latest answer was correct', () => {
    expect(repeatedMistakes(progress(), new Set([q1.id, q2.id]))).toEqual([
      { questionId: q1.id, misses: 2, attempts: 3, lastResult: 'correct' },
    ]);
  });

  it('returns nothing with no history', () => {
    expect(frequentlyMissedTopics({}, byId)).toEqual([]);
    expect(repeatedMistakes({}, new Set())).toEqual([]);
  });
});

describe('assessReadiness', () => {
  it('gives no judgement with fewer than three attempts, even with a perfect score', () => {
    const result = assessReadiness([balanced('a', 100, 1)], 70);
    expect(result.level).toBe('insufficient-data');
    expect(result.criteria.find((c) => c.id === 'attempts')).toMatchObject({
      met: false,
      detail: '1 of 3 taken',
    });
  });

  it('is "consistent" only when every criterion is met', () => {
    const history = [balanced('c', 85, 3), balanced('b', 82, 2), balanced('a', 84, 1)];
    const result = assessReadiness(history, 70);
    expect(result.level).toBe('consistent');
    expect(result.criteria.every((c) => c.met)).toBe(true);
  });

  it('is "mixed" when the average meets the benchmark but one recent exam did not', () => {
    const history = [balanced('c', 90, 3), balanced('b', 60, 2), balanced('a', 85, 1)];
    const result = assessReadiness(history, 70);
    expect(result.level).toBe('mixed');
    expect(result.criteria.find((c) => c.id === 'each-recent')?.met).toBe(false);
  });

  it('is "below" when the recent average is under the benchmark', () => {
    const history = [balanced('c', 60, 3), balanced('b', 55, 2), balanced('a', 65, 1)];
    expect(assessReadiness(history, 70).level).toBe('below');
  });

  it('uses only the three most recent attempts', () => {
    const history = [
      balanced('d', 80, 4),
      balanced('c', 80, 3),
      balanced('b', 80, 2),
      balanced('a', 10, 1),
    ];
    expect(assessReadiness(history, 70).level).toBe('consistent');
  });

  it('respects the configured benchmark', () => {
    const history = [balanced('c', 75, 3), balanced('b', 75, 2), balanced('a', 75, 1)];
    expect(assessReadiness(history, 70).level).not.toBe('below');
    expect(assessReadiness(history, 80).level).toBe('below');
  });
});
