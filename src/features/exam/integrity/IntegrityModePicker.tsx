import { useId } from 'react';
import { Link } from 'react-router';
import type { IntegrityMode } from '@/domain/exam/integrity';
import { cn } from '@/lib/cn';
import { browserEnvironment, webcamChecksSupported } from './monitor';

// eslint-disable-next-line react-refresh/only-export-components -- copy shared with the start dialog
export const MODE_SUMMARY: Record<IntegrityMode, string> = {
  standard: 'Standard practice: nothing is monitored.',
  focus:
    'Strict practice: CloudPrep asks for fullscreen and logs when the tab is hidden, the window loses focus, or fullscreen is exited.',
  webcam:
    'Strict practice with webcam: as above, plus local checks for whether a face is visible. Your browser will ask for camera permission. Nothing is recorded or uploaded.',
};

const OPTIONS: { value: IntegrityMode; title: string; detail: string }[] = [
  {
    value: 'standard',
    title: 'Standard practice',
    detail: 'No monitoring. Recommended for most practice.',
  },
  {
    value: 'focus',
    title: 'Strict practice',
    detail:
      'Asks for fullscreen to reduce distractions, like a real exam room, and logs tab switches, focus changes and fullscreen exits (type and time only). Fullscreen doesn’t block other apps.',
  },
  {
    value: 'webcam',
    title: 'Strict practice with webcam',
    detail:
      'Adds local face-presence checks (face visible, no face, more than one face) every few seconds. No video or images are stored or sent anywhere.',
  },
];

/** Pre-exam choice of practice-integrity mode, with what each one monitors. */
export function IntegrityModePicker({
  value,
  onChange,
  webcamSupported = webcamChecksSupported(browserEnvironment()),
}: {
  value: IntegrityMode;
  onChange: (mode: IntegrityMode) => void;
  webcamSupported?: boolean;
}) {
  const name = useId();
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-sm font-medium text-fg">Practice mode</legend>
      <div className="flex flex-col gap-2">
        {OPTIONS.map((option) => {
          const disabled = option.value === 'webcam' && !webcamSupported;
          const id = `${name}-${option.value}`;
          return (
            // The label's text is in the nested spans below.
            // eslint-disable-next-line jsx-a11y/label-has-associated-control
            <label
              key={option.value}
              htmlFor={id}
              className={cn(
                'flex gap-3 rounded-md border p-3 text-sm',
                value === option.value
                  ? 'border-accent bg-accent-subtle'
                  : 'border-border bg-surface',
                disabled
                  ? 'cursor-not-allowed opacity-60'
                  : 'cursor-pointer hover:border-border-strong',
                'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus',
              )}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                disabled={disabled}
                onChange={() => {
                  onChange(option.value);
                }}
                className="mt-0.5 size-4 shrink-0 accent-accent focus-visible:outline-none"
              />
              <span>
                <span className="block font-medium text-fg">{option.title}</span>
                <span className="sr-only">.</span>
                <span className="mt-0.5 block text-fg-muted">
                  {disabled
                    ? 'Not available in this browser: it doesn’t provide built-in face detection, and CloudPrep doesn’t download a large AI library for this optional feature.'
                    : option.detail}
                </span>
              </span>
            </label>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-fg-subtle">
        Practice aid only, not proctoring: browser signals are imperfect and nothing here judges
        honesty. You can stop monitoring at any time.{' '}
        <Link
          to="/privacy"
          className="font-medium text-accent-fg underline-offset-4 hover:underline"
        >
          Privacy details
        </Link>
      </p>
    </fieldset>
  );
}
