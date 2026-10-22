import { DOMAINS, type DomainId, type TaskStatementId } from '@/domain/exam-guide/clf-c02';
import type { ExamAttempt } from '@/domain/exam/attempt';
import type { ProgressMap } from '@/domain/practice/progress';
import type { Question } from '@/domain/questions/types';

/** Recent attempts considered for trends and averages. */
export const RECENT_WINDOW = 5;
/** Attempts needed before any readiness guidance is given. */
export const MIN_ATTEMPTS_FOR_GUIDANCE = 3;
/** Questions needed in a domain (across recent exams) before calling it strong or weak. */
export const MIN_DOMAIN_SAMPLE = 10;
/** Score changes smaller than this (percentage points) count as "steady". */
export const TREND_THRESHOLD = 3;

/**
 * Attempts that count as evidence. Exams ended by the AI proctor are void: they stay in
 * history but are left out of scores, trends and readiness.
 */
export function countedAttempts(attempts: readonly ExamAttempt[]): readonly ExamAttempt[] {
  return attempts.filter((a) => a.submitReason !== 'proctor_ended');
}

export interface RecentScore {
  id: string;
  submittedAt: number;
  percent: number;
  kind: ExamAttempt['kind'];
  benchmarkMet: boolean;
}

/** Most recent attempts, oldest first (for left-to-right display). Input is newest first. */
export function recentScores(
  attempts: readonly ExamAttempt[],
  window = RECENT_WINDOW,
): RecentScore[] {
  return countedAttempts(attempts)
    .slice(0, window)
    .map((a) => ({
      id: a.id,
      submittedAt: a.submittedAt,
      percent: a.summary.percent,
      kind: a.kind,
      benchmarkMet: a.benchmarkMet,
    }))
    .reverse();
}

export interface ScoreTrend {
  /** Latest minus oldest score in the window, in percentage points. Null with < 2 attempts. */
  change: number | null;
  direction: 'up' | 'down' | 'steady' | null;
  /** Mean of the window's percentages, or null with no attempts. */
  average: number | null;
  count: number;
}

export function scoreTrend(attempts: readonly ExamAttempt[], window = RECENT_WINDOW): ScoreTrend {
  const scores = recentScores(attempts, window);
  const first = scores[0];
  const last = scores[scores.length - 1];
  const average =
    scores.length === 0
      ? null
      : Math.round((scores.reduce((sum, s) => sum + s.percent, 0) / scores.length) * 10) / 10;
  if (!first || !last || scores.length < 2) {
    return { change: null, direction: null, average, count: scores.length };
  }
  const change = Math.round((last.percent - first.percent) * 10) / 10;
  const direction = Math.abs(change) < TREND_THRESHOLD ? 'steady' : change > 0 ? 'up' : 'down';
  return { change, direction, average, count: scores.length };
}

export interface DomainEvidence {
  domain: DomainId;
  correct: number;
  total: number;
  /** correct / total across recent exams, or null with no questions. */
  ratio: number | null;
  /** Enough questions to judge (see MIN_DOMAIN_SAMPLE). */
  enoughData: boolean;
  status: 'strength' | 'weakness' | 'neutral' | 'insufficient';
}

/**
 * Domain performance pooled over recent exams. A domain is only called a strength or
 * weakness with at least MIN_DOMAIN_SAMPLE questions, so two lucky answers never read
 * as mastery. Strength = 10+ points above the benchmark; weakness = below it.
 */
export function domainEvidence(
  attempts: readonly ExamAttempt[],
  benchmarkPercent: number,
  window = RECENT_WINDOW,
): DomainEvidence[] {
  const recent = countedAttempts(attempts).slice(0, window);
  return DOMAINS.map((domain) => {
    let correct = 0;
    let total = 0;
    for (const attempt of recent) {
      const result = attempt.summary.byDomain[domain.id];
      correct += result.correct;
      total += result.total;
    }
    const ratio = total === 0 ? null : correct / total;
    const enoughData = total >= MIN_DOMAIN_SAMPLE;
    let status: DomainEvidence['status'] = 'insufficient';
    if (enoughData && ratio !== null) {
      if (ratio * 100 < benchmarkPercent) status = 'weakness';
      else if (ratio * 100 >= benchmarkPercent + 10) status = 'strength';
      else status = 'neutral';
    }
    return { domain: domain.id, correct, total, ratio, enoughData, status };
  });
}

export interface MissedTopic {
  taskStatement: TaskStatementId;
  /** Incorrect answers recorded for questions in this task statement (practice + exams). */
  misses: number;
  questions: number;
}

