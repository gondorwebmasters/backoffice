"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "./button";

interface PaginationProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  totalLabel?: string;
}

/** Paginación compacta reutilizable — mismo lenguaje visual en toda la app. */
export function Pagination({ page, pageCount, onChange, totalLabel }: PaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <span className="text-xs text-zinc-400">{totalLabel}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs tabular-nums text-zinc-400">
          Página {page + 1} de {pageCount}
        </span>
        <Button size="sm" variant="ghost" disabled={page === 0} onClick={() => onChange(page - 1)}>
          <ChevronLeft size={15} strokeWidth={1.5} />
        </Button>
        <Button size="sm" variant="ghost" disabled={page >= pageCount - 1} onClick={() => onChange(page + 1)}>
          <ChevronRight size={15} strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  );
}