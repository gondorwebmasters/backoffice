"use client";

import { Moon, Sun, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/cn";
import { formatTime } from "@/lib/format";
import type { Schedule } from "@/lib/graphql/types";

export function occupancyRatio(schedule: Schedule): number {
  if (!schedule.maxUsers) return 0;
  return (schedule.users?.length ?? 0) / schedule.maxUsers;
}

/** Franja mañana (sol) antes de las 14:00, tarde/noche (luna) después. */
function isMorning(startDate: string): boolean {
  const hour = new Date(startDate).getHours();
  return hour < 14;
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
  const t = useTranslations("calendar.scheduleBlock");
  const cancelled = schedule.state === "cancelled";
  const attendees = schedule.users?.length ?? 0;
  const ratio = Math.min(occupancyRatio(schedule), 1);
  const full = !cancelled && ratio >= 1;
  const morning = isMorning(schedule.startDate);

  // Alto disponible en px (WeekView siempre pasa un número): decide qué
  // líneas caben sin comprimir el line-height del resto (evita solapes).
  const boxHeight = typeof style.height === "number" ? style.height : 48;
  const showTime = boxHeight >= 34;
  const showFooter = !cancelled && boxHeight >= 50;

  // El fondo codifica la ocupación con el color de acento del sistema:
  // más asistentes → tinte más intenso. Funciona en claro y oscuro porque
  // --primary-chart ya trae la variante ajustada por tema.
  const blockStyle: React.CSSProperties = cancelled
    ? style
    : {
        ...style,
        backgroundColor: `rgb(var(--primary-chart) / ${(0.1 + ratio * 0.16).toFixed(2)})`,
      };

  return (
    <Tooltip
      content={
        <div>
          <p className={cn("font-semibold text-zinc-900", cancelled && "text-red-400 line-through")}>
            {schedule.title}
          </p>
          <p className="mt-0.5 tabular-nums text-zinc-500">
            {formatTime(schedule.startDate)}–{formatTime(schedule.endDate)} · {morning ? t("morningShift") : t("afternoonShift")}
          </p>
          {!cancelled ? (
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="flex-1 overflow-hidden rounded-full bg-zinc-100">
                <span
                  className={cn("block h-1.5 rounded-full", full ? "bg-amber-500" : "bg-primary")}
                  style={{ width: `${ratio * 100}%` }}
                />
              </span>
              <span className="shrink-0 tabular-nums text-zinc-500">
                {attendees}/{schedule.maxUsers}
              </span>
            </div>
          ) : (
            <p className="mt-1 font-medium text-red-400">{t("cancelled")}</p>
          )}
        </div>
      }
    >
      <button
        onClick={onClick}
        style={blockStyle}
        className={cn(
          // Tarjeta "elevada" sobre la cuadrícula (sin acento lateral de color):
          // el box-shadow en capas + el lift en hover dan la sensación 3D.
          "group absolute inset-x-1 flex flex-col items-stretch overflow-hidden rounded-xl border border-black/[0.06] bg-white px-2.5 py-1 text-left transition-all duration-200 ease-out",
          "hover:z-10 hover:-translate-y-[3px] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          cancelled
            ? "bg-red-50/70 shadow-[0_1px_2px_rgb(2_6_23/0.06)] hover:bg-red-50"
            : cn(
                "shadow-[0_1px_2px_rgb(2_6_23/0.08),0_4px_8px_-2px_rgb(2_6_23/0.12)]",
                "hover:shadow-[0_2px_4px_rgb(2_6_23/0.1),0_14px_24px_-8px_rgb(2_6_23/0.24)]",
                "dark:bg-zinc-900/60 dark:border-white/[0.06]",
              ),
        )}
      >
        <p
          className={cn(
            "flex shrink-0 items-center gap-1 truncate text-xs font-semibold leading-none",
            cancelled ? "text-red-400 line-through" : "text-zinc-900",
          )}
        >
          {morning ? (
            <Sun size={11} strokeWidth={2} className={cn("shrink-0", cancelled ? "text-red-300" : "text-zinc-400")} aria-hidden />
          ) : (
            <Moon size={11} strokeWidth={2} className={cn("shrink-0", cancelled ? "text-red-300" : "text-zinc-400")} aria-hidden />
          )}
          <span className="truncate">{schedule.title}</span>
        </p>
        {showTime ? (
          <p
            className={cn(
              "mt-1 shrink-0 truncate text-[10px] leading-none tabular-nums",
              cancelled ? "text-red-400/80" : "text-zinc-500",
            )}
          >
            {formatTime(schedule.startDate)}–{formatTime(schedule.endDate)}
          </p>
        ) : null}

        {showFooter ? (
          <>
            <span
              className={cn(
                "mt-auto flex shrink-0 items-center gap-1 pt-1 text-[10px] font-medium leading-none tabular-nums",
                full ? "text-amber-600" : "text-zinc-400 group-hover:text-zinc-600",
              )}
            >
              <Users size={10} strokeWidth={2} />
              {attendees}/{schedule.maxUsers}
            </span>
            <span className="mt-0.5 block h-[3px] w-full shrink-0 overflow-hidden rounded-full bg-zinc-900/[0.06]">
              <span
                className={cn("block h-full rounded-full transition-[width] duration-300", full ? "bg-amber-500" : "bg-primary")}
                style={{ width: `${ratio * 100}%` }}
              />
            </span>
          </>
        ) : null}
      </button>
    </Tooltip>
  );
}