/** Task statements with the most incorrect answers overall (at least 2), most first. */
export function frequentlyMissedTopics(
  progress: ProgressMap,
  questionsById: ReadonlyMap<string, Question>,
  limit = 5,
): MissedTopic[] {
  const byTask = new Map<TaskStatementId, MissedTopic>();
  for (const [questionId, entry] of Object.entries(progress)) {
    const question = questionsById.get(questionId);
    if (!question) continue;
    const misses = entry.attempts - entry.correct;
    if (misses === 0) continue;
    const topic = byTask.get(question.taskStatement) ?? {
      taskStatement: question.taskStatement,
      misses: 0,
      questions: 0,
    };
    topic.misses += misses;
    topic.questions++;
    byTask.set(question.taskStatement, topic);
  }
  return [...byTask.values()]
    .filter((topic) => topic.misses >= 2)
    .sort((a, b) => b.misses - a.misses || a.taskStatement.localeCompare(b.taskStatement))
    .slice(0, limit);
}

export interface RepeatedMistake {
  questionId: string;
  misses: number;
  attempts: number;
  lastResult: 'correct' | 'incorrect';
}

/** Questions answered incorrectly at least twice, most misses first. */
export function repeatedMistakes(
  progress: ProgressMap,
  availableIds: ReadonlySet<string>,
  limit = 10,
): RepeatedMistake[] {
  return Object.entries(progress)
    .filter(([id]) => availableIds.has(id))
    .map(([questionId, entry]) => ({
      questionId,
      misses: entry.attempts - entry.correct,
      attempts: entry.attempts,
      lastResult: entry.lastResult,
    }))
    .filter((item) => item.misses >= 2)
    .sort((a, b) => b.misses - a.misses || a.questionId.localeCompare(b.questionId))
    .slice(0, limit);
}

export interface ReadinessCriterion {
  id: 'attempts' | 'average' | 'each-recent' | 'domains';
  label: string;
  met: boolean;
  detail: string;
}

export interface ReadinessAssessment {
  /**
   * - `insufficient-data`: fewer than MIN_ATTEMPTS_FOR_GUIDANCE attempts; no judgement made.
   * - `below`: recent average under the benchmark.
   * - `mixed`: average meets the benchmark but not every criterion does.
   * - `consistent`: every criterion met. This is still not a prediction of the real exam.
   */
  level: 'insufficient-data' | 'below' | 'mixed' | 'consistent';
  criteria: ReadinessCriterion[];
}

/**
 * Practice-readiness guidance with explicit, explainable criteria over the last three
 * attempts. It never says "ready": the most positive level means "consistently at or above
 * your practice benchmark".
 */
export function assessReadiness(
  attempts: readonly ExamAttempt[],
  benchmarkPercent: number,
): ReadinessAssessment {
  const window = MIN_ATTEMPTS_FOR_GUIDANCE;
  const recent = countedAttempts(attempts).slice(0, window);
  const enough = recent.length >= window;
  const average =
    recent.length === 0 ? 0 : recent.reduce((sum, a) => sum + a.summary.ratio, 0) / recent.length;
  const below = recent.filter((a) => a.summary.ratio * 100 < benchmarkPercent).length;
  const evidence = domainEvidence(attempts, benchmarkPercent, window);
  const weakOrUnknown = evidence.filter(
    (d) => d.status === 'weakness' || d.status === 'insufficient',
  );

  const criteria: ReadinessCriterion[] = [
    {
      id: 'attempts',
      label: `At least ${window} practice exams`,
      met: enough,
      detail: `${recent.length} of ${window} taken`,
    },
    {
      id: 'average',
      label: `Average of the last ${window} exams at or above ${benchmarkPercent}%`,
      met: enough && average * 100 >= benchmarkPercent,
      detail: recent.length === 0 ? 'No exams yet' : `Average ${Math.round(average * 1000) / 10}%`,
    },
    {
      id: 'each-recent',
      label: `Each of the last ${window} exams at or above ${benchmarkPercent}%`,
      met: enough && below === 0,
      detail:
        recent.length === 0
          ? 'No exams yet'
          : `${recent.length - below} of ${recent.length} at or above`,
    },
    {
      id: 'domains',
      label: `Every domain at or above ${benchmarkPercent}% across those exams, with at least ${MIN_DOMAIN_SAMPLE} questions each`,
      met: enough && weakOrUnknown.length === 0,
      detail:
        weakOrUnknown.length === 0
          ? 'All four domains'
          : `${weakOrUnknown.length} domain${weakOrUnknown.length === 1 ? '' : 's'} below or without enough questions`,
    },
  ];

  let level: ReadinessAssessment['level'];
  if (!enough) level = 'insufficient-data';
  else if (criteria.every((c) => c.met)) level = 'consistent';
  else if (average * 100 >= benchmarkPercent) level = 'mixed';
  else level = 'below';
  return { level, criteria };
}
