"use client";

import { useLocale, useTranslations } from "next-intl";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { MonthAmount } from "@/lib/graphql/reports";

import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "./chart-theme";

const INTL_LOCALE: Record<string, string> = { es: "es-ES", pt: "pt-PT" };

function formatEuros(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(value);
}

export function RevenueTrendChart({ data, loading }: { data: MonthAmount[]; loading?: boolean }) {
  const t = useTranslations("dashboard.revenueTrendChart");
  const locale = useLocale();
  const intlLocale = INTL_LOCALE[locale] ?? locale;

  if (loading) {
    return <div className="h-48 animate-pulse rounded-lg bg-zinc-100" />;
  }

  if (data.length === 0) {
    return <p className="py-16 text-center text-sm text-zinc-400">{t("empty")}</p>;
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
        <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(value) => [formatEuros(Number(value), intlLocale)]} />
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
