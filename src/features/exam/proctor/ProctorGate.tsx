import { Maximize, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Notice } from '@/components/ui/Notice';
import { ERROR_TEXT, PHASE_TEXT } from './copy';
import type { ProctorState } from './engine';
import { CameraPreview } from './ProctorMedia';

/**
 * Replaces the questions while the proctor can't watch: after a reload, or outside
 * fullscreen. The timer keeps running, as in a real exam.
 */
export function ProctorGate({
  needsResume,
  resuming,
  state,
  onResume,
  onFullscreen,
}: {
  needsResume: boolean;
  resuming: boolean;
  state: ProctorState;
  onResume: () => void;
  onFullscreen: () => void;
}) {
  if (needsResume) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <Card>
          <CardHeader
            as="h1"
            title="Restart the AI proctor"
            description="The exam page was reloaded or reopened, so the proctor stopped watching. This counts as a violation. The timer kept running."
          />
          <CardBody className="flex flex-col gap-4">
            {state.stream && <CameraPreview stream={state.stream} className="h-40 w-56" />}
            {resuming && PHASE_TEXT[state.phase] && (
              <p role="status" className="text-sm text-fg-muted">
                {PHASE_TEXT[state.phase]}
              </p>
            )}
            {state.error && <Notice tone="danger">{ERROR_TEXT[state.error]}</Notice>}
            <Button icon={RotateCcw} onClick={onResume} disabled={resuming} className="self-start">
              {resuming ? 'Restarting…' : 'Restart proctor and continue'}
            </Button>
            <p className="text-xs text-fg-subtle">
              This asks for the camera and microphone again, returns to fullscreen and re-checks
              your position for 2 seconds: look at the screen.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <Card>
        <CardHeader
          as="h1"
          title="Return to fullscreen"
          description="A proctored exam must stay in fullscreen. Leaving it counted as a violation. The timer keeps running."
        />
        <CardBody>
          <Button icon={Maximize} onClick={onFullscreen}>
            Return to fullscreen
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
