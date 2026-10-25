import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type Tone = 'success' | 'error' | 'info';
interface Toast { id: number; tone: Tone; message: string }

const ToastContext = createContext<((message: string, tone?: Tone) => void) | null>(null);

const toneClass: Record<Tone, string> = {
  success: 'border-ok/30 bg-white text-ink [&_.dot]:bg-ok',
  error: 'border-danger/30 bg-white text-ink [&_.dot]:bg-danger',
  info: 'border-line bg-white text-ink [&_.dot]:bg-brand',
};

// Small notification stack in the corner. Toasts dismiss themselves after four seconds.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, tone: Tone = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, tone, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const value = useMemo(() => notify, [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:items-end">
        {toasts.map((t) => (
          <div key={t.id} role="status" className={`pointer-events-auto flex max-w-sm items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${toneClass[t.tone]}`}>
            <span className="dot size-2 shrink-0 rounded-full" />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const notify = useContext(ToastContext);
  if (!notify) throw new Error('useToast must be used inside ToastProvider');
  return notify;
}
