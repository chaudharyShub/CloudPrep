import { DEFAULT_BENCHMARK_PERCENT } from '@/domain/exam/config';
import { isValidBenchmark } from '@/domain/exam/scoring';
import {
  isThemePreference,
  MOTION_PREFERENCES,
  type MotionPreference,
  type ThemePreference,
} from '@/lib/theme';
import type { AreaDefinition, Parsed } from './envelope';
import { isRecord, isSafeKey } from './guards';

export const PRACTICE_LENGTHS = ['5', '10', '20', 'all'] as const;
export type PracticeLength = (typeof PRACTICE_LENGTHS)[number];

/** Effective settings: defaults with the learner's saved choices applied on top. */
export interface Preferences {
  readonly theme: ThemePreference;
  readonly reducedMotion: MotionPreference;
  /** Unofficial practice benchmark, 50–90 (percent), in steps of 5. */
  readonly benchmarkPercent: number;
  /** Visual and screen-reader warnings at 10 and 5 minutes left in an exam. */
  readonly examTimeWarnings: boolean;
  readonly shuffleOptions: boolean;
  readonly practiceSessionLength: PracticeLength;
}

/**
 * Defaults live in code, not in storage (D-034). Only explicit choices are saved, so a
 * learner who never changed a setting picks up improved defaults automatically.
 */
export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'dark',
  reducedMotion: 'system',
  benchmarkPercent: DEFAULT_BENCHMARK_PERCENT,
  examTimeWarnings: true,
  shuffleOptions: true,
  practiceSessionLength: '10',
};

/** What is persisted: only the settings the learner changed. */
export type PreferenceOverrides = Partial<Preferences>;

const VALIDATORS: { [K in keyof Preferences]: (value: unknown) => value is Preferences[K] } = {
  theme: isThemePreference,
  reducedMotion: (v): v is MotionPreference =>
    (MOTION_PREFERENCES as readonly unknown[]).includes(v),
  benchmarkPercent: isValidBenchmark,
  examTimeWarnings: (v): v is boolean => typeof v === 'boolean',
  shuffleOptions: (v): v is boolean => typeof v === 'boolean',
  practiceSessionLength: (v): v is PracticeLength =>
    (PRACTICE_LENGTHS as readonly unknown[]).includes(v),
};
const KEYS = Object.keys(VALIDATORS) as (keyof Preferences)[];

export function effectivePreferences(overrides: PreferenceOverrides): Preferences {
  return { ...DEFAULT_PREFERENCES, ...overrides };
}

/**
 * Each saved field is checked on its own: an invalid or unknown field is dropped (and
 * reported) while the others are kept. Missing fields simply use the default.
 */
export function parsePreferenceOverrides(data: unknown): Parsed<PreferenceOverrides> | null {
  if (!isRecord(data)) return null;
  const value: Record<string, unknown> = {};
  let dropped = 0;
  for (const [key, field] of Object.entries(data)) {
    const valid =
      isSafeKey(key) &&
      (KEYS as string[]).includes(key) &&
      VALIDATORS[key as keyof Preferences](field);
    if (valid) value[key] = field;
    else dropped++;
  }
  return { value: value, dropped };
}

/** Defaults at the time schema v1 was written (it stored the whole settings object). */
const V1_DEFAULTS: Record<string, unknown> = {
  theme: 'dark',
  benchmarkPercent: 70,
  shuffleOptions: true,
  practiceSessionLength: '10',
};

/** v1 → v2: keep only the values the learner had changed from the v1 defaults. */
export function migratePreferencesV1(data: unknown): unknown {
  if (!isRecord(data)) return data;
  return Object.fromEntries(
    Object.entries(data).filter(
      ([key, value]) => !(key in V1_DEFAULTS) || V1_DEFAULTS[key] !== value,
    ),
  );
}

export const PREFERENCES_AREA: AreaDefinition<PreferenceOverrides> = {
  name: 'preferences',
  currentVersion: 2,
  fallback: () => ({}),
  migrations: { 1: migratePreferencesV1 },
  parse: parsePreferenceOverrides,
};
