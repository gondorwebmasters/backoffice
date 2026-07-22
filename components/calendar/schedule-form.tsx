"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useState } from "react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Dropdown } from "@/components/ui/dropdown";
import { Field, Input, Textarea } from "@/components/ui/input";
import { SlideOver } from "@/components/ui/slide-over";
import { useToast } from "@/components/ui/toast";
import { fullName } from "@/lib/format";
import { CREATE_SCHEDULE } from "@/lib/graphql/schedules";
import type { User } from "@/lib/graphql/types";
import { GET_USERS } from "@/lib/graphql/users";

// Convención del server: 0 = domingo … 6 = sábado (ver DAY_MAPPING en la app móvil)
const DAYS = [
  { value: 1, label: "L" },
  { value: 2, label: "M" },
  { value: 3, label: "X" },
  { value: 4, label: "J" },
  { value: 5, label: "V" },
  { value: 6, label: "S" },
  { value: 0, label: "D" },
];

const TYPE_OPTIONS = [
  { value: "standard", label: "Estándar" },
  { value: "sparring", label: "Sparring" },
  { value: "free", label: "Libre" },
  { value: "conditioning", label: "Acondicionamiento" },
  { value: "competition", label: "Competición" },
];

const EMPTY_FORM = {
  title: "",
  description: "",
  type: "standard",
  startHour: "09:00",
  endHour: "10:00",
  maxUsers: "15",
  admin: "",
  repeat: false,
  date: "",
  days: [] as number[],
};

interface ScheduleFormProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function ScheduleForm({ open, onClose, onCreated }: ScheduleFormProps) {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);

  const trainers = useQuery<{ getUsers: { users: User[] | null } }>(GET_USERS, {
    variables: { roleFilter: ["admin", "coach"] },
    skip: !open,
  });

  const [createSchedule, { loading }] = useMutation(CREATE_SCHEDULE);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const toggleDay = (day: number) =>
    set(
      "days",
      form.days.includes(day) ? form.days.filter((value) => value !== day) : [...form.days, day],
    );

  const valid =
    form.title &&
    form.description &&
    form.admin &&
    Number(form.maxUsers) > 0 &&
    (form.repeat ? form.days.length > 0 : Boolean(form.date));

  const handleSubmit = async () => {
    const { data } = await createSchedule({
      variables: {
        schedule: {
          title: form.title,
          description: form.description,
          type: form.type,
          startHour: form.startHour,
          endHour: form.endHour,
          maxUsers: Number(form.maxUsers),
          admin: form.admin,
          repeat: form.repeat,
          days: form.repeat ? form.days : form.date ? [new Date(form.date).getDay()] : [],
          date: form.repeat ? undefined : form.date,
        },
      },
    });
    const result = data?.createSchedule;
    if (result?.success) {
      toast("Clase creada");
      setForm(EMPTY_FORM);
      onCreated();
      onClose();
    } else {
      toast(result?.message ?? "No se pudo crear la clase", "error");
    }
  };

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title="Nueva clase"
      subtitle={form.repeat ? "Serie recurrente semanal" : "Clase puntual"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!valid || loading}>
            {loading ? "Creando…" : "Crear clase"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Título">
          <Input value={form.title} onChange={(event) => set("title", event.target.value)} />
        </Field>
        <Field label="Descripción">
          <Textarea value={form.description} onChange={(event) => set("description", event.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tipo">
            <Dropdown options={TYPE_OPTIONS} value={form.type} onChange={(value) => set("type", value)} />
          </Field>
          <Field label="Plazas">
            <Input
              type="number"
              min={1}
              value={form.maxUsers}
              onChange={(event) => set("maxUsers", event.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Hora inicio">
            <Input type="time" value={form.startHour} onChange={(event) => set("startHour", event.target.value)} />
          </Field>
          <Field label="Hora fin">
            <Input type="time" value={form.endHour} onChange={(event) => set("endHour", event.target.value)} />
          </Field>
        </div>
        <Field label="Entrenador">
          <Dropdown
            options={(trainers.data?.getUsers?.users ?? []).map((user) => ({
              value: user.id,
              label: fullName(user),
            }))}
            placeholder="Selecciona…"
            searchable
            value={form.admin}
            onChange={(value) => set("admin", value)}
          />
        </Field>

        <label className="flex items-center gap-2.5 text-sm text-zinc-600">
          <input
            type="checkbox"
            checked={form.repeat}
            onChange={(event) => set("repeat", event.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 accent-zinc-900"
          />
          Repetir semanalmente
        </label>

        {form.repeat ? (
          <Field label="Días de la semana">
            <div className="flex gap-2">
              {DAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={cn(
                    "h-9 w-9 rounded-lg border text-sm transition-colors",
                    form.days.includes(day.value)
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 text-zinc-500 hover:border-zinc-400",
                  )}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </Field>
        ) : (
          <Field label="Fecha">
            <DatePicker value={form.date} onChange={(value) => set("date", value)} />
          </Field>
        )}
      </div>
    </SlideOver>
  );
}
