"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useTranslations } from "next-intl";

import { BadgeDot } from "@/components/ui/badge-dot";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatCents, formatDate, formatDateTime } from "@/lib/format";
import {
  LIST_USER_INVOICES,
  LIST_USER_TRANSACTIONS,
  REFUND_TRANSACTION,
  RETRY_FAILED_TRANSACTION,
  VOID_INVOICE,
} from "@/lib/graphql/billing";
import type { Invoice, Transaction } from "@/lib/graphql/types";

const INVOICE_TONES = {
  paid: "positive",
  open: "neutral",
  draft: "muted",
  void: "muted",
  uncollectible: "negative",
} as const;

const TRANSACTION_TONES = {
  succeeded: "positive",
  pending: "neutral",
  failed: "negative",
  canceled: "muted",
  refunded: "muted",
  partially_refunded: "warning",
} as const;

export function PaymentsTab({ userId }: { userId: string }) {
  const t = useTranslations("members.paymentsTab");
  const toast = useToast();

  const invoices = useQuery<{ listUserInvoices: { invoices: Invoice[] | null } }>(LIST_USER_INVOICES, {
    variables: { userId },
  });
  const transactions = useQuery<{ listUserTransactions: { transactions: Transaction[] | null } }>(
    LIST_USER_TRANSACTIONS,
    { variables: { userId, limit: 20 } },
  );

  const [voidInvoice] = useMutation(VOID_INVOICE, { onCompleted: () => invoices.refetch() });
  const [refund] = useMutation(REFUND_TRANSACTION, { onCompleted: () => transactions.refetch() });
  const [retry] = useMutation(RETRY_FAILED_TRANSACTION, { onCompleted: () => transactions.refetch() });

  const handleRefund = async (transaction: Transaction) => {
    const { data } = await refund({ variables: { input: { transactionId: transaction.id } } });
    if (data?.refundTransaction?.success) toast(t("refunded"));
    else toast(data?.refundTransaction?.message ?? t("refundFailed"), "error");
  };

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">{t("invoices")}</h3>
        {invoices.loading && !invoices.data ? (
          <div className="h-20 animate-pulse rounded-lg bg-zinc-50" />
        ) : (
          <ul className="divide-y divide-zinc-100">
            {(invoices.data?.listUserInvoices?.invoices ?? []).map((invoice) => (
              <li key={invoice.id} className="flex items-center gap-3 py-3">
                <div className="flex-1">
                  <p className="text-sm text-zinc-700">{invoice.invoiceNumber ?? invoice.id.slice(0, 8)}</p>
                  <p className="text-xs text-zinc-400">
                    {formatDate(invoice.created_at)}
                    {invoice.isOverdue ? t("overdue") : ""}
                  </p>
                </div>
                <span className="text-sm tabular-nums text-zinc-700">{invoice.formattedTotal}</span>
                <BadgeDot
                  tone={invoice.isOverdue ? "negative" : (INVOICE_TONES[invoice.status] ?? "neutral")}
                  label={invoice.status}
                />
                {invoice.status === "open" ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => voidInvoice({ variables: { invoiceId: invoice.id } })}
                  >
                    {t("void")}
                  </Button>
                ) : null}
              </li>
            ))}
            {(invoices.data?.listUserInvoices?.invoices ?? []).length === 0 ? (
              <li className="py-4 text-center text-sm text-zinc-400">{t("noInvoices")}</li>
            ) : null}
          </ul>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">{t("transactions")}</h3>
        {transactions.loading && !transactions.data ? (
          <div className="h-20 animate-pulse rounded-lg bg-zinc-50" />
        ) : (
          <ul className="divide-y divide-zinc-100">
            {(transactions.data?.listUserTransactions?.transactions ?? []).map((transaction) => (
              <li key={transaction.id} className="flex items-center gap-3 py-3">
                <div className="flex-1">
                  <p className="text-sm text-zinc-700">
                    {transaction.description ?? transaction.type}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {formatDateTime(transaction.created_at)}
                    {transaction.failureReason ? ` · ${transaction.failureReason}` : ""}
                  </p>
                </div>
                <span className="text-sm tabular-nums text-zinc-700">
                  {formatCents(transaction.amount, transaction.currency)}
                </span>
                <BadgeDot tone={TRANSACTION_TONES[transaction.status] ?? "neutral"} label={transaction.status} />
                {transaction.status === "succeeded" && transaction.amountRefunded === 0 ? (
                  <Button size="sm" variant="ghost" onClick={() => handleRefund(transaction)}>
                    {t("refund")}
                  </Button>
                ) : null}
                {transaction.status === "failed" ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => retry({ variables: { transactionId: transaction.id } })}
                  >
                    {t("retry")}
                  </Button>
                ) : null}
              </li>
            ))}
            {(transactions.data?.listUserTransactions?.transactions ?? []).length === 0 ? (
              <li className="py-4 text-center text-sm text-zinc-400">{t("noTransactions")}</li>
            ) : null}
          </ul>
        )}
      </section>
    </div>
  );
}
