import { useEffect, useId, useRef, type ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  onClose(): void;
  children: ReactNode;
}

// Accessible dialog: labelled by its title, closes on Escape or backdrop click,
// focuses its first field and returns focus to the trigger when it closes.
export function Modal({ title, description, onClose, children }: Props) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>('input, select, button[type="submit"]')?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      trigger?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-surface p-6 text-ink shadow-2xl sm:max-w-md sm:rounded-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="font-display text-xl font-extrabold tracking-tight">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="-mt-1 -mr-2 rounded-lg p-2 text-muted hover:bg-ink/5">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
