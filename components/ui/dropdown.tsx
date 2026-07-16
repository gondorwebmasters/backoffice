"use client";

import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/cn";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  /** Etiqueta cuando no hay selección; con `clearable` es también la opción de limpiar. */
  placeholder?: string;
  /** Muestra buscador dentro del desplegable (útil con listas largas). */
  searchable?: boolean;
  /** Permite volver a "sin selección" eligiendo el placeholder. */
  clearable?: boolean;
  className?: string;
}

/**
 * Select moderno con el mismo lenguaje que el company switcher del topbar:
 * trigger compacto + popover elevado con búsqueda opcional y check en la
 * opción activa.
 */
export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Seleccionar…",
  searchable = false,
  clearable = false,
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return options;
    return options.filter((option) => option.label.toLowerCase().includes(term));
  }, [options, search]);

  const selected = options.find((option) => option.value === value);

  const handleSelect = (next: string) => {
    setOpen(false);
    setSearch("");
    onChange(next);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm shadow-sm transition-colors hover:border-zinc-300",
          selected ? "text-zinc-900" : "text-zinc-400",
        )}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <ChevronsUpDown size={13} strokeWidth={1.5} className="shrink-0 text-zinc-400" />
      </button>

      {open ? (
        <div className="absolute left-0 top-10 z-50 w-full min-w-52 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-pop">
          {searchable ? (
            <div className="flex items-center gap-2 border-b border-zinc-100 px-3">
              <Search size={13} strokeWidth={1.5} className="text-zinc-400" />
              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar…"
                className="h-9 w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
              />
            </div>
          ) : null}
          <ul role="listbox" className="max-h-64 overflow-y-auto py-1">
            {clearable ? (
              <li>
                <button
                  type="button"
                  onClick={() => handleSelect("")}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-zinc-50",
                    value === "" ? "font-medium text-zinc-900" : "text-zinc-500",
                  )}
                >
                  <span className="truncate">{placeholder}</span>
                  {value === "" ? <Check size={13} strokeWidth={2} className="shrink-0 text-primary" /> : null}
                </button>
              </li>
            ) : null}
            {filtered.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-zinc-50",
                    option.value === value ? "font-medium text-zinc-900" : "text-zinc-600",
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {option.value === value ? (
                    <Check size={13} strokeWidth={2} className="shrink-0 text-primary" />
                  ) : null}
                </button>
              </li>
            ))}
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-xs text-zinc-400">Sin resultados</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
