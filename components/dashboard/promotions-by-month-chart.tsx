"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { MonthCount } from "@/lib/graphql/reports";

import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "./chart-theme";

export function PromotionsByMonthChart({ data, loading }: { data: MonthCount[]; loading?: boolean }) {
  const t = useTranslations("dashboard.promotionsByMonthChart");

  if (loading) {
    return <div className="h-48 animate-pulse rounded-lg bg-zinc-100" />;
  }

  if (data.length === 0) {
    return <p className="py-16 text-center text-sm text-zinc-400">{t("empty")}</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }} barCategoryGap="30%">
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: CHART_COLORS.text, fontSize: 11 }} />
        <YAxis hide allowDecimals={false} />
        <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(value) => [t("promotions", { value: Number(value) })]} />
        <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={36} animationDuration={600} animationEasing="ease-out">
          {data.map((item, index) => (
            <Cell key={item.month} fill={CHART_COLORS.primary} fillOpacity={1 - index * 0.1} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
