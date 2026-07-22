"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { AgeRangeCount } from "@/lib/graphql/reports";

import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "./chart-theme";

export function AgeRangeChart({ data, loading }: { data: AgeRangeCount[]; loading?: boolean }) {
  if (loading) {
    return <div className="h-48 animate-pulse rounded-lg bg-zinc-100" />;
  }

  if (data.length === 0 || data.every((item) => item.count === 0)) {
    return <p className="py-16 text-center text-sm text-zinc-400">Sin datos de edad disponibles</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }} barCategoryGap="30%">
        <XAxis dataKey="range" tickLine={false} axisLine={false} tick={{ fill: CHART_COLORS.text, fontSize: 11 }} />
        <YAxis hide allowDecimals={false} />
        <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(value) => [`${value} clientes`]} />
        <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={40} animationDuration={600} animationEasing="ease-out">
          {data.map((item, index) => (
            <Cell key={item.range} fill={CHART_COLORS.primary} fillOpacity={1 - index * 0.15} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
