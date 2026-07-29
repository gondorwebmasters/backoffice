"use client";

import { useMutation, useQuery } from "@apollo/client";
import { Archive, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { PlanForm } from "@/components/plans/plan-form";
import { BadgeDot } from "@/components/ui/badge-dot";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, type Column } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { PageShell } from "@/components/ui/sticky-header";
import { useToast } from "@/components/ui/toast";
import { formatCents, planPriceCents } from "@/lib/format";
import { ARCHIVE_PLAN, LIST_PLANS } from "@/lib/graphql/plans";
import type { Plan } from "@/lib/graphql/types";

const PAGE_SIZE = 10;

export default function PlansPage() {
  const t = useTranslations("plans");
  const toast = useToast();

  const INTERVAL_LABELS: Record<string, string> = {
    day: t("intervals.day"),
    week: t("intervals.week"),
    month: t("intervals.month"),
    year: t("intervals.year"),
  };
  const [editing, setEditing] = useState<Plan | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [archiving, setArchiving] = useState<Plan | null>(null);
  const [page, setPage] = useState(0);

  const { data, loading, refetch } = useQuery<{ listPlans: { plans: Plan[] | null } }>(LIST_PLANS);
  const [archivePlan, archiveState] = useMutation(ARCHIVE_PLAN);

  const allPlans = data?.listPlans?.plans ?? [];
  const pageCount = Math.max(Math.ceil(allPlans.length / PAGE_SIZE), 1);
  const plans = allPlans.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const handleArchive = async () => {
    if (!archiving) return;
    const { data: result } = await archivePlan({ variables: { planId: archiving.id } });
    if (result?.archivePlan?.success) {
      toast(t("archived"));
      refetch();
    } else {
      toast(result?.archivePlan?.message ?? t("archiveFailed"), "error");
    }
    setArchiving(null);
  };

  const columns: Column<Plan>[] = [
    {
      key: "name",
      header: t("columns.plan"),
      render: (plan) => (
        <div>
          <p className="font-medium text-zinc-900">{plan.name}</p>
          {plan.description ? <p className="mt-0.5 max-w-md truncate text-xs text-zinc-400">{plan.description}</p> : null}
        </div>
      ),
    },
    {
      key: "price",
      header: t("columns.price"),
      render: (plan) => (
        <span className="tabular-nums text-zinc-700">
          {formatCents(planPriceCents(plan), plan.currency)}
          <span className="text-zinc-400"> / {INTERVAL_LABELS[plan.interval] ?? plan.interval}</span>
        </span>
      ),
    },
    {
      key: "trial",
      header: t("columns.trial"),
      render: (plan) => (
        <span className="text-zinc-600">{plan.trialPeriodDays ? t("trialDays", { count: plan.trialPeriodDays }) : "—"}</span>
      ),
    },
    {
      key: "status",
      header: t("columns.status"),
      render: (plan) => (
        <BadgeDot
          tone={plan.status === "active" ? "positive" : plan.status === "archived" ? "muted" : "neutral"}
          label={plan.status === "active" ? t("statusLabels.active") : plan.status === "archived" ? t("statusLabels.archived") : t("statusLabels.inactive")}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12 text-right",
      render: (plan) =>
        plan.status !== "archived" ? (
          <button
            onClick={(event) => {
              event.stopPropagation();
              setArchiving(plan);
            }}
            className="rounded-lg p-1.5 text-zinc-300 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
            title={t("archivePlan")}
          >
            <Archive size={15} strokeWidth={1.5} />
          </button>
        ) : null,
    },
  ];

  return (
    <>
      <PageShell
        header={
          <PageHeader
            title={t("title")}
            subtitle={t("subtitle")}
            actions={
              <Button
                variant="primary"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <Plus size={15} strokeWidth={1.5} />
                {t("newPlan")}
              </Button>
            }
          />
        }
      >
        <DataTable
          columns={columns}
          rows={plans}
          rowKey={(plan) => plan.id}
          onRowClick={(plan) => {
            setEditing(plan);
            setFormOpen(true);
          }}
          loading={loading}
          emptyMessage={t("emptyTable")}
        />
        <Pagination page={page} pageCount={pageCount} onChange={setPage} totalLabel={t("totalLabel", { count: allPlans.length })} />
      </PageShell>

      <PlanForm open={formOpen} plan={editing} onClose={() => setFormOpen(false)} onSaved={() => refetch()} />

      <ConfirmDialog
        open={Boolean(archiving)}
        title={t("archivePlan")}
        description={t("archiveConfirmDescription", { name: archiving?.name ?? "" })}
        confirmLabel={t("archive")}
        loading={archiveState.loading}
        onConfirm={handleArchive}
        onCancel={() => setArchiving(null)}
      />
    </>
  );
}
