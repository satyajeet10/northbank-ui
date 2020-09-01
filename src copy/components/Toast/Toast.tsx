import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: 'success' | 'error' | 'info';
  durationMs?: number;
}
interface ToastItem extends Required<Pick<ToastOptions, 'title' | 'tone' | 'durationMs'>> {
  id: number;
  description?: string;
}

const ToastContext = createContext<((t: ToastOptions) => void) | null>(null);

/** Hook for showing toasts from anywhere inside <ToastProvider>. */
export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error('useToast must be used inside <ToastProvider>');
  return { show };
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const show = useCallback((t: ToastOptions) => {
    const id = ++nextId.current;
    setToasts((all) => [...all, { id, title: t.title, description: t.description, tone: t.tone ?? 'info', durationMs: t.durationMs ?? 5000 }]);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {/* A persistent live region: screen readers announce toasts as they're added. */}
      <div className="nb-toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Auto-dismisses, but pauses while hovered or focused so people can read it. */
function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(onDismiss, toast.durationMs);
    return () => clearTimeout(timer);
  }, [paused, toast.durationMs, onDismiss]);

  return (
    <div
      className={`nb-toast nb-toast-${toast.tone}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div>
        <strong>{toast.title}</strong>
        {toast.description && <p>{toast.description}</p>}
      </div>
      <button type="button" className="nb-icon-btn" aria-label="Dismiss notification" onClick={onDismiss}>×</button>
    </div>
  );
}
