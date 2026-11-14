/**
 * Optional practice-integrity logging (docs/DECISIONS.md D-036, D-043).
 *
 * `focus` mode is a self-discipline aid that never judges. `proctored` mode is a strict AI
 * proctor the learner opts into: its rules (in `proctor.ts`) give warnings and can end the
 * exam. Either way only the event type and a timestamp are kept: no video, audio, images,
 * URLs, window titles or keystrokes.
 */

export const INTEGRITY_MODES = ['standard', 'focus', 'proctored', 'webcam'] as const;
/**
 * - `standard`: nothing is monitored.
 * - `focus`: tab visibility, window focus and fullscreen are logged; fullscreen is requested.
 * - `proctored`: strict AI proctoring with camera and microphone (see `proctor.ts`).
 * - `webcam`: retired (it relied on the browser's built-in face detector). Kept only so
 *   exams saved with it still load and show their log.
 */
export type IntegrityMode = (typeof INTEGRITY_MODES)[number];

export const INTEGRITY_EVENT_TYPES = [
  'monitoring-started',
  'tab-hidden',
  'tab-visible',
  'window-blur',
  'window-focus',
  'fullscreen-entered',
  'fullscreen-exited',
  'fullscreen-unavailable',
  'camera-started',
  'camera-denied',
  'camera-unavailable',
  'camera-stopped',
  'face-visible',
  'face-not-detected',
  'multiple-faces',
  'monitoring-stopped',
  // Proctored mode
  'proctor-started',
  'proctor-resumed',
  'microphone-lost',
  'camera-lost',
  'camera-covered',
  'looking-away',
  'eyes-off-screen',
  'eyes-closed',
  'mouth-moving',
  'voice-detected',
  'phone-detected',
  'person-detected',
  'item-detected',
  'pointer-left',
  'blocked-shortcut',
  'extra-display',
  'exam-ended-by-proctor',
] as const;
export type IntegrityEventType = (typeof INTEGRITY_EVENT_TYPES)[number];

export interface IntegrityEvent {
  readonly type: IntegrityEventType;
  readonly at: number;
}

export interface IntegrityLog {
  readonly mode: IntegrityMode;
  readonly events: readonly IntegrityEvent[];
}

/** Keeps the log small: at most this many events per exam (oldest kept, later ones dropped). */
export const MAX_INTEGRITY_EVENTS = 1000;

export const STANDARD_LOG: IntegrityLog = { mode: 'standard', events: [] };

export type IntegrityCategory =
  | 'Session'
  | 'Focus'
  | 'Fullscreen'
  | 'Camera'
  | 'Microphone'
  | 'Face and eyes'
  | 'Objects'
  | 'Screen and keyboard';

export interface EventDescription {
  category: IntegrityCategory;
  label: string;
  explanation: string;
  /** What, if anything, the learner might do. Never an accusation. */
  action: string | null;
}

