"use client";

import { useQuery } from "@apollo/client";
import { useState } from "react";

import { AttentionList } from "@/components/dashboard/attention-list";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { OccupancyHeatmap } from "@/components/dashboard/occupancy-heatmap";
import { PlanDistributionChart } from "@/components/dashboard/plan-distribution-chart";
import { useSession } from "@/components/layout/session-provider";
import { Dropdown } from "@/components/ui/dropdown";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { GET_OVERDUE_INVOICES } from "@/lib/graphql/billing";
import {
  GET_ADMIN_STATS,
  GET_SCHEDULES_STATS,
  GET_SUBSCRIPTIONS_STATS,
} from "@/lib/graphql/stats";
import type { AdminStats, Invoice, SchedulesStat, SubscriptionsStat } from "@/lib/graphql/types";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

/** Ocupación media (%) de un mes a partir de los ratios por franja. */
function averageRatio(stats: SchedulesStat[] | undefined): number | null {
  if (!stats || stats.length === 0) return null;
  return stats.reduce((sum, stat) => sum + stat.ratio, 0) / stats.length;
}

function Card({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-card">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-900">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

export default function DashboardPage() {
  const { user } = useSession();
  const [month, setMonth] = useState(new Date().getMonth());

  const adminStats = useQuery<{ getAdminStats: { stats: AdminStats | null } }>(GET_ADMIN_STATS);
  // stats[0] = mes solicitado, stats[1] = mes anterior (ver schedule.service.ts)
  const schedulesStats = useQuery<{ getSchedulesStats: { stats: SchedulesStat[][] } }>(GET_SCHEDULES_STATS, {
    variables: { month },
  });
  const subscriptionsStats = useQuery<{ getSubscriptionsStats: { stats: SubscriptionsStat[] } }>(
    GET_SUBSCRIPTIONS_STATS,
  );
  const overdue = useQuery<{ getOverdueInvoices: { invoices: Invoice[] | null } }>(GET_OVERDUE_INVOICES);

  const stats = adminStats.data?.getAdminStats?.stats;

  // stats[0] = mes seleccionado, stats[1] = mes anterior → ocupación media y variación
  const monthlyStats = schedulesStats.data?.getSchedulesStats?.stats;
  const currentOccupancy = averageRatio(monthlyStats?.[0]);
  const previousOccupancy = averageRatio(monthlyStats?.[1]);
  const occupancyDelta =
    currentOccupancy !== null && previousOccupancy !== null && previousOccupancy > 0
      ? ((currentOccupancy - previousOccupancy) / previousOccupancy) * 100
      : undefined;

  return (
    <>
      <PageHeader
        title={`Hola${user?.name ? `, ${user.name}` : ""}`}
        subtitle="Resumen del negocio"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard
          label="Miembros"
          value={stats?.users.totalUsers ?? "—"}
          detail={stats ? `${stats.users.newUsers} nuevos · ${stats.users.pendingUsers} pendientes` : undefined}
          loading={adminStats.loading && !stats}
        />
        <KpiCard
          label="Suscripciones"
          value={stats?.subscriptions ?? "—"}
          detail={stats ? `${stats.plans} planes activos` : undefined}
          loading={adminStats.loading && !stats}
        />
        <KpiCard
          label="Clases"
          value={stats?.schedules ?? "—"}
          detail="programadas"
          loading={adminStats.loading && !stats}
        />
        <KpiCard
          label="Transacciones"
          value={stats?.transactions ?? "—"}
          detail="registradas"
          loading={adminStats.loading && !stats}
        />
        <StatCard
          label="Ocupación media"
          value={currentOccupancy !== null ? `${Math.round(currentOccupancy)}%` : "—"}
          delta={occupancyDelta}
          deltaLabel="vs mes ant."
          detail={`en ${MONTHS[month].toLowerCase()}`}
          loading={schedulesStats.loading && !monthlyStats}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card
            title="Ocupación media por franja"
            actions={
              <Dropdown
                options={MONTHS.map((name, index) => ({ value: String(index), label: name }))}
                value={String(month)}
                onChange={(value) => setMonth(Number(value))}
                className="w-36"
              />
            }
          >
            <OccupancyHeatmap
              stats={schedulesStats.data?.getSchedulesStats?.stats?.[0] ?? []}
              loading={schedulesStats.loading && !schedulesStats.data}
            />
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card title="Miembros por plan">
            <PlanDistributionChart
              stats={subscriptionsStats.data?.getSubscriptionsStats?.stats ?? []}
              loading={subscriptionsStats.loading && !subscriptionsStats.data}
            />
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Card title="Requiere atención">
          <AttentionList
            overdueInvoices={overdue.data?.getOverdueInvoices?.invoices ?? []}
            pendingUsers={stats?.users.pendingUsers ?? 0}
            loading={overdue.loading && !overdue.data}
          />
        </Card>
      </div>
    </>
  );
}
