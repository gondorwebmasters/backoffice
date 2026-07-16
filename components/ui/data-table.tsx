"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  loading,
  emptyMessage = "Sin resultados",
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200/80 bg-white shadow-card">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-100 bg-zinc-50/60">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "px-6 py-3.5 text-xs font-medium uppercase tracking-wider text-zinc-400",
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
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn("transition-colors", onRowClick && "cursor-pointer hover:bg-primary/5")}
                >
                  {columns.map((column) => (
                    <td key={column.key} className={cn("px-6 py-4", column.className)}>
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
          {!loading && rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-16 text-center text-sm text-zinc-400">
                {emptyMessage}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
