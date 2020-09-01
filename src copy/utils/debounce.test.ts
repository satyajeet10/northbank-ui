import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from './debounce';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('debounce', () => {
  it('calls once with the latest args', () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);
    d(1); d(2); d(3);
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledExactlyOnceWith(3);
  });
  it('supports leading edge and cancel', () => {
    const fn = vi.fn();
    const d = debounce(fn, 100, { leading: true });
    d('a'); d('b');
    expect(fn).toHaveBeenCalledExactlyOnceWith('a');
    d.cancel();
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