export const EVENT_DESCRIPTIONS: Record<IntegrityEventType, EventDescription> = {
  'monitoring-started': {
    category: 'Session',
    label: 'Monitoring started',
    explanation: 'Strict practice began recording browser events for this exam.',
    action: null,
  },
  'tab-hidden': {
    category: 'Focus',
    label: 'Exam tab hidden',
    explanation:
      'The exam tab stopped being visible, for example after switching tabs, minimising the window, or locking the screen.',
    action: 'None required. Under real exam conditions, stay on the exam screen.',
  },
  'tab-visible': {
    category: 'Focus',
    label: 'Exam tab visible again',
    explanation: 'The exam tab became visible again.',
    action: null,
  },
  'window-blur': {
    category: 'Focus',
    label: 'Window lost focus',
    explanation:
      'Another window or app received focus. Notifications, system dialogs and browser menus can also cause this.',
    action: 'None required. This signal often has innocent causes.',
  },
  'window-focus': {
    category: 'Focus',
    label: 'Window focused again',
    explanation: 'The exam window received focus again.',
    action: null,
  },
  'fullscreen-entered': {
    category: 'Fullscreen',
    label: 'Fullscreen on',
    explanation: 'The exam entered fullscreen mode.',
    action: null,
  },
  'fullscreen-exited': {
    category: 'Fullscreen',
    label: 'Fullscreen exited',
    explanation:
      'The exam left fullscreen, for example by pressing Esc. Fullscreen only hides other windows; it never blocked other apps.',
    action: 'Optional: return to fullscreen for strict conditions.',
  },
  'fullscreen-unavailable': {
    category: 'Fullscreen',
    label: 'Fullscreen not available',
    explanation: 'The browser declined the fullscreen request or doesn’t support it here.',
    action: 'None required. The exam works without fullscreen.',
  },
  'camera-started': {
    category: 'Camera',
    label: 'Camera on',
    explanation: 'The camera started for local face-presence checks. Nothing was recorded.',
    action: null,
  },
  'camera-denied': {
    category: 'Camera',
    label: 'Camera permission denied',
    explanation:
      'Camera access was declined, so webcam checks didn’t run. The exam continued normally.',
    action: 'None required. Allow camera access in browser settings if you want webcam checks.',
  },
  'camera-unavailable': {
    category: 'Camera',
    label: 'Camera unavailable',
    explanation:
      'No camera was found, another app was using it, or it disconnected. Webcam checks stopped.',
    action: 'Optional: check the camera connection.',
  },
  'camera-stopped': {
    category: 'Camera',
    label: 'Camera off',
    explanation: 'The camera was turned off and the stream was closed.',
    action: null,
  },
  'face-visible': {
    category: 'Camera',
    label: 'Face visible',
    explanation: 'One face was detected in front of the camera.',
    action: null,
  },
  'face-not-detected': {
    category: 'Camera',
    label: 'No face detected',
    explanation:
      'No face was detected. Lighting, camera angle, looking down at notes paper or leaning away can all cause this.',
    action: 'None required. Detection is approximate.',
  },
  'multiple-faces': {
    category: 'Camera',
    label: 'More than one face detected',
    explanation:
      'More than one face was detected. Photos, posters or reflections can also trigger this.',
    action: 'None required. Detection is approximate.',
  },
  'monitoring-stopped': {
    category: 'Session',
    label: 'Monitoring stopped',
    explanation: 'You turned monitoring off. The exam continued without it.',
    action: null,
  },
  'proctor-started': {
    category: 'Session',
    label: 'AI proctor started',
    explanation:
      'Check-in passed and the AI proctor began watching the camera and listening to the microphone. Nothing was recorded.',
    action: null,
  },
  'proctor-resumed': {
    category: 'Session',
    label: 'Exam interrupted',
    explanation:
      'The exam page was reloaded, or closed and opened again, so the proctor had to restart.',
    action: 'Stay on the exam page from start to finish.',
  },
  'microphone-lost': {
    category: 'Microphone',
    label: 'Microphone lost',
    explanation: 'The microphone stopped, was muted or disconnected, or permission was removed.',
    action: 'Keep the microphone connected and on for the whole exam.',
  },
  'camera-lost': {
    category: 'Camera',
    label: 'Camera lost',
    explanation: 'The camera stopped, disconnected, or permission was removed.',
    action: 'Keep the camera connected and on for the whole exam.',
  },
  'camera-covered': {
    category: 'Camera',
    label: 'Camera covered or too dark',
    explanation: 'The camera image was almost completely dark.',
    action: 'Keep the camera uncovered and your room lit.',
  },
  'looking-away': {
    category: 'Face and eyes',
    label: 'Head turned away',
    explanation: 'Your head turned away from the screen for more than 2 seconds.',
    action: 'Keep facing the screen.',
  },
  'eyes-off-screen': {
    category: 'Face and eyes',
    label: 'Eyes off the screen',
    explanation: 'Your eyes looked away from the screen for more than 2 seconds.',
    action: 'Keep your eyes on the screen.',
  },
  'eyes-closed': {
    category: 'Face and eyes',
    label: 'Eyes closed',
    explanation: 'Your eyes stayed closed for more than 3 seconds.',
    action: 'Keep your eyes open and on the screen.',
  },
  'mouth-moving': {
    category: 'Face and eyes',
    label: 'Lips moving',
    explanation:
      'Your mouth kept moving, as when talking, whispering, reading aloud or chewing. None of these is allowed.',
    action: 'Read silently and keep your mouth still.',
  },
  'voice-detected': {
    category: 'Microphone',
    label: 'Voice or noise detected',
    explanation: 'The microphone picked up speech or noise above the level measured at check-in.',
    action: 'Stay silent and take the exam in a quiet room.',
  },
  'phone-detected': {
    category: 'Objects',
    label: 'Phone detected',
    explanation: 'A mobile phone was visible to the camera.',
    action: 'Keep phones out of the room, or at least out of reach.',
  },
  'person-detected': {
    category: 'Objects',
    label: 'Another person detected',
    explanation: 'Another person was visible to the camera.',
    action: 'Take the exam alone in a closed room.',
  },
  'item-detected': {
    category: 'Objects',
    label: 'Unauthorised item detected',
    explanation: 'A book, notebook, laptop or other screen was visible to the camera.',
    action: 'Clear your desk and remove extra devices.',
  },
  'pointer-left': {
    category: 'Screen and keyboard',
    label: 'Mouse left the exam',
    explanation: 'The mouse pointer left the exam page, for example to move to another monitor.',
    action: 'Keep the pointer on the exam screen.',
  },
  'blocked-shortcut': {
    category: 'Screen and keyboard',
    label: 'Blocked action',
    explanation:
      'Copy, paste, printing, screenshots, developer tools, the context menu or another blocked shortcut was used.',
    action: 'Use only the exam controls.',
  },
  'extra-display': {
    category: 'Screen and keyboard',
    label: 'Second display detected',
    explanation: 'The browser reported that more than one display is connected.',
    action: 'Disconnect extra monitors before the exam.',
  },
  'exam-ended-by-proctor': {
    category: 'Session',
    label: 'Exam ended by the proctor',
    explanation: 'The proctor ended the exam under the strict rules.',
    action: null,
  },
};

export function isIntegrityMode(value: unknown): value is IntegrityMode {
  return typeof value === 'string' && (INTEGRITY_MODES as readonly string[]).includes(value);
}

export function isIntegrityEventType(value: unknown): value is IntegrityEventType {
  return typeof value === 'string' && (INTEGRITY_EVENT_TYPES as readonly string[]).includes(value);
}

/** Appends an event, respecting the cap. */
export function appendEvent(log: IntegrityLog, event: IntegrityEvent): IntegrityLog {
  if (log.mode === 'standard' || log.events.length >= MAX_INTEGRITY_EVENTS) return log;
  return { ...log, events: [...log.events, event] };
}

/** Count of events that interrupted focus or fullscreen; shown as plain counts, never a score. */
export function summarizeLog(log: IntegrityLog): Partial<Record<IntegrityEventType, number>> {
  const counts: Partial<Record<IntegrityEventType, number>> = {};
  for (const event of log.events) counts[event.type] = (counts[event.type] ?? 0) + 1;
  return counts;
}
