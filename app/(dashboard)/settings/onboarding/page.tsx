"use client";

import { useMutation, useQuery } from "@apollo/client";
import { Copy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useSession } from "@/components/layout/session-provider";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { fullName } from "@/lib/format";
import { GET_COMPANIES, UPDATE_COMPANY } from "@/lib/graphql/companies";
import type { Company, User } from "@/lib/graphql/types";
import { GET_USERS } from "@/lib/graphql/users";

type CompaniesData = { getCompanies: { company: Company | null; companies: Company[] | null } };
type UsersData = { getUsers: { users: User[] | null } };

export default function OnboardingSettingsPage() {
  const toast = useToast();
  const { user } = useSession();
  const companyId = user?.activeCompanyId;
  const [code, setCode] = useState("");

  const { data, loading } = useQuery<CompaniesData>(GET_COMPANIES, {
    variables: { companyId },
    skip: !companyId,
  });
  const company = data?.getCompanies?.company ?? data?.getCompanies?.companies?.[0] ?? null;

  const { data: pendingData } = useQuery<UsersData>(GET_USERS, {
    variables: { page: 0, stateFilter: "pending" },
  });
  const pending = pendingData?.getUsers?.users ?? [];

  useEffect(() => {
    if (company) setCode(company.code ?? "");
  }, [company]);

  const [updateCompany, { loading: saving }] = useMutation(UPDATE_COMPANY);

  const handleCopy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    toast("Código copiado al portapapeles");
  };

  const handleSave = async () => {
    if (!companyId || !company) return;
    const { data: result } = await updateCompany({
      variables: {
        companyId,
        companyData: {
          name: company.name,
          email: company.email,
          phoneNumber: company.phoneNumber,
          address: company.address,
          code: code || undefined,
          companyConfig: company.companyConfig
            ? {
                pollsEnabled: company.companyConfig.pollsEnabled,
                productsEnabled: company.companyConfig.productsEnabled,
                chatEnabled: company.companyConfig.chatEnabled,
                trainingEnabled: company.companyConfig.trainingEnabled,
              }
            : undefined,
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
    if (result?.updateCompany?.success) {
      toast("Código de acceso actualizado");
    } else {
      toast(result?.updateCompany?.message ?? "No se pudo actualizar el código", "error");
    }
  };

  if (loading && !company) {
    return <div className="h-64 animate-pulse rounded-2xl bg-zinc-100" />;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <section className="rounded-2xl border border-zinc-200/80 bg-white shadow-card">
        <header className="border-b border-zinc-100 px-7 py-5">
          <h2 className="text-sm font-semibold text-zinc-900">Código de acceso</h2>
          <p className="text-xs text-zinc-400">Los miembros lo usan en la app para solicitar ingreso</p>
        </header>

        <div className="space-y-5 p-7">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Field label="Código actual">
                <Input
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  className="font-mono tracking-widest"
                />
              </Field>
            </div>
            <Button variant="secondary" onClick={handleCopy} disabled={!code} aria-label="Copiar código">
              <Copy size={14} strokeWidth={1.75} />
              Copiar
            </Button>
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving || !company || code === (company.code ?? "")}
            >
              {saving ? "Guardando…" : "Guardar código"}
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200/80 bg-white shadow-card">
        <header className="border-b border-zinc-100 px-7 py-5">
          <h2 className="text-sm font-semibold text-zinc-900">Solicitudes de ingreso</h2>
          <p className="text-xs text-zinc-400">
            {pending.length === 0
              ? "No hay solicitudes pendientes"
              : `${pending.length} ${pending.length === 1 ? "persona espera" : "personas esperan"} admisión`}
          </p>
        </header>

        <div className="p-7">
          {pending.length === 0 ? (
            <p className="py-4 text-center text-sm text-zinc-400">Todo en orden — nadie en espera</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {pending.slice(0, 5).map((pendingUser) => (
                <li key={pendingUser.id} className="flex items-center gap-3 py-3">
                  <Avatar size="sm" name={fullName(pendingUser)} url={pendingUser.pictureUrl?.url} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900">{fullName(pendingUser)}</p>
                    <p className="truncate text-xs text-zinc-400">{pendingUser.email}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex justify-end">
            <Link href="/members">
              <Button variant="secondary">Gestionar en Miembros</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
