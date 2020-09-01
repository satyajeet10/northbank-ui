import { useState } from 'react';
import { Button, Combobox, Dialog, OtpInput, Tabs, useToast, type ComboboxOption } from '../src';
import { ACCOUNTS, searchPayees } from './data';

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

interface Payment { id: string; payee: string; amount: number; from: string; at: Date }

export function App() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [balances, setBalances] = useState(() => Object.fromEntries(ACCOUNTS.map((a) => [a.id, a.balance])));

  return (
    <div className="shell">
      <header className="topbar">
        <span className="brand">Northbank</span>
        <span className="who">Demo Customer</span>
      </header>
      <main className="content">
        <h1>Payments</h1>
        <Tabs
          label="Payments sections"
          items={[
            {
              id: 'pay',
              label: 'Pay someone',
              panel: (
                <PayForm
                  balances={balances}
                  onPaid={(p) => {
                    setPayments((all) => [p, ...all]);
                    const acc = ACCOUNTS.find((a) => a.name === p.from)!;
                    setBalances((b) => ({ ...b, [acc.id]: (b[acc.id] ?? 0) - p.amount }));
                  }}
                />
              ),
            },
            {
              id: 'accounts',
              label: 'Accounts',
              panel: (
                <ul className="accounts" role="list">
                  {ACCOUNTS.map((a) => (
                    <li key={a.id} className="card">
                      <span className="muted">{a.name} {a.number}</span>
                      <strong>{inr.format(balances[a.id] ?? 0)}</strong>
                    </li>
                  ))}
                </ul>
              ),
            },
            {
              id: 'activity',
              label: `Activity${payments.length ? ` (${payments.length})` : ''}`,
              panel: payments.length ? (
                <ul className="activity" role="list">
                  {payments.map((p) => (
                    <li key={p.id}>
                      <span>{p.payee}<small>from {p.from} · {p.at.toLocaleTimeString('en-IN')}</small></span>
                      <strong>−{inr.format(p.amount)}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No payments yet in this session.</p>
              ),
            },
            { id: 'cards', label: 'Cards', panel: null, disabled: true },
          ]}
        />
      </main>
    </div>
  );
}

function PayForm({ balances, onPaid }: { balances: Record<string, number>; onPaid: (p: Payment) => void }) {
  const toast = useToast();
  const [from, setFrom] = useState(ACCOUNTS[0]!.id);
  const [payee, setPayee] = useState<ComboboxOption | null>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const account = ACCOUNTS.find((a) => a.id === from)!;
  const value = Number(amount);

  const review = () => {
    if (!payee) return setError('Choose who to pay.');
    if (!(value > 0)) return setError('Enter an amount greater than zero.');
    if (value > (balances[from] ?? 0)) return setError(`That's more than the ${inr.format(balances[from] ?? 0)} available.`);
    setError(null);
    setCode('');
    setReviewing(true);
  };

  const confirm = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700)); // simulated API call
    setSubmitting(false);
    setReviewing(false);
    onPaid({ id: crypto.randomUUID(), payee: payee!.label, amount: value, from: account.name, at: new Date() });
    toast.show({ title: 'Payment sent', description: `${inr.format(value)} to ${payee!.label}`, tone: 'success' });
    setAmount('');
  };

  return (
    <div className="pay">
      <div className="field">
        <label className="nb-label" htmlFor="from">From</label>
        <select id="from" className="nb-input" value={from} onChange={(e) => setFrom(e.target.value)}>
          {ACCOUNTS.map((a) => (
            <option key={a.id} value={a.id}>{a.name} {a.number} · {inr.format(balances[a.id] ?? 0)}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <Combobox label="To" placeholder="Search payees and billers" loadOptions={searchPayees} onSelect={setPayee} />
      </div>
      <div className="field">
        <label className="nb-label" htmlFor="amount">Amount (₹)</label>
        <input id="amount" className="nb-input" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      {error && <p role="alert" className="error">{error}</p>}
      <Button onClick={review}>Review payment</Button>

      <Dialog
        open={reviewing}
        onClose={() => setReviewing(false)}
        title="Confirm payment"
        description="Enter the 6-digit code sent to your registered mobile (demo: any 6 digits)."
        footer={
          <>
            <Button variant="ghost" onClick={() => setReviewing(false)}>Cancel</Button>
            <Button onClick={confirm} loading={submitting} disabled={code.length < 6}>Pay {inr.format(value || 0)}</Button>
          </>
        }
      >
        <dl className="summary">
          <dt>To</dt><dd>{payee?.label}</dd>
          <dt>From</dt><dd>{account.name} {account.number}</dd>
          <dt>Amount</dt><dd>{inr.format(value || 0)}</dd>
        </dl>
        <OtpInput value={code} onChange={setCode} label="One-time code" />
      </Dialog>
    </div>
  );
}
