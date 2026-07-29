"use client";

import { useTranslations } from "next-intl";

import type { SchedulesStat } from "@/lib/graphql/types";

// El server emite dayAndTime con formato moment "ddd HH:mm"
const DAY_ORDER: Record<string, number> = {
  mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6,
  lun: 0, mar: 1, mié: 2, mie: 2, jue: 3, vie: 4, sáb: 5, sab: 5, dom: 6,
};

export function OccupancyHeatmap({ stats, loading }: { stats: SchedulesStat[]; loading?: boolean }) {
  const t = useTranslations("dashboard.occupancyHeatmap");
  const DAY_LABELS = Array.from({ length: 7 }, (_, index) => t(`days.${index}`));

  if (loading) {
    return <div className="h-64 animate-pulse rounded-lg bg-zinc-100" />;
  }

  const cells = new Map<string, number>();
  const timesSet = new Set<string>();
  const daysSet = new Set<number>();

  for (const stat of stats) {
    const [dayRaw, time] = stat.dayAndTime.split(" ");
    const day = DAY_ORDER[dayRaw?.toLowerCase().replace(".", "") ?? ""];
    if (day === undefined || !time) continue;
    timesSet.add(time);
    daysSet.add(day);
    cells.set(`${day}-${time}`, stat.ratio);
  }

  const times = [...timesSet].sort();
  const days = [...daysSet].sort((a, b) => a - b);

  if (times.length === 0) {
    return <p className="py-16 text-center text-sm text-zinc-400">{t("empty")}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate" style={{ borderSpacing: 2 }}>
        <thead>
          <tr>
            <th />
            {times.map((time) => (
              <th key={time} className="pb-1 text-center text-[10px] font-normal text-zinc-400">
                {time}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day, dayIndex) => (
            <tr key={day}>
              <td className="pr-2 text-right text-[10px] text-zinc-400">{DAY_LABELS[day]}</td>
              {times.map((time, timeIndex) => {
                const ratio = cells.get(`${day}-${time}`);
                return (
                  <td
                    key={time}
                    title={
                      ratio === undefined
                        ? t("cellEmpty", { day: DAY_LABELS[day], time })
                        : t("cellFilled", { day: DAY_LABELS[day], time, ratio: Math.round(ratio) })
                    }
                    className="h-8 min-w-8 rounded transition-transform duration-150 hover:scale-110"
                    style={{
                      backgroundColor:
                        ratio === undefined
                          ? "rgb(var(--z-100))"
                          : `rgb(var(--primary-chart) / ${Math.max(0.12, Math.min(ratio, 100) / 100)})`,
                      animation: "cell-in 0.4s cubic-bezier(0.16,1,0.3,1) both",
                      animationDelay: `${(dayIndex * times.length + timeIndex) * 8}ms`,
                    }}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-zinc-400">
        <span>0%</span>
        <div className="flex gap-0.5">
          {[0.12, 0.25, 0.5, 0.75, 1].map((alpha) => (
            <span
              key={alpha}
              className="h-3 w-6 rounded-sm"
              style={{ backgroundColor: `rgb(var(--primary-chart) / ${alpha})` }}
            />
          ))}
        </div>
        <span>{t("legendFull")}</span>
      </div>
    </div>
  );
}
