import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { IconButton } from './Button';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** `modal` is centred; `drawer` slides in from the left edge (mobile navigation). */
  variant?: 'modal' | 'drawer';
  /** Element to focus when the dialog opens. Defaults to the first focusable element. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Hide the visible title (it is still used as the accessible name). */
  hideTitle?: boolean;
  className?: string;
}

/**
 * Accessible dialog built on the native <dialog> element. `showModal()` gives focus
 * containment and an inert background; we add Esc/backdrop closing and focus return.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  variant = 'modal',
  initialFocusRef,
  hideTitle = false,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
      initialFocusRef?.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
      returnFocusRef.current?.focus();
      returnFocusRef.current = null;
    }
  }, [open, initialFocusRef]);

  // Close if the component unmounts while open, restoring focus.
  useEffect(() => {
    const dialog = ref.current;
    return () => {
      if (dialog?.open) {
        dialog.close();
        returnFocusRef.current?.focus();
      }
    };
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  }

  function handleClick(event: MouseEvent<HTMLDialogElement>) {
    // A click whose target is the <dialog> itself landed on the backdrop.
    if (event.target === event.currentTarget) onClose();
  }

  return (
    // The <dialog> handles Esc and backdrop clicks; its content holds the real controls.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className={cn(
        'border border-border bg-surface p-0 text-fg shadow-overlay',
        variant === 'modal' &&
          'm-auto w-[calc(100%-2rem)] max-w-md rounded-lg backdrop:bg-backdrop',
        variant === 'drawer' &&
          'mr-auto ml-0 h-dvh max-h-dvh w-[min(20rem,calc(100%-3rem))] rounded-none border-y-0 border-l-0',
        className,
      )}
    >
      {open && (
        <div className={cn('flex flex-col', variant === 'drawer' && 'h-full')}>
          <div
            className={cn('flex items-start justify-between gap-4 px-5 pt-5', hideTitle && 'pt-3')}
          >
            <div className="min-w-0">
              <h2
                id={titleId}
                className={cn('font-serif text-xl font-medium', hideTitle && 'sr-only')}
              >
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="mt-1.5 text-sm text-fg-muted">
                  {description}
                </p>
              )}
            </div>
            <IconButton label="Close" icon={X} size="sm" onClick={onClose} className="-mr-2" />
          </div>
          {children && (
            <div className={cn('px-5 pt-4 pb-5', variant === 'drawer' && 'min-h-0 flex-1')}>
              {children}
            </div>
          )}
          {footer && (
            <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
              {footer}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
