import type { ComponentProps } from 'react';

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
}

/** Button with variants and a loading state that keeps its width and announces busy state. */
export function Button({ variant = 'primary', loading = false, className, disabled, children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={['nb-btn', `nb-btn-${variant}`, className].filter(Boolean).join(' ')}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="nb-spinner" aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}
