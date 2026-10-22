import { ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { MAX_STRIKES } from '@/domain/exam/proctor';
import type { ProctorState } from './engine';
import { CameraPreview, MicLevel } from './ProctorMedia';

/** Always-visible proctor status during a proctored exam, like the self-view in a real one. */
export function ProctorPanel({
  state,
  running,
  strikeCount,
}: {
  state: ProctorState;
  running: boolean;
  strikeCount: number;
}) {
  return (
    <div
      role="status"
      aria-label="AI proctor"
      className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-surface px-3 py-2 text-xs text-fg-muted"
    >
      <CameraPreview stream={state.stream} className="h-14 w-20 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex flex-wrap items-center gap-2 font-medium text-fg">
          <ShieldCheck size={14} aria-hidden="true" className="text-accent-fg" />
          {running ? 'AI proctor on: camera and microphone' : 'AI proctor paused'}
          <span aria-hidden="true" className="size-2 rounded-full bg-danger" />
          <Badge tone={strikeCount === 0 ? 'neutral' : 'warning'}>
            Warnings {Math.min(strikeCount, MAX_STRIKES - 1)} of {MAX_STRIKES - 1}
          </Badge>
        </span>
        <span>
          Watching your face, eyes, mouth, room and screen. Nothing is recorded or uploaded.
        </span>
        <MicLevel db={state.levelDb} className="max-w-48" />
      </div>
    </div>
  );
}
