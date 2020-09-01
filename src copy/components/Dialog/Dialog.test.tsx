import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Dialog } from './Dialog';

afterEach(cleanup);

describe('Dialog', () => {
  it('opens with an accessible name and description', () => {
    render(<Dialog open onClose={() => {}} title="Confirm payment" description="Check the details" />);
    const dialog = screen.getByRole('dialog', { name: 'Confirm payment' });
    expect(dialog).toHaveAccessibleDescription('Check the details');
  });

  it('asks the parent to close on Escape (cancel) and on the close button', () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose} title="Confirm" />);
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('returns focus to the element that opened it', () => {
    const { rerender } = render(
      <>
        <button>Open</button>
        <Dialog open={false} onClose={() => {}} title="Confirm" />
      </>,
    );
    const opener = screen.getByRole('button', { name: 'Open' });
    opener.focus();
    rerender(<><button>Open</button><Dialog open onClose={() => {}} title="Confirm" /></>);
    rerender(<><button>Open</button><Dialog open={false} onClose={() => {}} title="Confirm" /></>);
    expect(opener).toHaveFocus();
  });
});
