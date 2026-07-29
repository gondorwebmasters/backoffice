"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { UserStats } from "@/lib/graphql/types";

import { CHART_TOOLTIP_STYLE } from "./chart-theme";

const TONES = {
  new: "rgb(var(--primary-chart))",
  pending: "rgb(var(--amber-500))",
  blocked: "rgb(var(--red-500))",
  inactive: "rgb(var(--z-400))",
};

export function UsersStatusChart({ users, loading }: { users?: UserStats; loading?: boolean }) {
  const t = useTranslations("dashboard.usersStatusChart");

  if (loading || !users) {
    return <div className="h-40 animate-pulse rounded-lg bg-zinc-100" />;
  }

  const data = [
    { key: t("new"), value: users.newUsers, color: TONES.new },
    { key: t("pending"), value: users.pendingUsers, color: TONES.pending },
    { key: t("blocked"), value: users.blockedUsers, color: TONES.blocked },
    { key: t("inactive"), value: users.notActiveUsers, color: TONES.inactive },
  ];

  if (data.every((item) => item.value === 0)) {
    return <p className="py-14 text-center text-sm text-zinc-400">{t("empty")}</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={168}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }} barCategoryGap="28%">
        <XAxis
          dataKey="key"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "rgb(var(--z-500))", fontSize: 11 }}
        />
        <YAxis hide allowDecimals={false} />
        <Tooltip {...CHART_TOOLTIP_STYLE} cursor={{ fill: "rgb(var(--z-100))" }} formatter={(value) => [t("members", { value: Number(value) })]} />
        <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={44} animationDuration={600} animationEasing="ease-out">
          {data.map((item) => (
            <Cell key={item.key} fill={item.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}