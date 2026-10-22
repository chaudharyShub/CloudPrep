import { useId } from 'react';
import { Link } from 'react-router';
import type { IntegrityMode } from '@/domain/exam/integrity';
import { MAX_STRIKES } from '@/domain/exam/proctor';
import { cn } from '@/lib/cn';

type SelectableMode = Exclude<IntegrityMode, 'webcam'>;

// eslint-disable-next-line react-refresh/only-export-components -- copy shared with the start dialog
export const MODE_SUMMARY: Record<IntegrityMode, string> = {
  standard: 'Standard practice: nothing is monitored.',
  focus:
    'Strict practice: CloudPrep asks for fullscreen and logs when the tab is hidden, the window loses focus, or fullscreen is exited.',
  proctored:
    'AI-proctored exam: a strict AI proctor watches through your camera and microphone, gives warnings and can end the exam.',
  webcam: 'Strict practice with webcam (retired).',
};

const OPTIONS: { value: SelectableMode; title: string; detail: string }[] = [
  {
    value: 'standard',
    title: 'Standard practice',
    detail: 'No monitoring. Recommended for most practice.',
  },
  {
    value: 'focus',
    title: 'Strict practice',
    detail:
      'Asks for fullscreen to reduce distractions, like a real exam room, and logs tab switches, focus changes and fullscreen exits (type and time only). Never ends the exam.',
  },
  {
    value: 'proctored',
    title: 'AI-proctored exam (strictest)',
    detail: `Like an online proctored exam, but stricter. After a check-in, an AI proctor on this device watches your face, eyes, mouth and room (phones, other people, books, screens), listens for voices, and blocks shortcuts. ${String(MAX_STRIKES - 1)} warnings, then the exam ends; a phone or another person ends it at once. Needs a camera, microphone and fullscreen. Nothing is recorded or uploaded.`,
  },
];

/** Whether this browser can run a proctored exam (camera, microphone and fullscreen). */
// eslint-disable-next-line react-refresh/only-export-components -- small check shared with tests
export function proctoringSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    // Older browsers lack mediaDevices entirely.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    typeof navigator.mediaDevices?.getUserMedia === 'function' &&
    document.fullscreenEnabled &&
    typeof WebAssembly === 'object'
  );
}

/** Pre-exam choice of practice-integrity mode, with what each one monitors. */
export function IntegrityModePicker({
  value,
  onChange,
  proctoringAvailable = proctoringSupported(),
}: {
  value: IntegrityMode;
  onChange: (mode: IntegrityMode) => void;
  proctoringAvailable?: boolean;
}) {
  const name = useId();
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-sm font-medium text-fg">Practice mode</legend>
      <div className="flex flex-col gap-2">
        {OPTIONS.map((option) => {
          const disabled = option.value === 'proctored' && !proctoringAvailable;
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
                    ? 'Not available in this browser: it needs camera and microphone access and fullscreen. Use a recent browser on a computer.'
                    : option.detail}
                </span>
              </span>
            </label>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-fg-subtle">
        Strict practice never judges; the AI proctor does, and its detection is approximate. A
        browser can&apos;t see other apps or devices out of view.{' '}
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
