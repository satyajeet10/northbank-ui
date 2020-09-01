# northbank-ui

Accessible React components for banking apps: the interaction patterns every product team rebuilds
(tabs, combobox, dialog, OTP input, virtualized lists) built once to WAI-ARIA standards and tested with
Testing Library.

```tsx
import { Tabs } from '@satyajeet10/northbank-ui';

<Tabs
  label="Products"
  items={[
    { id: 'accounts', label: 'Accounts', panel: <Accounts /> },
    { id: 'loans', label: 'Loans', panel: <Loans /> },
  ]}
/>
```

## Components
| Component | Status | Accessibility |
|---|---|---|
| `Tabs` | ✅ | Roving tabindex, arrow/Home/End keys, disabled tabs skipped |
| `useDebouncedValue`, `debounce` | ✅ | — |
| `Combobox` (autocomplete) | Planned | `aria-activedescendant`, async results with race handling |
| `Dialog` | Planned | Focus trap, return focus, Escape, inert background |
| `OtpInput` | Planned | Paste, backspace, arrow keys, `autocomplete="one-time-code"` |
| `Toast` | Planned | `aria-live` region, pause on hover/focus |
| `VirtualList` | Planned | Fixed and variable heights |
| `TreeView` | Planned | Expand/collapse, typeahead |

## Develop
```bash
npm install
npm test          # React Testing Library + user-event
npm run typecheck
```
