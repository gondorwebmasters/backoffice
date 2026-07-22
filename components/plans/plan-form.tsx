"use client";

import { useMutation } from "@apollo/client";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Field, Input, Textarea } from "@/components/ui/input";
import { SlideOver } from "@/components/ui/slide-over";
import { useToast } from "@/components/ui/toast";
import { CREATE_PLAN, UPDATE_PLAN } from "@/lib/graphql/plans";
import type { Plan } from "@/lib/graphql/types";

const INTERVAL_OPTIONS = [
  { value: "day", label: "Diario" },
  { value: "week", label: "Semanal" },
  { value: "month", label: "Mensual" },
  { value: "year", label: "Anual" },
];

const EMPTY_FORM = {
  name: "",
  description: "",
  amount: "",
  interval: "month",
  trialPeriodDays: "",
  features: "",
};

interface PlanFormProps {
  open: boolean;
  plan: Plan | null; // null = crear
  onClose: () => void;
  onSaved: () => void;
}

export function PlanForm({ open, plan, onClose, onSaved }: PlanFormProps) {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (plan) {
      setForm({
        name: plan.name,
        description: plan.description ?? "",
        amount: String(plan.amount / 100),
        interval: plan.interval,
        trialPeriodDays: plan.trialPeriodDays ? String(plan.trialPeriodDays) : "",
        features: (plan.features ?? []).join("\n"),
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [plan, open]);

  const [createPlan, createState] = useMutation(CREATE_PLAN);
  const [updatePlan, updateState] = useMutation(UPDATE_PLAN);
  const loading = createState.loading || updateState.loading;

  const set = (key: keyof typeof form) => (value: string) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async () => {
    const amountInCents = Math.round(Number(form.amount.replace(",", ".")) * 100);
    const features = form.features
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (plan) {
      const { data } = await updatePlan({
        variables: {
          plan: {
            id: plan.id,
            name: form.name,
            description: form.description || undefined,
            amount: amountInCents,
            features,
          },
        },
      });
      if (data?.updatePlan?.success) {
        toast("Plan actualizado");
        onSaved();
        onClose();
      } else {
        toast(data?.updatePlan?.message ?? "No se pudo actualizar", "error");
      }
    } else {
      const { data } = await createPlan({
        variables: {
          plan: {
            name: form.name,
            description: form.description || undefined,
            amount: amountInCents,
            interval: form.interval,
            trialPeriodDays: form.trialPeriodDays ? Number(form.trialPeriodDays) : undefined,
            features,
          },
        },
      });
      if (data?.createPlan?.success) {
        toast("Plan creado");
        onSaved();
        onClose();
      } else {
        toast(data?.createPlan?.message ?? "No se pudo crear", "error");
      }
    }
  };

  const valid = form.name && Number(form.amount.replace(",", ".")) > 0;

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title={plan ? `Editar ${plan.name}` : "Nuevo plan"}
      subtitle={plan ? "El intervalo de cobro no puede cambiarse" : "Plan de suscripción para los miembros"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!valid || loading}>
            {loading ? "Guardando…" : plan ? "Guardar cambios" : "Crear plan"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Nombre">
          <Input value={form.name} onChange={(event) => set("name")(event.target.value)} />
        </Field>
        <Field label="Descripción">
          <Textarea value={form.description} onChange={(event) => set("description")(event.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Precio (€)">
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.amount}
              onChange={(event) => set("amount")(event.target.value)}
            />
          </Field>
          <Field label="Intervalo">
            <Dropdown
              options={INTERVAL_OPTIONS}
              value={form.interval}
              onChange={set("interval")}
              disabled={Boolean(plan)}
            />
          </Field>
        </div>
        {!plan ? (
          <Field label="Días de prueba" hint="Opcional">
            <Input
              type="number"
              min={0}
              value={form.trialPeriodDays}
              onChange={(event) => set("trialPeriodDays")(event.target.value)}
            />
          </Field>
        ) : null}
        <Field label="Características" hint="Una por línea">
          <Textarea rows={4} value={form.features} onChange={(event) => set("features")(event.target.value)} />
        </Field>
      </div>
    </SlideOver>
  );
}
