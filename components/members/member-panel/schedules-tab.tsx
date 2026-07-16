"use client";

import { useQuery } from "@apollo/client";
import { useState } from "react";

import { BadgeDot } from "@/components/ui/badge-dot";
import { Tabs } from "@/components/ui/tabs";
import { formatDateTime } from "@/lib/format";
import { GET_USER_SCHEDULES } from "@/lib/graphql/schedules";
import type { Schedule } from "@/lib/graphql/types";

export function SchedulesTab({ userId }: { userId: string }) {
  const [view, setView] = useState("upcoming");

  const { data, loading } = useQuery<{ getUserSchedules: { schedules: Schedule[] | null } }>(
    GET_USER_SCHEDULES,
    { variables: { userId, past: view === "past" } },
  );

  const schedules = data?.getUserSchedules?.schedules ?? [];

  return (
    <div className="space-y-4">
      <Tabs
        items={[
          { value: "upcoming", label: "Próximas" },
          { value: "past", label: "Pasadas" },
        ]}
        value={view}
        onChange={setView}
      />
      {loading && !data ? (
        <div className="h-24 animate-pulse rounded-lg bg-zinc-50" />
      ) : schedules.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-400">Sin clases</p>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {schedules.map((schedule) => (
            <li key={schedule.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-zinc-700">{schedule.title}</p>
                <p className="text-xs text-zinc-400">{formatDateTime(schedule.startDate)}</p>
              </div>
              <BadgeDot
                tone={schedule.state === "cancelled" ? "negative" : "positive"}
                label={schedule.state === "cancelled" ? "Cancelada" : "Disponible"}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
