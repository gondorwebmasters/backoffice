"use client";

import { useLazyQuery, useQuery } from "@apollo/client";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { MemberPanel } from "@/components/members/member-panel";
import { BadgeDot } from "@/components/ui/badge-dot";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/sticky-header";
import { Dropdown } from "@/components/ui/dropdown";
import { formatCents, formatDate, fullName, planPriceCents } from "@/lib/format";
import { GET_PLAN_WITH_SUBSCRIPTIONS, LIST_PLANS } from "@/lib/graphql/plans";
import { GET_SUBSCRIPTIONS_STATS } from "@/lib/graphql/stats";
import type { Plan, Subscription, SubscriptionsStat, User } from "@/lib/graphql/types";
import { FIND_USER } from "@/lib/graphql/users";

const STATUS_TONES: Record<string, "positive" | "neutral" | "warning" | "negative" | "muted"> = {
  active: "positive",
  trialing: "neutral",
  past_due: "warning",
  paused: "muted",
  canceled: "muted",
  unpaid: "negative",
  incomplete: "warning",
  incomplete_expired: "muted",
};

const STATUS_FILTER_VALUES = ["active", "", "trialing", "past_due", "unpaid", "paused", "canceled"] as const;

const PAGE_SIZE = 10;

export default function SubscriptionsPage() {
  const t = useTranslations("subscriptions");
  const statusLabels = useTranslations("subscriptions.statusLabels");

  // La tarjeta de resumen ("stats") solo cuenta suscripciones activas — si la
  // tabla mostrase todos los estados por defecto (incl. canceladas/expiradas),
  // el número de la tarjeta y el de la lista no coincidirían nunca. "Activas"
  // como filtro inicial es lo que hace que ambos números cuadren; el resto de
  // estados sigue disponible para auditar el histórico.
  const STATUS_FILTERS = STATUS_FILTER_VALUES.map((value) => ({
    value,
    label: t(`statusFilters.${value || "all"}`),
  }));

  const [planId, setPlanId] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [page, setPage] = useState(0);
  const [member, setMember] = useState<User | null>(null);

  const stats = useQuery<{ getSubscriptionsStats: { stats: SubscriptionsStat[] } }>(GET_SUBSCRIPTIONS_STATS);
  const plans = useQuery<{ listPlans: { plans: Plan[] | null } }>(LIST_PLANS);
  const planDetail = useQuery<{ getPlan: { plan: Plan | null } }>(GET_PLAN_WITH_SUBSCRIPTIONS, {
    variables: { planId },
    skip: !planId,
  });
  const [findUser] = useLazyQuery<{ findUser: { user: User | null } }>(FIND_USER);

  const allSubscriptions = planDetail.data?.getPlan?.plan?.subscriptions ?? [];
  const filteredSubscriptions = useMemo(
    () => (statusFilter ? allSubscriptions.filter((sub) => sub.status === statusFilter) : allSubscriptions),
    [allSubscriptions, statusFilter],
  );
  const pageCount = Math.max(Math.ceil(filteredSubscriptions.length / PAGE_SIZE), 1);
  const subscriptions = filteredSubscriptions.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const totalByPlan = stats.data?.getSubscriptionsStats?.stats ?? [];

  const selectPlan = (id: string) => {
    setPlanId(id);
    setStatusFilter("active");
    setPage(0);
  };

  const openMember = async (subscription: Subscription) => {
    if (!subscription.user?.id) return;
    const { data } = await findUser({ variables: { id: subscription.user.id } });
    if (data?.findUser?.user) setMember(data.findUser.user);
  };

  const columns: Column<Subscription>[] = [
    {
      key: "user",
      header: t("columns.member"),
      render: (subscription) => (
        <span className="text-zinc-700">{subscription.user ? fullName(subscription.user) : "—"}</span>
      ),
    },
    {
      key: "since",
      header: t("columns.since"),
      render: (subscription) => <span className="text-zinc-600">{formatDate(subscription.created_at)}</span>,
    },
    {
      key: "periodEnd",
      header: t("columns.periodEnd"),
      render: (subscription) => <span className="text-zinc-600">{formatDate(subscription.currentPeriodEnd)}</span>,
    },
    {
      key: "nextBilling",
      header: t("columns.nextBilling"),
      render: (subscription) => <span className="text-zinc-600">{formatDate(subscription.nextBillingDate)}</span>,
    },
    {
      key: "failed",
      header: t("columns.failedPayments"),
      render: (subscription) => (
        <span className={subscription.failedPaymentAttempts > 0 ? "text-red-600" : "text-zinc-400"}>
          {subscription.failedPaymentAttempts}
        </span>
      ),
    },
    {
      key: "status",
      header: t("columns.status"),
      render: (subscription) => {
        const tone = STATUS_TONES[subscription.status] ?? "neutral";
        const label = ["active", "trialing", "past_due", "paused", "canceled", "unpaid", "incomplete", "incomplete_expired"].includes(
          subscription.status,
        )
          ? statusLabels(subscription.status as Parameters<typeof statusLabels>[0])
          : subscription.status;
        return <BadgeDot tone={tone} label={label} />;
      },
    },
  ];

  return (
    <>
      <PageShell
        header={
          <>
            <PageHeader title={t("title")} subtitle={t("subtitle")} />

            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {totalByPlan.map((stat) => (
                <button
                  key={stat.planId}
                  onClick={() => selectPlan(stat.planId)}
                  className={`rounded-2xl border bg-white p-5 text-left shadow-card transition-all hover:shadow-card-hover ${
                    planId === stat.planId ? "border-primary ring-1 ring-primary/30" : "border-zinc-200 hover:border-zinc-400"
                  }`}
                >
                  <p className="truncate text-xs font-medium uppercase tracking-wider text-zinc-400">{stat.planName}</p>
                  <p className="mt-1.5 text-2xl font-semibold tracking-tight text-zinc-900">{stat.count}</p>
                  <p className="text-xs text-zinc-400">{t("activeSubscriptions")}</p>
                </button>
              ))}
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="w-72">
                <Dropdown
                  options={(plans.data?.listPlans?.plans ?? []).map((plan) => ({
                    value: plan.id,
                    label: `${plan.name} · ${formatCents(planPriceCents(plan), plan.currency)}`,
                  }))}
                  placeholder={t("selectPlanPlaceholder")}
                  value={planId}
                  onChange={selectPlan}
                  searchable
                />
              </div>
              {planId ? (
                <div className="w-48">
                  <Dropdown
                    options={STATUS_FILTERS}
                    value={statusFilter}
                    onChange={(value) => {
                      setStatusFilter(value);
                      setPage(0);
                    }}
                  />
                </div>
              ) : null}
            </div>
          </>
        }
      >
        {planId ? (
          <>
            <DataTable
              columns={columns}
              rows={subscriptions}
              rowKey={(subscription) => subscription.id}
              onRowClick={openMember}
              loading={planDetail.loading}
              emptyMessage={t("emptyTable")}
            />
            <Pagination
              page={page}
              pageCount={pageCount}
              onChange={setPage}
              totalLabel={t("totalLabel", { count: filteredSubscriptions.length })}
            />
          </>
        ) : (
          <p className="rounded-xl border border-dashed border-zinc-200 py-16 text-center text-sm text-zinc-400">
            {t("selectPlanHint")}
          </p>
        )}
      </PageShell>

      <MemberPanel member={member} onClose={() => setMember(null)} onChanged={() => planDetail.refetch()} />
    </>
  );
}