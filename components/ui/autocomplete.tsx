"use client";

import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/cn";

import { Chip } from "./chip";

export interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
}

interface BaseProps {
  options: AutocompleteOption[];
  placeholder?: string;
  /** Búsqueda remota (debounced 250ms). Si no se pasa, filtra en local. */
  onSearch?: (query: string) => void;
  loading?: boolean;
  disabled?: boolean;
  emptyMessage?: string;
  className?: string;
}

interface SingleProps extends BaseProps {
  multiple?: false;
  value: string | null;
  onChange: (value: string | null) => void;
}

interface MultiProps extends BaseProps {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
}

type AutocompleteProps = SingleProps | MultiProps;

const DEBOUNCE_MS = 250;

export function Autocomplete(props: AutocompleteProps) {
  const {
    options,
    placeholder = "Buscar…",
    onSearch,
    loading,
    disabled,
    emptyMessage = "Sin resultados",
    className,
  } = props;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listboxId = useId();

  const selectedValues = useMemo(
    () => (props.multiple ? props.value : props.value ? [props.value] : []),
    [props.multiple, props.value],
  );

  const visible = useMemo(() => {
    if (onSearch) return options; // el servidor ya filtró
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(q) || option.description?.toLowerCase().includes(q),
    );
  }, [options, query, onSearch]);

  useEffect(() => {
    setHighlighted(0);
  }, [visible.length, open]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const emitSearch = useCallback(
    (value: string) => {
      if (!onSearch) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onSearch(value), DEBOUNCE_MS);
    },
    [onSearch],
  );

  const toggleOption = (optionValue: string) => {
    if (props.multiple) {
      const next = props.value.includes(optionValue)
        ? props.value.filter((item) => item !== optionValue)
        : [...props.value, optionValue];
      props.onChange(next);
      setQuery("");
      inputRef.current?.focus();
    } else {
      props.onChange(props.value === optionValue ? null : optionValue);
      setQuery("");
      setOpen(false);
    }
  };

  const removeValue = (optionValue: string) => {
    if (props.multiple) {
      props.onChange(props.value.filter((item) => item !== optionValue));
    } else {
      props.onChange(null);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      setOpen(true);
      event.preventDefault();
      return;
    }
    if (event.key === "ArrowDown") {
      setHighlighted((index) => Math.min(index + 1, visible.length - 1));
      event.preventDefault();
    } else if (event.key === "ArrowUp") {
      setHighlighted((index) => Math.max(index - 1, 0));
      event.preventDefault();
    } else if (event.key === "Enter") {
      const option = visible[highlighted];
      if (option) toggleOption(option.value);
      event.preventDefault();
    } else if (
      event.key === "Backspace" &&
      !query &&
      props.multiple &&
      props.value.length > 0
    ) {
      removeValue(props.value[props.value.length - 1]);
    }
  };

  const selectedOptions = selectedValues
    .map((value) => options.find((option) => option.value === value))
    .filter((option): option is AutocompleteOption => Boolean(option));

  const singleLabel = !props.multiple && props.value ? selectedOptions[0]?.label : null;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div
        onClick={() => {
          if (disabled) return;
          setOpen(true);
          inputRef.current?.focus();
        }}
        className={cn(
          "flex min-h-9 w-full cursor-text flex-wrap items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm shadow-sm transition-colors focus-within:border-primary",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <Search size={13} strokeWidth={1.5} className="shrink-0 text-zinc-400" />
        {props.multiple
          ? selectedOptions.map((option) => (
              <Chip key={option.value} tone="primary" onRemove={() => removeValue(option.value)}>
                {option.label}
              </Chip>
            ))
          : null}
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          value={query}
          disabled={disabled}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            emitSearch(event.target.value);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={props.multiple ? (selectedOptions.length ? "" : placeholder) : (singleLabel ?? placeholder)}
          className={cn(
            "min-w-16 flex-1 bg-transparent text-zinc-900 outline-none placeholder:text-zinc-400",
            !props.multiple && singleLabel && !query && "placeholder:text-zinc-900",
          )}
        />
        {loading ? (
          <Loader2 size={13} className="shrink-0 animate-spin text-zinc-400" />
        ) : (
          <ChevronsUpDown size={13} strokeWidth={1.5} className="shrink-0 text-zinc-400" />
        )}
      </div>

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1.5 max-h-64 w-full overflow-y-auto rounded-2xl border border-zinc-200 bg-white py-1 shadow-pop"
        >
          {visible.map((option, index) => {
            const selected = selectedValues.includes(option.value);
            return (
              <li key={option.value} role="option" aria-selected={selected}>
                <button
                  onClick={() => toggleOption(option.value)}
                  onMouseEnter={() => setHighlighted(index)}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors",
                    index === highlighted ? "bg-zinc-50" : "",
                    selected ? "font-medium text-zinc-900" : "text-zinc-600",
                  )}
                >
                  {option.icon ? <span className="shrink-0 text-zinc-400">{option.icon}</span> : null}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{option.label}</span>
                    {option.description ? (
                      <span className="block truncate text-xs text-zinc-400">
                        {option.description}
                      </span>
                    ) : null}
                  </span>
                  {selected ? (
                    <Check size={14} strokeWidth={2} className="shrink-0 text-primary" />
                  ) : null}
                </button>
              </li>
            );
          })}
          {visible.length === 0 ? (
            <li className="px-3 py-6 text-center text-xs text-zinc-400">
              {loading ? "Buscando…" : emptyMessage}
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
