import { Link } from 'react-router';
import { Eye, Maximize, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import type { IntegrityMode } from '@/domain/exam/integrity';
import type { IntegrityMonitor, MonitorState } from './monitor';

/**
 * Always-visible status for strict practice, with a way to stop monitoring at any time.
 * Proctored exams use `ProctorPanel` instead.
 */
export function IntegrityBar({
  mode,
  monitor,
  state,
}: {
  mode: IntegrityMode;
  monitor: IntegrityMonitor | null;
  state: MonitorState;
}) {
  if (mode === 'standard' || mode === 'proctored') return null;
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
        <span className="ml-auto flex flex-wrap items-center gap-1">
          <Link
            to="/privacy"
            target="_blank"
            className="rounded-sm px-1 text-accent-fg underline-offset-4 hover:underline"
            aria-label="What's monitored (opens in a new tab)"
          >
            What&apos;s monitored
          </Link>
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
