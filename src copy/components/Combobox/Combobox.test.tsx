import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Combobox, type ComboboxOption } from './Combobox';

afterEach(cleanup);

const PAYEES: ComboboxOption[] = [
  { id: '1', label: 'Asha Mehta' },
  { id: '2', label: 'Arjun Rao' },
  { id: '3', label: 'Meera Iyer' },
];
const search = (q: string) => Promise.resolve(PAYEES.filter((p) => p.label.toLowerCase().includes(q.toLowerCase())));

describe('Combobox', () => {
  it('shows matching options and selects with the keyboard', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Combobox label="To" loadOptions={search} onSelect={onSelect} debounceMs={0} />);
    const input = screen.getByRole('combobox', { name: 'To' });
    await user.type(input, 'ar');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1));
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant', screen.getByRole('option').id);
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith(PAYEES[1]);
    expect(input).toHaveValue('Arjun Rao');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('ignores a slow response that arrives after a newer one', async () => {
    const user = userEvent.setup();
    let resolveSlow!: (v: ComboboxOption[]) => void;
    const loadOptions = vi.fn((q: string) =>
      q === 'a' ? new Promise<ComboboxOption[]>((r) => (resolveSlow = r)) : search(q),
    );
    render(<Combobox label="To" loadOptions={loadOptions} onSelect={() => {}} debounceMs={0} />);
    const input = screen.getByRole('combobox', { name: 'To' });
    await user.type(input, 'a');            // slow request starts
    await user.type(input, 'sha');          // newer request for "asha" resolves first
    await waitFor(() => expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Asha Mehta']));
    resolveSlow(PAYEES);                    // stale response lands late
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Asha Mehta']);
  });

  it('says when nothing matches', async () => {
    const user = userEvent.setup();
    render(<Combobox label="To" loadOptions={search} onSelect={() => {}} debounceMs={0} />);
    await user.type(screen.getByRole('combobox'), 'zzz');
    await waitFor(() => expect(screen.getByText('No matches')).toBeInTheDocument());
  });
});
