import type { CheckInIssue } from '@/domain/exam/proctor';
import type { ProctorError, ProctorPhase } from './engine';

export const ERROR_TEXT: Record<ProctorError, string> = {
  unsupported:
    'This browser can’t use the camera and microphone. Use a recent Chrome, Edge, Firefox or Safari on a computer.',
  'permission-denied':
    'Camera or microphone access was blocked. Allow both for this site in your browser’s address bar or settings, then try again.',
  'no-device': 'No camera or microphone was found. Connect both and try again.',
  'device-busy':
    'The camera or microphone is in use by another app (for example a video call). Close it and try again.',
  'model-failed':
    'The AI proctor couldn’t load. Check your internet connection and try again. It needs about 25 MB the first time.',
  'calibration-failed':
    'Calibration needs your face clearly in view. Sit centred in front of the camera, look at the screen and try again.',
};

export const PHASE_TEXT: Partial<Record<ProctorPhase, string>> = {
  requesting: 'Waiting for camera and microphone permission…',
  loading: 'Loading the AI proctor (about 25 MB the first time)…',
  calibrating: 'Calibrating: look at the centre of the screen and keep still…',
};

export type ExtraCheckInIssue =
  'virtual-camera' | 'extra-display' | 'no-fullscreen' | 'device-lost';

export const ISSUE_TEXT: Record<CheckInIssue | ExtraCheckInIssue, string> = {
  dark: 'Your camera image is too dark, or the camera is covered. Turn on a light.',
  'no-face': 'Your face isn’t visible. Sit centred in front of the camera.',
  'multiple-faces': 'More than one face is visible. You must be alone.',
  'eyes-closed': 'Open your eyes and look at the screen.',
  phone: 'A phone is visible. Put it out of reach, out of view.',
  person: 'Another person is visible. You must be alone.',
  item: 'Remove books, notebooks, laptops and other screens from view.',
  noisy: 'The room is too noisy. Find a quiet room.',
  'virtual-camera': 'This looks like a virtual camera. Use your real webcam.',
  'extra-display': 'More than one display is connected. Disconnect the extra displays.',
  'no-fullscreen': 'This browser can’t show the exam in fullscreen.',
  'device-lost':
    'The camera or microphone was disconnected. Reload the page to start check-in again.',
};

/** Software cameras that could replay a video instead of showing the room. */
const VIRTUAL_CAMERA =
  /virtual|obs|manycam|snap camera|xsplit|droidcam|epoccam|ndi|camo|mmhmm|vcam/i;

export function isVirtualCamera(label: string): boolean {
  return VIRTUAL_CAMERA.test(label);
}
