"use client";

import { cn } from "@/lib/cn";
import { formatTime } from "@/lib/format";
import type { Schedule } from "@/lib/graphql/types";

export function occupancyRatio(schedule: Schedule): number {
  if (!schedule.maxUsers) return 0;
  return (schedule.users?.length ?? 0) / schedule.maxUsers;
}

export function ScheduleBlock({
  schedule,
  style,
  onClick,
}: {
  schedule: Schedule;
  style: React.CSSProperties;
  onClick: () => void;
}) {
  const cancelled = schedule.state === "cancelled";
  const ratio = Math.min(occupancyRatio(schedule), 1);

  // El fondo codifica la ocupación con el color de acento del sistema:
  // más asistentes → tinte más intenso. Funciona en claro y oscuro porque
  // --primary-chart ya trae la variante ajustada por tema.
  const blockStyle: React.CSSProperties = cancelled
    ? style
    : {
        ...style,
        backgroundColor: `rgb(var(--primary-chart) / ${(0.12 + ratio * 0.5).toFixed(2)})`,
        borderLeftColor: `rgb(var(--primary-chart) / ${Math.max(0.35, ratio).toFixed(2)})`,
      };

  return (
    <button
      onClick={onClick}
      style={blockStyle}
      title={`${schedule.title} · ${formatTime(schedule.startDate)}–${formatTime(schedule.endDate)} · ${
        schedule.users?.length ?? 0
      }/${schedule.maxUsers} plazas${cancelled ? " · cancelada" : ""}`}
      className={cn(
        "absolute inset-x-1 overflow-hidden rounded-md border-l-2 px-2 py-1 text-left transition-[filter] hover:brightness-95 dark:hover:brightness-110",
        cancelled && "border-red-300 bg-red-50/60 hover:bg-red-50",
      )}
    >
      <p className={cn("truncate text-xs font-medium", cancelled ? "text-red-400 line-through" : "text-zinc-900")}>
        {schedule.title}
      </p>
      <p className={cn("text-[10px] tabular-nums", cancelled ? "text-red-400/80" : "text-zinc-600")}>
        {formatTime(schedule.startDate)} · {schedule.users?.length ?? 0}/{schedule.maxUsers}
      </p>
    </button>
  );
}
