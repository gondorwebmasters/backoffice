"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { MonthAmount } from "@/lib/graphql/reports";

import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "./chart-theme";

function formatEuros(value: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value);
}

export function RevenueTrendChart({ data, loading }: { data: MonthAmount[]; loading?: boolean }) {
  if (loading) {
    return <div className="h-48 animate-pulse rounded-lg bg-zinc-100" />;
  }

  if (data.length === 0) {
    return <p className="py-16 text-center text-sm text-zinc-400">Sin ingresos registrados en el período</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="revenueTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.35} />
            <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: CHART_COLORS.text, fontSize: 11 }} />
        <YAxis hide />
        <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(value) => [formatEuros(Number(value))]} />
        <Area
          type="monotone"
          dataKey="amount"
          stroke={CHART_COLORS.primary}
          strokeWidth={2}
          fill="url(#revenueTrendFill)"
          animationDuration={800}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
