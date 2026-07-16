"use client";

import { useMutation } from "@apollo/client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { CREATE_COMPANY, UPDATE_COMPANY } from "@/lib/graphql/companies";
import type { Company } from "@/lib/graphql/types";

const CONFIG_LABELS = {
  pollsEnabled: "Encuestas",
  productsEnabled: "Tienda de productos",
  chatEnabled: "Chat",
  trainingEnabled: "Entrenamiento",
} as const;

export function CreateCompanyForm({ onDone }: { onDone: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", phoneNumber: "", address: "" });
  const [createCompany, { loading }] = useMutation(CREATE_COMPANY);

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const { data } = await createCompany({ variables: { company: form } });
      if (data?.createCompany?.success) {
        toast("Empresa creada");
        onDone();
      } else {
        toast(data?.createCompany?.message ?? "No se pudo crear la empresa", "error");
      }
    } catch {
      toast("No se pudo crear la empresa", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Nombre">
        <Input value={form.name} onChange={set("name")} required autoFocus />
      </Field>
      <Field label="Email">
        <Input type="email" value={form.email} onChange={set("email")} required />
      </Field>
      <Field label="Teléfono">
        <Input type="tel" value={form.phoneNumber} onChange={set("phoneNumber")} required />
      </Field>
      <Field label="Dirección">
        <Input value={form.address} onChange={set("address")} required />
      </Field>
      <div className="flex justify-end pt-1">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Creando…" : "Crear empresa"}
        </Button>
      </div>
    </form>
  );
}

export function EditCompanyForm({ company, onDone }: { company: Company; onDone: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: company.name,
    email: company.email ?? "",
    phoneNumber: company.phoneNumber ?? "",
    address: company.address ?? "",
    code: company.code ?? "",
    config: {
      pollsEnabled: company.companyConfig?.pollsEnabled ?? true,
      productsEnabled: company.companyConfig?.productsEnabled ?? true,
      chatEnabled: company.companyConfig?.chatEnabled ?? true,
      trainingEnabled: company.companyConfig?.trainingEnabled ?? true,
    },
  });
  const [updateCompany, { loading }] = useMutation(UPDATE_COMPANY);

  const set = (key: "name" | "email" | "phoneNumber" | "address" | "code") =>
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const { data } = await updateCompany({
        variables: {
          companyId: company.id,
          companyData: {
            name: form.name,
            email: form.email,
            phoneNumber: form.phoneNumber,
            address: form.address,
            code: form.code || undefined,
            companyConfig: form.config,
          },
          scheduleOptions: {
            maxActiveReservations: company.scheduleOptions?.maxActiveReservations,
            maxAdvanceBookingDays: company.scheduleOptions?.maxAdvanceBookingDays,
            sameDayBookingAllowed: company.scheduleOptions?.sameDayBookingAllowed,
            fullOpenHours: company.scheduleOptions?.fullOpenHours,
            bookingCutoffMinutes: company.scheduleOptions?.bookingCutoffMinutes,
            minBookingsRequired: company.scheduleOptions?.minBookingsRequired,
          },
        },
      });
      if (data?.updateCompany?.success) {
        toast("Empresa actualizada");
        onDone();
      } else {
        toast(data?.updateCompany?.message ?? "No se pudo actualizar la empresa", "error");
      }
    } catch {
      toast("No se pudo actualizar la empresa", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Nombre">
        <Input value={form.name} onChange={set("name")} required />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email">
          <Input type="email" value={form.email} onChange={set("email")} />
        </Field>
        <Field label="Teléfono">
          <Input type="tel" value={form.phoneNumber} onChange={set("phoneNumber")} />
        </Field>
      </div>
      <Field label="Dirección">
        <Input value={form.address} onChange={set("address")} />
      </Field>
      <Field label="Código de acceso" hint="Los miembros lo usan para solicitar ingreso">
        <Input value={form.code} onChange={set("code")} className="font-mono tracking-widest" />
      </Field>

      <div className="space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Módulos activos</span>
        <div className="grid gap-2.5">
          {(Object.keys(CONFIG_LABELS) as (keyof typeof CONFIG_LABELS)[]).map((key) => (
            <label
              key={key}
              className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-2.5 text-sm text-zinc-700"
            >
              {CONFIG_LABELS[key]}
              <Checkbox
                checked={form.config[key]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    config: { ...current.config, [key]: event.target.checked },
                  }))
                }
              />
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
