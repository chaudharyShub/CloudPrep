import { InfoTip } from '@/components/ui/InfoTip';
import { REVIEW_INTERVAL_DAYS } from '@/domain/practice/review';

/** "1, 3, 7, 21 and then 60", from the schedule itself so the text can't drift. */
const DAYS = `${REVIEW_INTERVAL_DAYS.slice(0, -1).join(', ')} and then ${String(
  REVIEW_INTERVAL_DAYS.at(-1),
)}`;

/** The "i" next to "Review due" (D-052, D-058). */
export function ReviewDueInfo({ align = 'start' }: { align?: 'start' | 'end' }) {
  return (
    <InfoTip label="Review due" align={align}>
      <p className="font-semibold">What is Review due?</p>
      <p className="mt-1 text-fg-muted">
        Questions come back just before you’re likely to forget them. Each time you answer one
        correctly, it returns later: after {DAYS} days. A wrong answer brings it back the next day.
      </p>
      <p className="mt-2 text-fg-muted">Answers from Learning mode and mock exams both count.</p>
    </InfoTip>
  );
}
