"use client";

import { useLazyQuery, useQuery } from "@apollo/client";
import { useState } from "react";

import { MemberPanel } from "@/components/members/member-panel";
import { BadgeDot } from "@/components/ui/badge-dot";
import { DataTable, type Column } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Dropdown } from "@/components/ui/dropdown";
import { formatCents, formatDate } from "@/lib/format";
import { GET_PLAN_WITH_SUBSCRIPTIONS, LIST_PLANS } from "@/lib/graphql/plans";
import { GET_SUBSCRIPTIONS_STATS } from "@/lib/graphql/stats";
import type { Plan, Subscription, SubscriptionsStat, User } from "@/lib/graphql/types";
import { FIND_USER } from "@/lib/graphql/users";

const STATUS_META: Record<string, { label: string; tone: "positive" | "neutral" | "warning" | "negative" | "muted" }> = {
  active: { label: "Activa", tone: "positive" },
  trialing: { label: "En prueba", tone: "neutral" },
  past_due: { label: "Pago vencido", tone: "warning" },
  paused: { label: "Pausada", tone: "muted" },
  canceled: { label: "Cancelada", tone: "muted" },
  unpaid: { label: "Impagada", tone: "negative" },
  incomplete: { label: "Incompleta", tone: "warning" },
  incomplete_expired: { label: "Expirada", tone: "muted" },
};

export default function SubscriptionsPage() {
  const [planId, setPlanId] = useState("");
  const [member, setMember] = useState<User | null>(null);

  const stats = useQuery<{ getSubscriptionsStats: { stats: SubscriptionsStat[] } }>(GET_SUBSCRIPTIONS_STATS);
  const plans = useQuery<{ listPlans: { plans: Plan[] | null } }>(LIST_PLANS);
  const planDetail = useQuery<{ getPlan: { plan: Plan | null } }>(GET_PLAN_WITH_SUBSCRIPTIONS, {
    variables: { planId },
    skip: !planId,
  });
  const [findUser] = useLazyQuery<{ findUser: { user: User | null } }>(FIND_USER);

  const subscriptions = planDetail.data?.getPlan?.plan?.subscriptions ?? [];
  const totalByPlan = stats.data?.getSubscriptionsStats?.stats ?? [];

  const openMember = async (subscription: Subscription) => {
    if (!subscription.user?.id) return;
    const { data } = await findUser({ variables: { id: subscription.user.id } });
    if (data?.findUser?.user) setMember(data.findUser.user);
  };

  const columns: Column<Subscription>[] = [
    {
      key: "user",
      header: "Miembro",
      render: (subscription) => (
        <span className="font-mono text-xs text-zinc-500">{subscription.user?.id ?? "—"}</span>
      ),
    },
    {
      key: "since",
      header: "Alta",
      render: (subscription) => <span className="text-zinc-600">{formatDate(subscription.created_at)}</span>,
    },
    {
      key: "periodEnd",
      header: "Fin de periodo",
      render: (subscription) => <span className="text-zinc-600">{formatDate(subscription.currentPeriodEnd)}</span>,
    },
    {
      key: "nextBilling",
      header: "Próximo cobro",
      render: (subscription) => <span className="text-zinc-600">{formatDate(subscription.nextBillingDate)}</span>,
    },
    {
      key: "failed",
      header: "Fallos de cobro",
      render: (subscription) => (
        <span className={subscription.failedPaymentAttempts > 0 ? "text-red-600" : "text-zinc-400"}>
          {subscription.failedPaymentAttempts}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (subscription) => {
        const meta = STATUS_META[subscription.status] ?? { label: subscription.status, tone: "neutral" as const };
        return <BadgeDot tone={meta.tone} label={meta.label} />;
      },
    },
  ];

  return (
    <>
      <PageHeader title="Suscripciones" subtitle="Estado de las suscripciones por plan" />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {totalByPlan.map((stat) => (
          <button
            key={stat.planId}
            onClick={() => setPlanId(stat.planId)}
            className={`rounded-2xl border bg-white p-5 text-left shadow-card transition-all hover:shadow-card-hover ${
              planId === stat.planId ? "border-primary ring-1 ring-primary/30" : "border-zinc-200 hover:border-zinc-400"
            }`}
          >
            <p className="truncate text-xs font-medium uppercase tracking-wider text-zinc-400">{stat.planName}</p>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight text-zinc-900">{stat.count}</p>
            <p className="text-xs text-zinc-400">suscripciones</p>
          </button>
        ))}
      </div>

      <div className="mb-4 w-72">
        <Dropdown
          options={(plans.data?.listPlans?.plans ?? []).map((plan) => ({
            value: plan.id,
            label: `${plan.name} · ${formatCents(plan.amount, plan.currency)}`,
          }))}
          placeholder="Selecciona un plan para ver sus suscripciones…"
          value={planId}
          onChange={setPlanId}
          searchable
        />
      </div>

      {planId ? (
        <DataTable
          columns={columns}
          rows={subscriptions}
          rowKey={(subscription) => subscription.id}
          onRowClick={openMember}
          loading={planDetail.loading}
          emptyMessage="Este plan no tiene suscripciones"
        />
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-200 py-16 text-center text-sm text-zinc-400">
          Elige un plan para ver el detalle de sus suscripciones
        </p>
      )}

      <MemberPanel member={member} onClose={() => setMember(null)} onChanged={() => planDetail.refetch()} />
    </>
  );
}
