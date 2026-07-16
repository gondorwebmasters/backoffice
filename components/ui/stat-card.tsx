"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { cn } from "@/lib/cn";

import { Sparkline } from "./sparkline";

interface StatCardProps {
  label: string;
  value: number | string;
  /** Variación relativa (ej. +12.5 → "▲ 12,5 %"). */
  delta?: number;
  deltaLabel?: string;
  detail?: string;
  trend?: number[];
  loading?: boolean;
  className?: string;
}

function DeltaBadge({ delta, deltaLabel }: { delta: number; deltaLabel?: string }) {
  const Icon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;
  const tone =
    delta > 0
      ? "bg-emerald-500/10 text-emerald-500"
      : delta < 0
        ? "bg-red-500/10 text-red-500"
        : "bg-zinc-400/10 text-zinc-500";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
        tone,
      )}
    >
      <Icon size={12} strokeWidth={2} />
      {Math.abs(delta).toLocaleString("es-ES", { maximumFractionDigits: 1 })}%
      {deltaLabel ? <span className="ml-0.5 font-normal text-zinc-400">{deltaLabel}</span> : null}
    </span>
  );
}

export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  detail,
  trend,
  loading,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">{label}</p>
        {delta !== undefined && !loading ? <DeltaBadge delta={delta} deltaLabel={deltaLabel} /> : null}
      </div>
      {loading ? (
        <div className="mt-3 h-8 w-20 animate-pulse rounded bg-zinc-100" />
      ) : (
        <div className="mt-2 flex items-end justify-between gap-3">
          <p className="text-3xl font-bold tabular-nums tracking-tight text-zinc-900">{value}</p>
          {trend && trend.length > 1 ? <Sparkline data={trend} className="shrink-0" /> : null}
        </div>
      )}
      {detail ? <p className="mt-1 text-xs text-zinc-400">{detail}</p> : null}
    </div>
  );
}
