"use client";

import { cn } from "@/lib/cn";
import { addDays, DAYS_SHORT } from "@/lib/format";
import type { Schedule } from "@/lib/graphql/types";

import { ScheduleBlock } from "./schedule-block";

const HOUR_HEIGHT = 56;

function NowIndicator({ top }: { top: number }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{ top }}>
      <span className="h-2 w-2 shrink-0 rounded-full bg-primary ring-4 ring-primary/20" style={{ marginLeft: -4 }} />
      <span className="h-px flex-1 bg-primary/70" />
    </div>
  );
}

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
  const now = new Date();
  const today = now.toDateString();

  const parsed = schedules
    .map((schedule) => ({ schedule, start: new Date(schedule.startDate), end: new Date(schedule.endDate) }))
    .filter(({ start }) => !isNaN(start.getTime()));

  const hours = parsed.flatMap(({ start, end }) => [start.getHours(), end.getHours() + 1]);
  const firstHour = Math.min(8, ...(hours.length ? [Math.min(...hours)] : []));
  const lastHour = Math.max(22, ...(hours.length ? [Math.max(...hours)] : []));
  const hourRange = Array.from({ length: lastHour - firstHour }, (_, index) => firstHour + index);
  const nowTop = ((now.getHours() + now.getMinutes() / 60 - firstHour) * HOUR_HEIGHT);
  const showNowLine = nowTop >= 0 && nowTop <= hourRange.length * HOUR_HEIGHT;

  if (loading && schedules.length === 0) {
    return <div className="h-96 animate-pulse rounded-2xl bg-zinc-100 shadow-card" />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-card">
      <div className="max-h-[640px] overflow-auto">
        <div className="grid min-w-[900px]" style={{ gridTemplateColumns: "3.5rem repeat(7, 1fr)" }}>
        <div className="sticky top-0 z-20 border-b border-zinc-100 bg-white" />
        {days.map((day, index) => {
          const isToday = day.toDateString() === today;
          return (
            <div
              key={index}
              className={cn(
                "sticky top-0 z-20 border-b border-l border-zinc-100 bg-white px-3 py-3 text-center transition-colors",
                isToday && "bg-primary/[0.04]",
              )}
            >
              <p
                className={cn(
                  "text-[10px] font-medium uppercase tracking-wider",
                  isToday ? "text-primary" : "text-zinc-400",
                )}
              >
                {DAYS_SHORT[index]}
              </p>
              <p
                className={cn(
                  "mx-auto mt-1 flex h-6 w-6 items-center justify-center rounded-full text-sm tabular-nums",
                  isToday ? "bg-primary font-semibold text-primary-foreground shadow-sm shadow-primary/30" : "text-zinc-600",
                )}
              >
                {day.getDate()}
              </p>
            </div>
          );
        })}

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
          const isToday = day.toDateString() === today;
          const daySchedules = parsed.filter(({ start }) => start.toDateString() === day.toDateString());
          return (
            <div
              key={dayIndex}
              className={cn("relative border-l border-zinc-100", isToday && "bg-primary/[0.02]")}
              style={{ height: hourRange.length * HOUR_HEIGHT }}
            >
              {hourRange.map((hour) => (
                <div key={hour} className="border-b border-zinc-50" style={{ height: HOUR_HEIGHT }} />
              ))}
              {isToday && showNowLine ? <NowIndicator top={nowTop} /> : null}
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
    </div>
  );
}