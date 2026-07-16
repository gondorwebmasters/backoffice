"use client";

import { cn } from "@/lib/cn";
import { addDays, DAYS_SHORT } from "@/lib/format";
import type { Schedule } from "@/lib/graphql/types";

import { ScheduleBlock } from "./schedule-block";

const HOUR_HEIGHT = 56;

export function WeekView({
  weekStart,
  schedules,
  loading,
  onSelect,
}: {
  weekStart: Date;
  schedules: Schedule[];
  loading?: boolean;
  onSelect: (schedule: Schedule) => void;
}) {
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const today = new Date().toDateString();

  const parsed = schedules
    .map((schedule) => ({ schedule, start: new Date(schedule.startDate), end: new Date(schedule.endDate) }))
    .filter(({ start }) => !isNaN(start.getTime()));

  const hours = parsed.flatMap(({ start, end }) => [start.getHours(), end.getHours() + 1]);
  const firstHour = Math.min(8, ...(hours.length ? [Math.min(...hours)] : []));
  const lastHour = Math.max(22, ...(hours.length ? [Math.max(...hours)] : []));
  const hourRange = Array.from({ length: lastHour - firstHour }, (_, index) => firstHour + index);

  if (loading && schedules.length === 0) {
    return <div className="h-96 animate-pulse rounded-xl bg-zinc-100" />;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200/80 bg-white shadow-card">
      <div className="grid min-w-[900px]" style={{ gridTemplateColumns: "3.5rem repeat(7, 1fr)" }}>
        <div />
        {days.map((day, index) => (
          <div
            key={index}
            className={cn(
              "border-b border-l border-zinc-100 px-3 py-3 text-center",
              day.toDateString() === today && "bg-zinc-50",
            )}
          >
            <p className="text-[10px] uppercase tracking-wider text-zinc-400">{DAYS_SHORT[index]}</p>
            <p
              className={cn(
                "mt-0.5 text-sm tabular-nums",
                day.toDateString() === today ? "font-semibold text-zinc-900" : "text-zinc-600",
              )}
            >
              {day.getDate()}
            </p>
          </div>
        ))}

        <div className="relative">
          {hourRange.map((hour) => (
            <div
              key={hour}
              className="pr-2 text-right text-[10px] tabular-nums text-zinc-400"
              style={{ height: HOUR_HEIGHT }}
            >
              {String(hour).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {days.map((day, dayIndex) => {
          const daySchedules = parsed.filter(({ start }) => start.toDateString() === day.toDateString());
          return (
            <div
              key={dayIndex}
              className={cn("relative border-l border-zinc-100", day.toDateString() === today && "bg-zinc-50/50")}
              style={{ height: hourRange.length * HOUR_HEIGHT }}
            >
              {hourRange.map((hour) => (
                <div key={hour} className="border-b border-zinc-50" style={{ height: HOUR_HEIGHT }} />
              ))}
              {daySchedules.map(({ schedule, start, end }) => {
                const top = ((start.getHours() + start.getMinutes() / 60 - firstHour) * HOUR_HEIGHT);
                const height = Math.max(
                  ((end.getTime() - start.getTime()) / 3_600_000) * HOUR_HEIGHT - 2,
                  24,
                );
                return (
                  <ScheduleBlock
                    key={schedule.id}
                    schedule={schedule}
                    style={{ top, height }}
                    onClick={() => onSelect(schedule)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
