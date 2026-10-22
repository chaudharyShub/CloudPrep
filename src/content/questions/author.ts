import type { DomainId, TaskStatementId } from '@/domain/exam-guide/clf-c02';
import type { Difficulty, Question, ReviewStatus } from '@/domain/questions/types';
import { REFS, type RefKey } from './refs';

/** Option ids in order; the first option is 'a'. */
const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f'] as const;
export type Letter = (typeof LETTERS)[number];

const LEVELS: Record<'e' | 'm' | 'h', Difficulty> = { e: 'easy', m: 'medium', h: 'hard' };

/**
 * A question written in compact form. Options are `[text, explanation]` pairs; their ids are
 * assigned in order ('a', 'b', …). `a` is the correct letter, or letters for multiple response.
 */
export interface QuestionSpec {
  /** Number part of the ID: 45 → clf-d<domain>-0045. Never reuse a number. */
  readonly n: number;
  readonly t: TaskStatementId;
  readonly lv: keyof typeof LEVELS;
  /** Question text. */
  readonly q: string;
  readonly o: readonly (readonly [text: string, explanation: string])[];
  readonly a: Letter | readonly Letter[];
  /** Why the correct answer is correct. */
  readonly x: string;
  readonly r: readonly RefKey[];
  readonly tags?: readonly string[];
}

export interface BatchMeta {
  readonly domain: DomainId;
  /** YYYY-MM-DD the batch was written. */
  readonly written: string;
  readonly status?: ReviewStatus;
}

const DOMAIN_NUMBER: Record<DomainId, number> = { D1: 1, D2: 2, D3: 3, D4: 4 };

/** Expands compact specs into full questions. Validation happens in the bank validator. */
export function defineQuestions(meta: BatchMeta, specs: readonly QuestionSpec[]): Question[] {
  return specs.map((spec) => {
    const correct = typeof spec.a === 'string' ? [spec.a] : [...spec.a];
    return {
      id: `clf-d${DOMAIN_NUMBER[meta.domain]}-${String(spec.n).padStart(4, '0')}`,
      revision: 1,
      type: correct.length > 1 ? 'multiple' : 'single',
      stem: spec.q,
      options: spec.o.map(([text, explanation], index) => ({
        id: LETTERS[index] ?? `x${index}`,
        text,
        explanation,
      })),
      correctOptionIds: correct,
      explanation: spec.x,
      domain: meta.domain,
      taskStatement: spec.t,
      difficulty: LEVELS[spec.lv],
      tags: spec.tags ?? [],
      references: spec.r.map((key) => REFS[key]),
      review: { status: meta.status ?? 'unverified', lastVerified: meta.written },
    };
  });
}
