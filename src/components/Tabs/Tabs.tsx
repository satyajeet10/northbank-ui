import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: ReactNode;
  panel: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  label: string;
  defaultTab?: string;
  onChange?: (id: string) => void;
}

/**
 * WAI-ARIA tabs with roving tabindex: Tab moves focus into the list once,
 * arrow keys move between tabs, Home/End jump to the ends, disabled tabs are skipped.
 */
export function Tabs({ items, label, defaultTab, onChange }: TabsProps) {
  const baseId = useId();
  const enabled = items.filter((i) => !i.disabled);
  const [active, setActive] = useState(defaultTab ?? enabled[0]?.id);
  const refs = useRef(new Map<string, HTMLButtonElement>());

  const select = (id: string) => {
    setActive(id);
    refs.current.get(id)?.focus();
    onChange?.(id);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const index = enabled.findIndex((i) => i.id === active);
    const next = {
      ArrowRight: enabled[(index + 1) % enabled.length],
      ArrowLeft: enabled[(index - 1 + enabled.length) % enabled.length],
      Home: enabled[0],
      End: enabled[enabled.length - 1],
    }[e.key];
    if (next) {
      e.preventDefault();
      select(next.id);
    }
  };

  return (
    <div className="nb-tabs">
      <div role="tablist" aria-label={label} onKeyDown={onKeyDown}>
        {items.map((item) => (
          <button
            key={item.id}
            ref={(el) => {
              if (el) refs.current.set(item.id, el);
              else refs.current.delete(item.id);
            }}
            role="tab"
            type="button"
            id={`${baseId}-tab-${item.id}`}
            aria-selected={item.id === active}
            aria-controls={`${baseId}-panel-${item.id}`}
            tabIndex={item.id === active ? 0 : -1}
            disabled={item.disabled}
            onClick={() => select(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${baseId}-panel-${item.id}`}
          aria-labelledby={`${baseId}-tab-${item.id}`}
          hidden={item.id !== active}
          tabIndex={0}
        >
          {item.panel}
        </div>
      ))}
    </div>
  );
}
