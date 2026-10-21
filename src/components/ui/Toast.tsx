import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { CircleAlert, CircleCheck, Info, TriangleAlert, X, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ToastTone = 'info' | 'success' | 'warning' | 'danger';

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** Milliseconds before auto-dismiss. `null` keeps it until dismissed. Default 5000. */
  durationMs?: number | null;
}

interface ToastItem {
  id: number;
  title: string;
  description: string | undefined;
  tone: ToastTone;
  durationMs: number | null;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => number;
  dismissToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_VISIBLE = 3;

const toneIcon: Record<ToastTone, LucideIcon> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
};

const toneIconClass: Record<ToastTone, string> = {
  info: 'text-accent-fg',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    const id = nextId.current++;
    const toast: ToastItem = {
      id,
      title: options.title,
      description: options.description,
      tone: options.tone ?? 'info',
      durationMs: options.durationMs === undefined ? 5000 : options.durationMs,
    };
    setToasts((current) => [...current, toast].slice(-MAX_VISIBLE));
    return id;
  }, []);

  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

  return (
    <ToastContext value={value}>
      {children}
      <section
        aria-label="Notifications"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </section>
    </ToastContext>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  const Icon = toneIcon[toast.tone];

  useEffect(() => {
    if (toast.durationMs === null) return;
    const timer = window.setTimeout(() => {
      onDismiss(toast.id);
    }, toast.durationMs);
    return () => {
      window.clearTimeout(timer);
    };
  }, [toast.id, toast.durationMs, onDismiss]);

  return (
    <div
      role="status"
      className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-border-strong bg-surface-2 p-4 shadow-overlay"
    >
      <Icon
        size={20}
        strokeWidth={1.75}
        aria-hidden="true"
        className={cn('mt-px shrink-0', toneIconClass[toast.tone])}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-fg">{toast.title}</p>
        {toast.description && <p className="mt-1 text-sm text-fg-muted">{toast.description}</p>}
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => {
          onDismiss(toast.id);
        }}
        className="-m-1 rounded-sm p-1 text-fg-muted transition-colors hover:bg-surface-3 hover:text-fg"
      >
        <X size={16} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook belongs with its provider
export function useToast(): ToastContextValue {
  const context = use(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>.');
  return context;
}
