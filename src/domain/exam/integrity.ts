/**
 * Optional practice-integrity logging (docs/DECISIONS.md D-036).
 *
 * This is a self-discipline aid for a personal practice tool, not proctoring. Events are
 * imperfect browser signals: switching tabs can be accidental, and a browser can't see other
 * devices, screens or people. Nothing here judges or scores honesty. Only the event type and
 * a timestamp are kept: no video, images, URLs, window titles or keystrokes.
 */

export const INTEGRITY_MODES = ['standard', 'focus', 'webcam'] as const;
/**
 * - `standard`: nothing is monitored.
 * - `focus`: tab visibility, window focus and fullscreen are logged; fullscreen is requested.
 * - `webcam`: as `focus`, plus local face-presence checks from the camera (where supported).
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
export const MAX_INTEGRITY_EVENTS = 500;

export const STANDARD_LOG: IntegrityLog = { mode: 'standard', events: [] };

export type IntegrityCategory = 'Session' | 'Focus' | 'Fullscreen' | 'Camera';

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
