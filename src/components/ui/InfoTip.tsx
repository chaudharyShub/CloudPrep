import { Info } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface InfoTipProps {
  /** The term the tip explains; the button is named "About {label}". */
  label: string;
  children: ReactNode;
  /** Which edge of the button the panel lines up with. */
  align?: 'start' | 'end';
}

/** The smallest gap between the panel and the screen edge, in pixels. */
const SCREEN_GAP = 16;

/**
 * An "i" button that shows a short explanation (a toggletip, D-058). It opens on click or
 * tap, so it works on phones and with a keyboard, and closes on Escape or a click outside.
 */
export function InfoTip({ label, children, align = 'start' }: InfoTipProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Fixed to the screen, so it can never widen the page on a phone; null until measured.
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    const button = buttonRef.current;
    const panel = panelRef.current;
    if (!open || !button || !panel) {
      setPosition(null);
      return;
    }
    const place = () => {
      const anchor = button.getBoundingClientRect();
      const width = panel.offsetWidth;
      const screenWidth = document.documentElement.clientWidth;
      const wanted = align === 'end' ? anchor.right - width : anchor.left;
      const left = Math.max(SCREEN_GAP, Math.min(wanted, screenWidth - SCREEN_GAP - width));
      setPosition({ top: anchor.bottom + 8, left });
    };
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open, align]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && rootRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="inline-flex shrink-0">
      <button
        ref={buttonRef}
        type="button"
        aria-label={`About ${label}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          setOpen((value) => !value);
        }}
        className={cn(
          'inline-flex size-8 items-center justify-center rounded-full transition-colors',
          open
            ? 'bg-highlight text-on-highlight'
            : 'text-fg-subtle hover:bg-surface-2 hover:text-accent-fg',
        )}
      >
        <Info size={18} strokeWidth={2} aria-hidden="true" />
      </button>
      <div
        ref={panelRef}
        id={panelId}
        hidden={!open}
        style={
          position
            ? { top: position.top, left: position.left }
            : { top: 0, left: 0, visibility: 'hidden' }
        }
        className={cn(
          'fixed z-20 w-72 max-w-[calc(100vw-2rem)] rounded-md border border-border bg-surface p-4 text-left text-sm leading-relaxed font-normal text-fg shadow-overlay',
        )}
      >
        {children}
      </div>
    </div>
  );
}
