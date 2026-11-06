import { useLocation, useNavigate } from 'react-router';
import { Field, Select } from '@/components/ui/FormControls';
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
  if (OPTIONS.length < 2) return null;
  return (
    <Field label="Exam" className="px-2">
      {({ id }) => (
        <Select
          id={id}
          value={exam.id}
          options={OPTIONS}
          onValueChange={(next) => {
            store.setPreferences({ exam: next });
            const target = switchExamPath(pathname, exam.id, next);
            if (target) {
              void navigate(target);
              onNavigate?.();
            }
          }}
        />
      )}
    </Field>
  );
}
