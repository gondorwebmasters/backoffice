"use client";

import { useMutation, useQuery } from "@apollo/client";
import { Archive, Plus } from "lucide-react";
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
import { formatCents } from "@/lib/format";
import { ARCHIVE_PLAN, LIST_PLANS } from "@/lib/graphql/plans";
import type { Plan } from "@/lib/graphql/types";

const INTERVAL_LABELS: Record<string, string> = {
  day: "diario",
  week: "semanal",
  month: "mensual",
  year: "anual",
};

const PAGE_SIZE = 10;

export default function PlansPage() {
  const toast = useToast();
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
      toast("Plan archivado");
      refetch();
    } else {
      toast(result?.archivePlan?.message ?? "No se pudo archivar", "error");
    }
    setArchiving(null);
  };

  const columns: Column<Plan>[] = [
    {
      key: "name",
      header: "Plan",
      render: (plan) => (
        <div>
          <p className="font-medium text-zinc-900">{plan.name}</p>
          {plan.description ? <p className="mt-0.5 max-w-md truncate text-xs text-zinc-400">{plan.description}</p> : null}
        </div>
      ),
    },
    {
      key: "price",
      header: "Precio",
      render: (plan) => (
        <span className="tabular-nums text-zinc-700">
          {formatCents(plan.amount, plan.currency)}
          <span className="text-zinc-400"> / {INTERVAL_LABELS[plan.interval] ?? plan.interval}</span>
        </span>
      ),
    },
    {
      key: "trial",
      header: "Prueba",
      render: (plan) => (
        <span className="text-zinc-600">{plan.trialPeriodDays ? `${plan.trialPeriodDays} días` : "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (plan) => (
        <BadgeDot
          tone={plan.status === "active" ? "positive" : plan.status === "archived" ? "muted" : "neutral"}
          label={plan.status === "active" ? "Activo" : plan.status === "archived" ? "Archivado" : "Inactivo"}
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
            title="Archivar plan"
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
            title="Planes"
            subtitle="Planes de suscripción de la empresa"
            actions={
              <Button
                variant="primary"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <Plus size={15} strokeWidth={1.5} />
                Nuevo plan
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
          emptyMessage="Aún no hay planes creados"
        />
        <Pagination page={page} pageCount={pageCount} onChange={setPage} totalLabel={`${allPlans.length} planes`} />
      </PageShell>

      <PlanForm open={formOpen} plan={editing} onClose={() => setFormOpen(false)} onSaved={() => refetch()} />

      <ConfirmDialog
        open={Boolean(archiving)}
        title="Archivar plan"
        description={`El plan "${archiving?.name}" dejará de estar disponible para nuevas suscripciones. Las existentes no se ven afectadas.`}
        confirmLabel="Archivar"
        loading={archiveState.loading}
        onConfirm={handleArchive}
        onCancel={() => setArchiving(null)}
      />
    </>
  );
}
