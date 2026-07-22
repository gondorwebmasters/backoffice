"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/cn";

import { AnimatedNumber } from "./animated-number";
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
  index?: number;
}

function DeltaBadge({ delta, deltaLabel }: { delta: number; deltaLabel?: string }) {
  const Icon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;
  const tone =
    delta > 0
      ? "bg-emerald-500/10 text-emerald-600"
      : delta < 0
        ? "bg-red-500/10 text-red-600"
        : "bg-zinc-400/10 text-zinc-500";

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <span
        className={cn(
          "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-semibold tabular-nums",
          tone,
        )}
      >
        <Icon size={12} strokeWidth={2.5} />
        {Math.abs(delta).toLocaleString("es-ES", { maximumFractionDigits: 1 })}%
      </span>
      {deltaLabel ? <span className="whitespace-nowrap text-[10px] text-zinc-400">{deltaLabel}</span> : null}
    </div>
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
  index = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      className={cn(
        "rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-card transition-shadow duration-200 hover:shadow-card-hover",
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
          <p className="text-3xl font-bold tabular-nums tracking-tight text-zinc-900">
            {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
          </p>
          {trend && trend.length > 1 ? <Sparkline data={trend} className="shrink-0" /> : null}
        </div>
      )}
      {detail ? <p className="mt-1 text-xs text-zinc-400">{detail}</p> : null}
    </motion.div>
  );
}
