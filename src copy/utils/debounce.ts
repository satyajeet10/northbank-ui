export interface Debounced<A extends unknown[]> {
  (...args: A): void;
  cancel(): void;
}

/** Delays `fn` until `wait` ms pass without another call. Optional leading-edge call. */
export function debounce<A extends unknown[]>(fn: (...args: A) => void, wait: number, { leading = false } = {}): Debounced<A> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: A) => {
    const callNow = leading && timer === null;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (!leading) fn(...args);
    }, wait);
    if (callNow) fn(...args);
  };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  return debounced;
}
