import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PAGE_ICONS } from '@/components/layout/pageIcons';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Field, SegmentedControl, Select, Switch } from '@/components/ui/FormControls';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/hooks/useTheme';
import type { MotionPreference, ThemePreference } from '@/lib/theme';
import { useAppStore } from '@/state/StoreProvider';
import { usePreferences, useUserData } from '@/state/hooks';
import { PRACTICE_LENGTHS, type PracticeLength } from '@/storage/preferencesArea';
import { AccountCard } from '@/features/auth/AccountCard';
import { DataManagement } from './DataManagement';

const THEME_OPTIONS = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
] as const satisfies readonly { value: ThemePreference; label: string }[];

const MOTION_OPTIONS = [
  { value: 'system', label: 'Follow system' },
  { value: 'reduce', label: 'Reduce' },
] as const satisfies readonly { value: MotionPreference; label: string }[];

const BENCHMARKS = ['50', '55', '60', '65', '70', '75', '80', '85', '90'] as const;
type Benchmark = (typeof BENCHMARKS)[number];
const BENCHMARK_OPTIONS: readonly { value: Benchmark; label: string }[] = BENCHMARKS.map(
  (value) => ({ value, label: value === '70' ? '70% (default)' : `${value}%` }),
);

const SESSION_LENGTH_OPTIONS: readonly { value: PracticeLength; label: string }[] =
  PRACTICE_LENGTHS.map((value) => ({ value, label: value === 'all' ? 'All' : value }));

export function SettingsPage() {
  const [theme, setTheme] = useTheme();
  const [confirmDefaults, setConfirmDefaults] = useState(false);
  const { showToast } = useToast();
  const store = useAppStore();
  const preferences = usePreferences();
  const { preferenceOverrides } = useUserData();
  const benchmark = String(preferences.benchmarkPercent) as Benchmark;
  const hasCustomSettings = Object.keys(preferenceOverrides).length > 0;

  return (
    <>
      <PageHeader
        title="Settings"
        icon={PAGE_ICONS.settings}
        description="Your preferences and the data CloudPrep saves for you. Changes save automatically."
      />

      <div className="flex max-w-prose flex-col gap-6">
        <AccountCard />
        <Card>
          <CardHeader title="Appearance" />
          <CardBody className="flex flex-col gap-6">
            <SegmentedControl
              label="Theme"
              description="System follows your device's light or dark setting."
              value={theme}
              options={THEME_OPTIONS}
              onValueChange={setTheme}
            />
            <SegmentedControl
              label="Motion"
              description="Reduce turns off transitions and animations, even if your device allows them."
              value={preferences.reducedMotion}
              options={MOTION_OPTIONS}
              onValueChange={(value) => {
                store.setPreferences({ reducedMotion: value });
              }}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Exams and practice" />
          <CardBody className="flex flex-col gap-6">
            <Field
              label="Practice benchmark"
              description="The unofficial practice score you aim for in mock exams. It applies to exams you take from now on; past results keep the benchmark they were taken with. AWS's real result is a scaled score (700 of 1,000 to pass) calculated with a method AWS doesn't publish, so a practice result can't predict or guarantee it."
            >
              {({ id, describedBy }) => (
                <Select
                  id={id}
                  aria-describedby={describedBy}
                  value={benchmark}
                  options={BENCHMARK_OPTIONS}
                  onValueChange={(value) => {
                    store.setPreferences({ benchmarkPercent: Number(value) });
                  }}
                  className="sm:w-56"
                />
              )}
            </Field>
            <Switch
              label="Low-time warnings"
              description="Highlight the exam timer and announce it to screen readers when 10 and 5 minutes remain."
              checked={preferences.examTimeWarnings}
              onCheckedChange={(checked) => {
                store.setPreferences({ examTimeWarnings: checked });
              }}
            />
            <Switch
              label="Shuffle answer options"
              description="Show answer options in a different order each time a question appears."
              checked={preferences.shuffleOptions}
              onCheckedChange={(checked) => {
                store.setPreferences({ shuffleOptions: checked });
              }}
            />
            <SegmentedControl
              label="Practice session length"
              description="Default number of questions in a Learning mode session."
              value={preferences.practiceSessionLength}
              options={SESSION_LENGTH_OPTIONS}
              onValueChange={(value) => {
                store.setPreferences({ practiceSessionLength: value });
              }}
            />
            <div className="border-t border-border pt-5">
              <Button
                variant="secondary"
                icon={RotateCcw}
                disabled={!hasCustomSettings}
                onClick={() => {
                  setConfirmDefaults(true);
                }}
              >
                Restore default settings
              </Button>
            </div>
          </CardBody>
        </Card>

        <DataManagement />
      </div>

      <ConfirmDialog
        open={confirmDefaults}
        title="Restore default settings?"
        description="Theme, motion, benchmark, warnings, shuffling and session length go back to their defaults. Your progress and history aren't affected."
        confirmLabel="Restore defaults"
        onCancel={() => {
          setConfirmDefaults(false);
        }}
        onConfirm={() => {
          setConfirmDefaults(false);
          store.resetPreferences();
          showToast({ title: 'Settings restored to defaults', tone: 'success' });
        }}
      />
    </>
  );
}
