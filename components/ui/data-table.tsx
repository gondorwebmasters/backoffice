"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Checkbox } from "./checkbox";

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
}

export interface DataTableSelection<T> {
  selectedIds: Set<string>;
  onToggle: (row: T) => void;
  onToggleAll: () => void;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  /** Añade una columna de checkboxes a la izquierda para selección múltiple. */
  selection?: DataTableSelection<T>;
}

// Alto SIEMPRE fijo (no max-h): con menos de 10 filas queda espacio en
// blanco debajo, pero el tamaño de la tarjeta no cambia según el contenido,
// así la página nunca necesita scroll — solo la tabla, con cabecera
// pegajosa. Así el botón "Nuevo…" del PageHeader nunca queda tapado por el
// topbar al desplazarse.
const BODY_HEIGHT = "h-[560px]";

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  loading,
  emptyMessage = "Sin resultados",
  selection,
}: DataTableProps<T>) {
  const allSelected = selection ? rows.length > 0 && rows.every((row) => selection.selectedIds.has(rowKey(row))) : false;
  const colSpan = columns.length + (selection ? 1 : 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-card">
      <div className={cn(BODY_HEIGHT, "overflow-auto")}>
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-zinc-100 bg-zinc-50">
              {selection ? (
                <th className="w-11 bg-zinc-50 px-4 py-3.5">
                  <Checkbox checked={allSelected} onChange={selection.onToggleAll} aria-label="Seleccionar todo" />
                </th>
              ) : null}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "bg-zinc-50 px-6 py-3.5 text-xs font-medium uppercase tracking-wider text-zinc-400",
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading && rows.length === 0
              ? Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    {selection ? (
                      <td className="px-4 py-4">
                        <div className="h-4 w-4 animate-pulse rounded bg-zinc-100" />
                      </td>
                    ) : null}
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row) => {
                  const key = rowKey(row);
                  const selected = selection?.selectedIds.has(key) ?? false;
                  return (
                    <tr
                      key={key}
                      onClick={() => onRowClick?.(row)}
                      className={cn(
                        "transition-colors",
                        onRowClick && "cursor-pointer hover:bg-primary/5",
                        selected && "bg-primary/5",
                      )}
                    >
                      {selection ? (
                        <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                          <Checkbox
                            checked={selected}
                            onChange={() => selection.onToggle(row)}
                            aria-label="Seleccionar fila"
                          />
                        </td>
                      ) : null}
                      {columns.map((column) => (
                        <td key={column.key} className={cn("px-6 py-4", column.className)}>
                          {column.render(row)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
            {!loading && rows.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-6 py-16 text-center text-sm text-zinc-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
