"use client";

import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { BadgeDot } from "@/components/ui/badge-dot";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { PageShell } from "@/components/ui/sticky-header";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { formatCents, formatDate, formatDateTime, fullName } from "@/lib/format";
import {
  GET_OVERDUE_INVOICES,
  LIST_USER_TRANSACTIONS,
  MARK_INVOICE_UNCOLLECTIBLE,
  REFUND_TRANSACTION,
  RETRY_FAILED_TRANSACTION,
  VOID_INVOICE,
} from "@/lib/graphql/billing";
import type { Invoice, Transaction, User } from "@/lib/graphql/types";
import { GET_USERS } from "@/lib/graphql/users";

const TRANSACTION_TONES: Record<string, "positive" | "neutral" | "warning" | "negative" | "muted"> = {
  succeeded: "positive",
  pending: "neutral",
  failed: "negative",
  canceled: "muted",
  refunded: "muted",
  partially_refunded: "warning",
};

const PAGE_SIZE = 10;

function OverdueInvoices() {
  const toast = useToast();
  const [page, setPage] = useState(0);
  const { data, loading, refetch } = useQuery<{ getOverdueInvoices: { invoices: Invoice[] | null } }>(
    GET_OVERDUE_INVOICES,
  );
  const [voidInvoice] = useMutation(VOID_INVOICE, { onCompleted: () => refetch() });
  const [markUncollectible] = useMutation(MARK_INVOICE_UNCOLLECTIBLE, { onCompleted: () => refetch() });

  const allInvoices = data?.getOverdueInvoices?.invoices ?? [];
  const pageCount = Math.max(Math.ceil(allInvoices.length / PAGE_SIZE), 1);
  const invoices = allInvoices.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const columns: Column<Invoice>[] = [
    {
      key: "number",
      header: "Factura",
      render: (invoice) => (
        <span className="font-medium text-zinc-900">{invoice.invoiceNumber ?? invoice.id.slice(0, 8)}</span>
      ),
    },
    { key: "member", header: "Miembro", render: (invoice) => <span className="text-zinc-600">{fullName(invoice.user)}</span> },
    { key: "due", header: "Vencimiento", render: (invoice) => <span className="text-red-600">{formatDate(invoice.dueDate)}</span> },
    {
      key: "total",
      header: "Importe",
      render: (invoice) => <span className="tabular-nums text-zinc-700">{invoice.formattedTotal}</span>,
    },
    {
      key: "remaining",
      header: "Pendiente",
      render: (invoice) => (
        <span className="tabular-nums text-zinc-700">{formatCents(invoice.amountRemaining, invoice.currency)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (invoice) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation();
              voidInvoice({ variables: { invoiceId: invoice.id } }).then(() => toast("Factura anulada"));
            }}
          >
            Anular
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation();
              markUncollectible({ variables: { invoiceId: invoice.id } }).then(() =>
                toast("Marcada como incobrable"),
              );
            }}
          >
            Incobrable
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={invoices}
        rowKey={(invoice) => invoice.id}
        loading={loading}
        emptyMessage="No hay facturas vencidas 🎉"
      />
      <Pagination page={page} pageCount={pageCount} onChange={setPage} totalLabel={`${allInvoices.length} facturas`} />
    </>
  );
}

function UserTransactions() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setQuery(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const users = useQuery<{ getUsers: { users: User[] | null } }>(GET_USERS, {
    variables: { query },
    skip: query.length < 2,
  });

  const [loadTransactions, transactions] = useLazyQuery<{
    listUserTransactions: { transactions: Transaction[] | null };
  }>(LIST_USER_TRANSACTIONS);

  const [refund] = useMutation(REFUND_TRANSACTION);
  const [retry] = useMutation(RETRY_FAILED_TRANSACTION);

  const selectUser = (user: User) => {
    setSelectedUser(user);
    setSearch("");
    setQuery("");
    setPage(0);
    loadTransactions({ variables: { userId: user.id, limit: 50 } });
  };

  const allRows = transactions.data?.listUserTransactions?.transactions ?? [];
  const pageCount = Math.max(Math.ceil(allRows.length / PAGE_SIZE), 1);
  const rows = allRows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const columns: Column<Transaction>[] = [
    { key: "date", header: "Fecha", render: (transaction) => <span className="text-zinc-600">{formatDateTime(transaction.created_at)}</span> },
    {
      key: "concept",
      header: "Concepto",
      render: (transaction) => (
        <div>
          <p className="text-zinc-700">{transaction.description ?? transaction.type}</p>
          {transaction.failureReason ? <p className="text-xs text-red-500">{transaction.failureReason}</p> : null}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Importe",
      render: (transaction) => (
        <span className="tabular-nums text-zinc-700">{formatCents(transaction.amount, transaction.currency)}</span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (transaction) => (
        <BadgeDot tone={TRANSACTION_TONES[transaction.status] ?? "neutral"} label={transaction.status} />
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (transaction) => (
        <div className="flex justify-end gap-2">
          {transaction.status === "succeeded" && transaction.amountRefunded === 0 ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                const { data } = await refund({ variables: { input: { transactionId: transaction.id } } });
                if (data?.refundTransaction?.success) toast("Reembolso emitido");
                else toast(data?.refundTransaction?.message ?? "No se pudo reembolsar", "error");
                transactions.refetch?.();
              }}
            >
              Reembolsar
            </Button>
          ) : null}
          {transaction.status === "failed" ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                await retry({ variables: { transactionId: transaction.id } });
                transactions.refetch?.();
              }}
            >
              Reintentar
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="relative w-96">
        <Search size={15} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <Input
          placeholder="Buscar miembro para ver sus transacciones…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-9"
        />
        {query.length >= 2 && (users.data?.getUsers?.users ?? []).length > 0 ? (
          <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-pop">
            {(users.data?.getUsers?.users ?? []).slice(0, 6).map((user) => (
              <li key={user.id}>
                <button
                  onClick={() => selectUser(user)}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-zinc-50"
                >
                  <span className="text-zinc-700">{fullName(user)}</span>
                  <span className="text-xs text-zinc-400">{user.email}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {selectedUser ? (
        <>
          <p className="text-sm text-zinc-500">
            Transacciones de <span className="font-medium text-zinc-900">{fullName(selectedUser)}</span>
          </p>
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(transaction) => transaction.id}
            loading={transactions.loading}
            emptyMessage="Sin transacciones"
          />
          <Pagination page={page} pageCount={pageCount} onChange={setPage} totalLabel={`${allRows.length} transacciones`} />
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-200 py-16 text-center text-sm text-zinc-400">
          Busca un miembro para consultar su historial de pagos
        </p>
      )}
    </div>
  );
}

export default function BillingPage() {
  const [tab, setTab] = useState("invoices");

  return (
    <>
      <PageShell
        header={
          <>
            <PageHeader title="Facturación" subtitle="Facturas vencidas y transacciones" />
            <div className="mb-6">
              <Tabs
                items={[
                  { value: "invoices", label: "Facturas vencidas" },
                  { value: "transactions", label: "Transacciones" },
                ]}
                value={tab}
                onChange={setTab}
              />
            </div>
          </>
        }
      >
        {tab === "invoices" ? <OverdueInvoices /> : <UserTransactions />}
      </PageShell>
    </>
  );
}
