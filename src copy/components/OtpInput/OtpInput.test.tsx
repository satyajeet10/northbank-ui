import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { OtpInput } from './OtpInput';

afterEach(cleanup);

function Harness({ onComplete }: { onComplete: (v: string) => void }) {
  const [value, setValue] = useState('');
  return <OtpInput length={4} value={value} onChange={setValue} onComplete={onComplete} />;
}

describe('OtpInput', () => {
  it('advances focus as digits are typed and reports completion', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);
    await user.click(screen.getByLabelText('Digit 1 of 4'));
    await user.keyboard('1234');
    expect(onComplete).toHaveBeenCalledWith('1234');
    expect(screen.getByLabelText('Digit 4 of 4')).toHaveFocus();
  });

  it('ignores non-digits', async () => {
    const user = userEvent.setup();
    render(<Harness onComplete={() => {}} />);
    await user.click(screen.getByLabelText('Digit 1 of 4'));
    await user.keyboard('a');
    expect(screen.getByLabelText('Digit 1 of 4')).toHaveValue('');
  });

  it('fills every box from a paste', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);
    await user.click(screen.getByLabelText('Digit 1 of 4'));
    await user.paste('98-76');
    expect(onComplete).toHaveBeenCalledWith('9876');
  });

  it('backspace on an empty box moves back and clears the previous digit', async () => {
    const user = userEvent.setup();
    render(<Harness onComplete={() => {}} />);
    await user.click(screen.getByLabelText('Digit 1 of 4'));
    await user.keyboard('12{Backspace}'); // focus sits on empty box 3; one press deletes digit 2
    expect(screen.getByLabelText('Digit 2 of 4')).toHaveValue('');
    expect(screen.getByLabelText('Digit 2 of 4')).toHaveFocus();
  });
});
