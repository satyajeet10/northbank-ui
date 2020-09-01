import { useEffect, useId, useRef, type ReactNode } from 'react';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
}

/**
 * Modal dialog on the native <dialog> element: showModal() makes the page inert and traps focus,
 * Escape fires 'cancel'. We add return-focus to the opener and close on backdrop click.
 */
export function Dialog({ open, onClose, title, description, children, footer }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      opener.current = document.activeElement as HTMLElement | null;
      el.showModal();
    } else if (!open && el.open) {
      el.close();
      opener.current?.focus();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="nb-dialog"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault(); // let React state drive closing
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose(); // click on the backdrop
      }}
    >
      <div className="nb-dialog-body">
        <header className="nb-dialog-header">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="nb-icon-btn" aria-label="Close" onClick={onClose}>×</button>
        </header>
        {description && <p id={descId} className="nb-dialog-description">{description}</p>}
        {children}
        {footer && <footer className="nb-dialog-footer">{footer}</footer>}
      </div>
    </dialog>
  );
}
