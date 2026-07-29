"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { MonthCount } from "@/lib/graphql/reports";

import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "./chart-theme";

interface SignupsChurnChartProps {
  newByMonth: MonthCount[];
  churnedByMonth: MonthCount[];
  loading?: boolean;
}

export function SignupsChurnChart({ newByMonth, churnedByMonth, loading }: SignupsChurnChartProps) {
  const t = useTranslations("dashboard.signupsChurnChart");

  if (loading) {
    return <div className="h-48 animate-pulse rounded-lg bg-zinc-100" />;
  }

  const months = Array.from(new Set([...newByMonth, ...churnedByMonth].map((item) => item.month))).sort();

  if (months.length === 0) {
    return <p className="py-16 text-center text-sm text-zinc-400">{t("empty")}</p>;
  }

  const churnedMap = new Map(churnedByMonth.map((item) => [item.month, item.count]));
  const newMap = new Map(newByMonth.map((item) => [item.month, item.count]));
  const data = months.map((month) => ({
    month,
    altas: newMap.get(month) ?? 0,
    bajas: churnedMap.get(month) ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }} barCategoryGap="30%">
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tick={{ fill: CHART_COLORS.text, fontSize: 10 }}
        />
        <YAxis hide allowDecimals={false} />
        <Tooltip {...CHART_TOOLTIP_STYLE} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar
          dataKey="altas"
          name={t("signups")}
          fill={CHART_COLORS.primary}
          radius={[6, 6, 0, 0]}
          maxBarSize={20}
          animationDuration={700}
          animationEasing="ease-out"
        />
        <Bar
          dataKey="bajas"
          name={t("churn")}
          fill="rgb(var(--z-400))"
          radius={[6, 6, 0, 0]}
          maxBarSize={20}
          animationDuration={700}
          animationEasing="ease-out"
          animationBegin={150}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
