"use client";

import { motion } from "framer-motion";

import { AnimatedNumber } from "@/components/ui/animated-number";

export function KpiCard({
  label,
  value,
  detail,
  loading,
  index = 0,
}: {
  label: string;
  value: number | string;
  detail?: string;
  loading?: boolean;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-card transition-shadow duration-200 hover:shadow-card-hover"
    >
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">{label}</p>
      {loading ? (
        <div className="mt-3 h-8 w-16 animate-pulse rounded bg-zinc-100" />
      ) : (
        <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-zinc-900">
          {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
        </p>
      )}
      {detail ? <p className="mt-1 text-xs text-zinc-400">{detail}</p> : null}
    </motion.div>
  );
}
