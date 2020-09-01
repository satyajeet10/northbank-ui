import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

export interface ComboboxOption {
  id: string;
  label: string;
  description?: string;
}

export interface ComboboxProps {
  label: string;
  loadOptions: (query: string) => Promise<ComboboxOption[]>;
  onSelect: (option: ComboboxOption) => void;
  placeholder?: string;
  debounceMs?: number;
}

/**
 * Async autocomplete (WAI-ARIA combobox pattern).
 * - Debounced queries; responses that arrive out of order are ignored (no flicker of stale results)
 * - Focus stays in the input; the active option is conveyed with aria-activedescendant
 */
export function Combobox({ label, loadOptions, onSelect, placeholder, debounceMs = 250 }: ComboboxProps) {
  const id = useId();
  const listId = `${id}-list`;
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<ComboboxOption[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const debounced = useDebouncedValue(query, debounceMs);
  const latestRequest = useRef(0);

  useEffect(() => {
    if (!debounced.trim()) {
      setOptions([]);
      setLoading(false);
      return;
    }
    const requestId = ++latestRequest.current;
    setLoading(true);
    loadOptions(debounced).then(
      (result) => {
        if (requestId !== latestRequest.current) return; // a newer query is in flight
        setOptions(result);
        setActive(-1); // nothing highlighted until the user arrows into the list
        setLoading(false);
      },
      () => {
        if (requestId === latestRequest.current) setLoading(false);
      },
    );
  }, [debounced, loadOptions]);

  const choose = (option: ComboboxOption) => {
    onSelect(option);
    setQuery(option.label);
    setOpen(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && open && options[active]) {
      e.preventDefault();
      choose(options[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showList = open && query.trim().length > 0;

  return (
    <div className="nb-combobox">
      <label htmlFor={id} className="nb-label">{label}</label>
      <div className="nb-combobox-field">
        <input
          id={id}
          className="nb-input"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && active >= 0 ? `${id}-opt-${active}` : undefined}
          autoComplete="off"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          onBlur={() => setOpen(false)}
        />
        {loading && <span className="nb-spinner nb-combobox-spinner" aria-hidden="true" />}
      </div>
      {showList && (
        <ul id={listId} role="listbox" aria-label={label} className="nb-listbox">
          {options.length === 0 && !loading && <li className="nb-listbox-empty">No matches</li>}
          {options.map((o, i) => (
            <li
              key={o.id}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              className="nb-option"
              onMouseDown={(e) => e.preventDefault()} // keep focus in the input
              onClick={() => choose(o)}
              onMouseEnter={() => setActive(i)}
            >
              <span>{o.label}</span>
              {o.description && <small>{o.description}</small>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
