"use client";

import { CalendarDays } from "lucide-react";
import { es, pt } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/cn";

import { Popover } from "./popover";

const DATE_FNS_LOCALES: Record<string, typeof es> = { es, pt };
const INTL_LOCALE: Record<string, string> = { es: "es-ES", pt: "pt-PT" };

interface DatePickerProps {
  /** Fecha en formato `YYYY-MM-DD`, o vacío para "sin selección". */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Añade selector de hora; el valor pasa a formato `YYYY-MM-DDTHH:mm` (como `datetime-local`). */
  withTime?: boolean;
}

function parseISODate(value: string): Date | undefined {
  if (!value) return undefined;
  const [datePart, timePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  if (timePart) {
    const [hours, minutes] = timePart.split(":").map(Number);
    return new Date(year, month - 1, day, hours || 0, minutes || 0);
  }
  return new Date(year, month - 1, day);
}

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toTimeString(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

const DAY_PICKER_CLASS_NAMES = {
  months: "flex flex-col gap-4",
  month: "space-y-3",
  month_caption: "flex items-center justify-center px-9 text-sm font-medium text-zinc-900",
  nav: "flex items-center justify-between",
  button_previous:
    "absolute left-1 flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-900 disabled:pointer-events-none disabled:opacity-30",
  button_next:
    "absolute right-1 flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-900 disabled:pointer-events-none disabled:opacity-30",
  month_grid: "w-full border-collapse",
  weekdays: "flex",
  weekday: "w-9 text-center text-[10px] font-medium uppercase tracking-wider text-zinc-400",
  week: "flex w-full",
  day: "relative flex h-9 w-9 items-center justify-center p-0 text-center",
  day_button:
    "flex h-8 w-8 items-center justify-center rounded-lg text-sm text-zinc-700 transition-colors hover:bg-zinc-50",
  selected: "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:font-semibold [&>button]:hover:bg-primary",
  today: "[&>button]:font-semibold [&>button]:text-primary",
  outside: "[&>button]:text-zinc-300",
  disabled: "[&>button]:pointer-events-none [&>button]:opacity-30",
  hidden: "invisible",
};

/**
 * Selector de fecha (y hora opcional) moderno: trigger tipo input + calendario
 * en popover (react-day-picker), reemplazo de `<input type="date"/"datetime-local">`.
 */
export function DatePicker({
  value,
  onChange,
  placeholder,
  className,
  withTime = false,
}: DatePickerProps) {
  const t = useTranslations("ui.datePicker");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const selected = parseISODate(value);

  const commit = (date: Date) => {
    onChange(withTime ? `${toISODate(date)}T${toTimeString(date)}` : toISODate(date));
  };

  return (
    <Popover
      open={open}
      onClose={() => setOpen(false)}
      align="start"
      className={className}
      panelClassName="p-3"
      trigger={
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm shadow-sm transition-colors hover:border-zinc-300",
            selected ? "text-zinc-900" : "text-zinc-400",
          )}
        >
          <span className="truncate">
            {selected
              ? selected.toLocaleDateString(INTL_LOCALE[locale] ?? locale, {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
                })
              : (placeholder ?? t("selectDate"))}
          </span>
          <CalendarDays size={14} strokeWidth={1.5} className="shrink-0 text-zinc-400" />
        </button>
      }
    >
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={(date) => {
          if (!date) return;
          if (selected) {
            date.setHours(selected.getHours(), selected.getMinutes());
          }
          commit(date);
          if (!withTime) setOpen(false);
        }}
        locale={DATE_FNS_LOCALES[locale] ?? es}
        weekStartsOn={1}
        showOutsideDays
        classNames={DAY_PICKER_CLASS_NAMES}
      />
      {withTime ? (
        <div className="mt-2 flex items-center gap-2 border-t border-zinc-100 pt-3">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">{t("time")}</span>
          <input
            type="time"
            value={selected ? toTimeString(selected) : "00:00"}
            onChange={(event) => {
              const [hours, minutes] = event.target.value.split(":").map(Number);
              const base = selected ?? new Date();
              base.setHours(hours || 0, minutes || 0);
              commit(base);
            }}
            className="h-8 flex-1 rounded-lg border border-zinc-200 bg-white px-2 text-sm text-zinc-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>
      ) : null}
    </Popover>
  );
}
