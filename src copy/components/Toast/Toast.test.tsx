import { describe, it, expect, afterEach, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { ToastProvider, useToast } from './Toast';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function Trigger() {
  const { show } = useToast();
  return <button onClick={() => show({ title: 'Payment sent', tone: 'success', durationMs: 1000 })}>Pay</button>;
}

describe('Toast', () => {
  it('announces in a live region and auto-dismisses', () => {
    vi.useFakeTimers();
    render(<ToastProvider><Trigger /></ToastProvider>);
    act(() => screen.getByRole('button', { name: 'Pay' }).click());
    expect(screen.getByRole('status')).toHaveTextContent('Payment sent');
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole('status')).not.toHaveTextContent('Payment sent');
  });

  it('throws a clear error outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Trigger />)).toThrow(/inside <ToastProvider>/);
  });
});
