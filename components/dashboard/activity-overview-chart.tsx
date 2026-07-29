"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { AdminStats } from "@/lib/graphql/types";

import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "./chart-theme";

export function ActivityOverviewChart({ stats, loading }: { stats?: AdminStats | null; loading?: boolean }) {
  const t = useTranslations("dashboard.activityChart");

  if (loading || !stats) {
    return <div className="h-48 animate-pulse rounded-lg bg-zinc-100" />;
  }

  const data = [
    { key: t("classes"), value: stats.schedules },
    { key: t("polls"), value: stats.polls },
    { key: t("plans"), value: stats.plans },
    { key: t("subscriptions"), value: stats.subscriptions },
    { key: t("transactions"), value: stats.transactions },
    { key: t("notifications"), value: stats.notifications },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }} barCategoryGap="30%">
        <XAxis
          dataKey="key"
          tickLine={false}
          axisLine={false}
          interval={0}
          tick={{ fill: "rgb(var(--z-500))", fontSize: 10 }}
        />
        <YAxis hide allowDecimals={false} />
        <Tooltip {...CHART_TOOLTIP_STYLE} cursor={{ fill: CHART_COLORS.primaryFaint }} />
        <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={40} animationDuration={700} animationEasing="ease-out">
          {data.map((item, index) => (
            <Cell key={item.key} fillOpacity={1 - index * 0.1} fill={CHART_COLORS.primary} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}