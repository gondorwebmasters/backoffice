"use client";

import type { SubscriptionsStat } from "@/lib/graphql/types";

export function PlanDistributionChart({ stats, loading }: { stats: SubscriptionsStat[]; loading?: boolean }) {
  if (loading) {
    return <div className="h-48 animate-pulse rounded-lg bg-zinc-100" />;
  }

  if (stats.length === 0) {
    return <p className="py-16 text-center text-sm text-zinc-400">Sin suscripciones activas</p>;
  }

  const max = Math.max(...stats.map((stat) => stat.count));
  const sorted = [...stats].sort((a, b) => b.count - a.count);

  return (
    <ul className="space-y-4">
      {sorted.map((stat) => (
        <li key={stat.planId} title={`${stat.planName}: ${stat.count} suscripciones`}>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-sm text-zinc-600">{stat.planName}</span>
            <span className="text-sm font-medium tabular-nums text-zinc-900">{stat.count}</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-100">
            <div
              className="h-2 rounded-full bg-primary-chart"
              style={{ width: `${max === 0 ? 0 : Math.max((stat.count / max) * 100, 2)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
