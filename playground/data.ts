import type { ComboboxOption } from '../src';

export const ACCOUNTS = [
  { id: 'sav', name: 'Savings', number: '•••• 4821', balance: 182450.75 },
  { id: 'cur', name: 'Current', number: '•••• 1096', balance: 54210.0 },
];

const PAYEES: ComboboxOption[] = [
  { id: 'p1', label: 'Asha Mehta', description: 'HDFC •••• 2231' },
  { id: 'p2', label: 'Arjun Rao', description: 'SBI •••• 9012' },
  { id: 'p3', label: 'Electricity Board (MSEDCL)', description: 'Biller' },
  { id: 'p4', label: 'Greenfield Apartments', description: 'Rent · ICICI •••• 7740' },
  { id: 'p5', label: 'Meera Iyer', description: 'Axis •••• 5512' },
  { id: 'p6', label: 'Mobile — Airtel', description: 'Biller' },
];

/** Simulates a payee-search API with variable latency, so out-of-order responses actually happen. */
export function searchPayees(query: string): Promise<ComboboxOption[]> {
  const q = query.toLowerCase();
  const results = PAYEES.filter((p) => p.label.toLowerCase().includes(q));
  return new Promise((resolve) => setTimeout(() => resolve(results), 150 + Math.random() * 350));
}
