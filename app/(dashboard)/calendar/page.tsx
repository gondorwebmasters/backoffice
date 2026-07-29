"use client";

import { useQuery } from "@apollo/client";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { ScheduleForm } from "@/components/calendar/schedule-form";
import { SchedulePanel } from "@/components/calendar/schedule-panel";
import { WeekView } from "@/components/calendar/week-view";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/sticky-header";
import { addDays, startOfWeek, toISODate } from "@/lib/format";
import { GET_SCHEDULES_RANGE } from "@/lib/graphql/schedules";
import type { Schedule } from "@/lib/graphql/types";

const INTL_LOCALE: Record<string, string> = { es: "es-ES", pt: "pt-PT" };

export default function CalendarPage() {
  const t = useTranslations("calendar");
  const locale = useLocale();
  const intlLocale = INTL_LOCALE[locale] ?? locale;
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const { data, loading, refetch } = useQuery<{ getSchedulesRange: { schedules: Schedule[] | null } }>(
    GET_SCHEDULES_RANGE,
    {
      variables: {
        startDate: toISODate(weekStart),
        endDate: toISODate(addDays(weekStart, 7)),
      },
    },
  );

  const schedules = useMemo(() => data?.getSchedulesRange?.schedules ?? [], [data]);
  const selected = schedules.find((schedule) => schedule.id === selectedId) ?? null;

  const weekLabel = `${weekStart.toLocaleDateString(intlLocale, { day: "numeric", month: "short" })} – ${addDays(
    weekStart,
    6,
  ).toLocaleDateString(intlLocale, { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <>
      <PageShell
        header={
          <>
            <PageHeader
              title={t("title")}
              subtitle={t("subtitle")}
              actions={
                <Button variant="primary" onClick={() => setCreating(true)}>
                  <Plus size={15} strokeWidth={1.5} />
                  {t("newClass")}
                </Button>
              }
            />

            <div className="mb-5 flex items-center gap-3">
              <Button size="sm" variant="ghost" onClick={() => setWeekStart((date) => addDays(date, -7))}>
                <ChevronLeft size={15} strokeWidth={1.5} />
              </Button>
              <span className="min-w-48 text-center text-sm font-medium capitalize text-zinc-900">{weekLabel}</span>
              <Button size="sm" variant="ghost" onClick={() => setWeekStart((date) => addDays(date, 7))}>
                <ChevronRight size={15} strokeWidth={1.5} />
              </Button>
              <Button size="sm" onClick={() => setWeekStart(startOfWeek(new Date()))}>
                {t("today")}
              </Button>
            </div>
          </>
        }
      >
        <WeekView weekStart={weekStart} schedules={schedules} loading={loading} onSelect={(schedule) => setSelectedId(schedule.id)} />
      </PageShell>

      <SchedulePanel schedule={selected} onClose={() => setSelectedId(null)} onChanged={() => refetch()} />
      <ScheduleForm open={creating} onClose={() => setCreating(false)} onCreated={() => refetch()} />
    </>
  );
}
