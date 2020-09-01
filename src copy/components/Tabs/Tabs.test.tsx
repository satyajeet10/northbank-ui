import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from './Tabs';

afterEach(cleanup);

const items = [
  { id: 'accounts', label: 'Accounts', panel: 'Accounts panel' },
  { id: 'cards', label: 'Cards', panel: 'Cards panel', disabled: true },
  { id: 'loans', label: 'Loans', panel: 'Loans panel' },
];

describe('Tabs', () => {
  it('shows the first enabled tab and links tabs to panels', () => {
    render(<Tabs items={items} label="Products" />);
    const tab = screen.getByRole('tab', { name: 'Accounts' });
    expect(tab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', tab.id);
    expect(screen.getByRole('tabpanel').textContent).toBe('Accounts panel');
  });

  it('moves with arrow keys, skipping disabled tabs, and wraps around', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Tabs items={items} label="Products" onChange={onChange} />);
    await user.tab();
    expect(screen.getByRole('tab', { name: 'Accounts' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Loans' })).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith('loans');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Accounts' })).toHaveFocus();
  });

  it('keeps only the active tab in the tab order (roving tabindex)', () => {
    render(<Tabs items={items} label="Products" defaultTab="loans" />);
    expect(screen.getByRole('tab', { name: 'Loans' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Accounts' })).toHaveAttribute('tabindex', '-1');
  });

  it('supports Home and End', async () => {
    const user = userEvent.setup();
    render(<Tabs items={items} label="Products" />);
    await user.tab();
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Loans' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Accounts' })).toHaveFocus();
  });
});
