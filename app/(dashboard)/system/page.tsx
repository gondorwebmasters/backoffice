"use client";

import { useQuery } from "@apollo/client";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { PageHeader } from "@/components/ui/page-header";
import { GET_GLOBAL_SYSTEM_STATS } from "@/lib/graphql/stats";

type GlobalStats = {
  getGlobalSystemStats: {
    success: boolean;
    totalUsers: number | null;
    totalCompanies: number | null;
  } | null;
};

export default function SystemPage() {
  const { data, loading } = useQuery<GlobalStats>(GET_GLOBAL_SYSTEM_STATS);
  const stats = data?.getGlobalSystemStats;

  return (
    <>
      <PageHeader title="Visión global" subtitle="Métricas de toda la plataforma · solo superadmin" />
      <div className="grid grid-cols-2 gap-4 lg:max-w-lg">
        <KpiCard
          label="Usuarios totales"
          value={stats?.totalUsers ?? "—"}
          detail="en toda la plataforma"
          loading={loading && !stats}
        />
        <KpiCard
          label="Empresas"
          value={stats?.totalCompanies ?? "—"}
          detail="registradas"
          loading={loading && !stats}
        />
      </div>
    </>
  );
}
