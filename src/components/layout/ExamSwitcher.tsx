import { useId } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Select } from '@/components/ui/FormControls';
import { AVAILABLE_EXAMS } from '@/state/CurrentExam';
import { useCurrentExam } from '@/state/hooks';
import { useAppStore } from '@/state/StoreProvider';
import { switchExamPath } from './examSwitch';

const OPTIONS = AVAILABLE_EXAMS.map((exam) => ({
  value: exam.id,
  label: `${exam.code} · ${exam.shortName}`,
}));

/** Lets the learner pick the exam they study for (D-066). Hidden while only one is offered. */
export function ExamSwitcher({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const exam = useCurrentExam();
  const store = useAppStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const id = useId();
  if (OPTIONS.length < 2) return null;
  return (
    <div className="flex flex-col gap-1.5">
      {/* The label lines up with the navigation text; the pill spans the navigation's width. */}
      <label htmlFor={id} className="px-4 text-sm font-medium text-fg">
        Exam
      </label>
      <Select
        id={id}
        value={exam.id}
        options={OPTIONS}
        variant="pill"
        onValueChange={(next) => {
          store.setPreferences({ exam: next });
          const target = switchExamPath(pathname, exam.id, next);
          if (target) {
            void navigate(target);
            onNavigate?.();
          }
        }}
      />
    </div>
  );
}
