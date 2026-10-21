import { Link } from 'react-router';
import { Camera, CameraOff, Eye, Maximize, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import type { IntegrityMode } from '@/domain/exam/integrity';
import { cn } from '@/lib/cn';
import type { IntegrityMonitor, MonitorState } from './monitor';

const CAMERA_TEXT: Record<MonitorState['camera'], string> = {
  off: 'Camera off',
  starting: 'Waiting for camera permission…',
  on: 'Camera on',
  denied: 'Camera permission denied',
  unavailable: 'Camera unavailable',
};
const FACE_TEXT: Record<MonitorState['face'], string | null> = {
  unknown: null,
  visible: 'face visible',
  none: 'no face detected',
  multiple: 'more than one face',
};

/** Always-visible status for strict practice, with ways to stop monitoring at any time. */
export function IntegrityBar({
  mode,
  monitor,
  state,
}: {
  mode: IntegrityMode;
  monitor: IntegrityMonitor | null;
  state: MonitorState;
}) {
  if (mode === 'standard') return null;
  const cameraOn = state.camera === 'on';
  return (
    <div className="flex flex-col gap-3">
      <div
        role="status"
        className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-border bg-surface px-3 py-2 text-xs text-fg-muted"
      >
        <span className="flex items-center gap-1.5 font-medium text-fg">
          <Eye size={14} aria-hidden="true" />
          {state.active ? 'Strict practice: focus monitoring on' : 'Monitoring off'}
        </span>
        {mode === 'webcam' && (
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={cn('size-2 rounded-full', cameraOn ? 'bg-danger' : 'bg-fg-subtle')}
            />
            {CAMERA_TEXT[state.camera]}
            {cameraOn && FACE_TEXT[state.face] && ` · ${FACE_TEXT[state.face] ?? ''}`}
            {cameraOn && ' · nothing is recorded'}
          </span>
        )}
        <span className="ml-auto flex flex-wrap items-center gap-1">
          <Link
            to="/privacy"
            target="_blank"
            className="rounded-sm px-1 text-accent-fg underline-offset-4 hover:underline"
          >
            What&apos;s monitored
            <span className="sr-only"> (opens in a new tab)</span>
          </Link>
          {cameraOn && (
            <Button
              size="sm"
              variant="ghost"
              icon={CameraOff}
              onClick={() => {
                monitor?.stopCamera();
              }}
            >
              Turn camera off
            </Button>
          )}
          {mode === 'webcam' &&
            (state.camera === 'off' || state.camera === 'unavailable') &&
            state.active && (
              <Button
                size="sm"
                variant="ghost"
                icon={Camera}
                onClick={() => {
                  void monitor?.startCamera();
                }}
              >
                Turn camera on
              </Button>
            )}
          {state.active && (
            <Button
              size="sm"
              variant="ghost"
              icon={ShieldOff}
              onClick={() => {
                monitor?.stop(true);
              }}
            >
              Stop monitoring
            </Button>
          )}
        </span>
      </div>
      {state.active && state.fullscreenExited && (
        <Notice
          tone="warning"
          title="You left fullscreen"
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                size="sm"
                icon={Maximize}
                onClick={() => {
                  void monitor?.requestFullscreen();
                }}
              >
                Return to fullscreen
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  monitor?.dismissFullscreenWarning();
                }}
              >
                Continue without
              </Button>
            </div>
          }
        >
          This was noted in your practice integrity log. Fullscreen only hides other windows; it
          never blocked other apps. Your exam and timer are unaffected.
        </Notice>
      )}
    </div>
  );
}
