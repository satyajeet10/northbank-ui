import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react';

export interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  label?: string;
}

/** One-time-code input: auto-advance, backspace to previous, arrow keys, and paste of the whole code. */
export function OtpInput({ length = 6, value, onChange, onComplete, label = 'Verification code' }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const commit = (next: string[]) => {
    const code = next.join('').slice(0, length);
    onChange(code);
    if (code.length === length && !next.includes('')) onComplete?.(code);
  };

  const setDigit = (index: number, digit: string) => {
    const next = [...digits];
    next[index] = digit;
    commit(next);
    if (digit && index < length - 1) refs.current[index + 1]?.focus();
  };

  const onKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      e.preventDefault();
      setDigit(index - 1, '');
      refs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    const next = Array.from({ length }, (_, i) => pasted[i] ?? '');
    commit(next);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="nb-otp" role="group" aria-label={label}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="nb-otp-digit"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          aria-label={`Digit ${i + 1} of ${length}`}
          value={d}
          onChange={(e) => setDigit(i, e.target.value.replace(/\D/g, '').slice(-1))}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}
