"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";

import { formatDate, fullName } from "@/lib/format";
import type { Invoice } from "@/lib/graphql/types";

export function AttentionList({
  overdueInvoices,
  pendingUsers,
  loading,
}: {
  overdueInvoices: Invoice[];
  pendingUsers: number;
  loading?: boolean;
}) {
  if (loading) {
    return <div className="h-24 animate-pulse rounded-lg bg-zinc-50" />;
  }

  const empty = overdueInvoices.length === 0 && pendingUsers === 0;

  if (empty) {
    return <p className="py-8 text-center text-sm text-zinc-400">Todo en orden — nada pendiente de revisión</p>;
  }

  return (
    <ul className="divide-y divide-zinc-100">
      {pendingUsers > 0 ? (
        <li>
          <Link href="/members?state=pending" className="flex items-center gap-3 py-3 hover:bg-zinc-50">
            <AlertCircle size={15} strokeWidth={1.5} className="shrink-0 text-amber-500" />
            <span className="text-sm text-zinc-700">
              {pendingUsers} {pendingUsers === 1 ? "solicitud de ingreso pendiente" : "solicitudes de ingreso pendientes"}
            </span>
          </Link>
        </li>
      ) : null}
      {overdueInvoices.slice(0, 5).map((invoice) => (
        <li key={invoice.id}>
          <Link href="/billing" className="flex items-center gap-3 py-3 hover:bg-zinc-50">
            <AlertCircle size={15} strokeWidth={1.5} className="shrink-0 text-red-500" />
            <span className="flex-1 text-sm text-zinc-700">
              Factura {invoice.invoiceNumber ?? invoice.id.slice(0, 8)} vencida · {fullName(invoice.user)}
            </span>
            <span className="text-sm tabular-nums text-zinc-400">
              {invoice.formattedTotal} · vencía {formatDate(invoice.dueDate)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
