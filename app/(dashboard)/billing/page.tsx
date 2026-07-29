"use client";

import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("billing");
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
      header: t("columns.invoice"),
      render: (invoice) => (
        <span className="font-medium text-zinc-900">{invoice.invoiceNumber ?? invoice.id.slice(0, 8)}</span>
      ),
    },
    { key: "member", header: t("columns.member"), render: (invoice) => <span className="text-zinc-600">{fullName(invoice.user)}</span> },
    { key: "due", header: t("columns.dueDate"), render: (invoice) => <span className="text-red-600">{formatDate(invoice.dueDate)}</span> },
    {
      key: "total",
      header: t("columns.amount"),
      render: (invoice) => <span className="tabular-nums text-zinc-700">{invoice.formattedTotal}</span>,
    },
    {
      key: "remaining",
      header: t("columns.remaining"),
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
              voidInvoice({ variables: { invoiceId: invoice.id } }).then(() => toast(t("invoiceVoided")));
            }}
          >
            {t("void")}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation();
              markUncollectible({ variables: { invoiceId: invoice.id } }).then(() =>
                toast(t("markedUncollectible")),
              );
            }}
          >
            {t("uncollectible")}
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
        emptyMessage={t("noOverdueInvoices")}
      />
      <Pagination page={page} pageCount={pageCount} onChange={setPage} totalLabel={t("invoiceTotalLabel", { count: allInvoices.length })} />
    </>
  );
}

function UserTransactions() {
  const t = useTranslations("billing");
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
    { key: "date", header: t("columns.date"), render: (transaction) => <span className="text-zinc-600">{formatDateTime(transaction.created_at)}</span> },
    {
      key: "concept",
      header: t("columns.concept"),
      render: (transaction) => (
        <div>
          <p className="text-zinc-700">{transaction.description ?? transaction.type}</p>
          {transaction.failureReason ? <p className="text-xs text-red-500">{transaction.failureReason}</p> : null}
        </div>
      ),
    },
    {
      key: "amount",
      header: t("columns.amount"),
      render: (transaction) => (
        <span className="tabular-nums text-zinc-700">{formatCents(transaction.amount, transaction.currency)}</span>
      ),
    },
    {
      key: "status",
      header: t("columns.status"),
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
                if (data?.refundTransaction?.success) toast(t("refundIssued"));
                else toast(data?.refundTransaction?.message ?? t("refundFailed"), "error");
                transactions.refetch?.();
              }}
            >
              {t("refund")}
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
              {t("retry")}
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
          placeholder={t("searchMemberPlaceholder")}
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
            {t("transactionsOf")} <span className="font-medium text-zinc-900">{fullName(selectedUser)}</span>
          </p>
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(transaction) => transaction.id}
            loading={transactions.loading}
            emptyMessage={t("noTransactions")}
          />
          <Pagination page={page} pageCount={pageCount} onChange={setPage} totalLabel={t("transactionTotalLabel", { count: allRows.length })} />
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-200 py-16 text-center text-sm text-zinc-400">
          {t("searchMemberHint")}
        </p>
      )}
    </div>
  );
}

export default function BillingPage() {
  const t = useTranslations("billing");
  const [tab, setTab] = useState("invoices");

  return (
    <>
      <PageShell
        header={
          <>
            <PageHeader title={t("title")} subtitle={t("subtitle")} />
            <div className="mb-6">
              <Tabs
                items={[
                  { value: "invoices", label: t("overdueInvoicesTab") },
                  { value: "transactions", label: t("transactionsTab") },
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
