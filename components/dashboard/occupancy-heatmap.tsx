"use client";

import type { SchedulesStat } from "@/lib/graphql/types";

// El server emite dayAndTime con formato moment "ddd HH:mm"
const DAY_ORDER: Record<string, number> = {
  mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6,
  lun: 0, mar: 1, mié: 2, mie: 2, jue: 3, vie: 4, sáb: 5, sab: 5, dom: 6,
};

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function OccupancyHeatmap({ stats, loading }: { stats: SchedulesStat[]; loading?: boolean }) {
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
    return <p className="py-16 text-center text-sm text-zinc-400">Sin clases este mes</p>;
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
          {days.map((day) => (
            <tr key={day}>
              <td className="pr-2 text-right text-[10px] text-zinc-400">{DAY_LABELS[day]}</td>
              {times.map((time) => {
                const ratio = cells.get(`${day}-${time}`);
                return (
                  <td
                    key={time}
                    title={
                      ratio === undefined
                        ? `${DAY_LABELS[day]} ${time} · sin clases`
                        : `${DAY_LABELS[day]} ${time} · ${Math.round(ratio)}% de ocupación media`
                    }
                    className="h-8 min-w-8 rounded"
                    style={{
                      backgroundColor:
                        ratio === undefined
                          ? "rgb(var(--z-100))"
                          : `rgb(var(--primary-chart) / ${Math.max(0.12, Math.min(ratio, 100) / 100)})`,
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
        <span>100% ocupación</span>
      </div>
    </div>
  );
}
