import { useEffect, useRef } from 'react';
import { Mic } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/cn';

/** Live, mirrored camera preview. The stream is only displayed, never recorded. */
export function CameraPreview({
  stream,
  className,
}: {
  stream: MediaStream | null;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.srcObject = stream;
    if (stream) void video.play().catch(() => undefined);
    return () => {
      video.srcObject = null;
    };
  }, [stream]);
  return (
    <video
      ref={ref}
      muted
      playsInline
      aria-label="Your camera (not recorded)"
      className={cn(
        '-scale-x-100 rounded-md border border-border bg-surface-2 object-cover',
        className,
      )}
    />
  );
}

/** Microphone loudness from −80 dB (silent) to 0 dB. */
export function MicLevel({ db, className }: { db: number | null; className?: string }) {
  const value = db === null ? 0 : Math.min(100, Math.max(0, ((db + 80) / 80) * 100));
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Mic size={14} aria-hidden="true" className="shrink-0 text-fg-subtle" />
      <ProgressBar
        value={value}
        label="Microphone level"
        valueText={db === null ? 'No signal' : `${Math.round(db)} dB`}
        tone={value > 60 ? 'warning' : 'success'}
        className="flex-1"
      />
    </div>
  );
}
