"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { SubscriptionsStat } from "@/lib/graphql/types";

import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "./chart-theme";

export function PlanDistributionChart({ stats, loading }: { stats: SubscriptionsStat[]; loading?: boolean }) {
  if (loading) {
    return <div className="h-48 animate-pulse rounded-lg bg-zinc-100" />;
  }

  if (stats.length === 0) {
    return <p className="py-16 text-center text-sm text-zinc-400">Sin suscripciones activas</p>;
  }

  const sorted = [...stats].sort((a, b) => b.count - a.count);
  const height = Math.max(sorted.length * 44, 120);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }} barCategoryGap={14}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="planName"
          width={120}
          tickLine={false}
          axisLine={false}
          tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
        />
        <Tooltip
          {...CHART_TOOLTIP_STYLE}
          formatter={(value) => [`${value} suscripciones`]}
        />
        <Bar dataKey="count" radius={[0, 8, 8, 0]} maxBarSize={18} animationDuration={500} animationEasing="ease-out">
          {sorted.map((stat, index) => (
            <Cell key={stat.planId} fill={CHART_COLORS.primary} fillOpacity={1 - index * 0.12} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
