"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { useSession } from "@/components/layout/session-provider";
import { CompanyLogoUpload } from "@/components/settings/company-logo-upload";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { GET_COMPANIES, UPDATE_COMPANY } from "@/lib/graphql/companies";
import type { Company } from "@/lib/graphql/types";

const CONFIG_KEYS = ["pollsEnabled", "productsEnabled", "chatEnabled", "trainingEnabled"] as const;

const OPTION_KEYS = [
  "maxActiveReservations",
  "maxAdvanceBookingDays",
  "fullOpenHours",
  "bookingCutoffMinutes",
  "minBookingsRequired",
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-card">
      <h2 className="mb-6 text-sm font-medium text-zinc-900">{title}</h2>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const t = useTranslations("settings.page");
  const toast = useToast();
  const { user } = useSession();

  const CONFIG_LABELS: Record<(typeof CONFIG_KEYS)[number], string> = {
    pollsEnabled: t("configLabels.pollsEnabled"),
    productsEnabled: t("configLabels.productsEnabled"),
    chatEnabled: t("configLabels.chatEnabled"),
    trainingEnabled: t("configLabels.trainingEnabled"),
  };

  const OPTION_FIELDS = OPTION_KEYS.map((key) => ({ key, label: t(`optionFields.${key}`) }));
  const companyId = user?.activeCompanyId;

  const { data, loading } = useQuery<{ getCompanies: { company: Company | null; companies: Company[] | null } }>(
    GET_COMPANIES,
    { variables: { companyId }, skip: !companyId },
  );

  const company = data?.getCompanies?.company ?? data?.getCompanies?.companies?.[0] ?? null;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    config: { pollsEnabled: true, productsEnabled: true, chatEnabled: true, trainingEnabled: true },
    options: {
      maxActiveReservations: 0,
      maxAdvanceBookingDays: 0,
      sameDayBookingAllowed: true,
      fullOpenHours: 0,
      bookingCutoffMinutes: 0,
      minBookingsRequired: 0,
    },
  });

  useEffect(() => {
    if (!company) return;
    setForm({
      name: company.name,
      email: company.email ?? "",
      phoneNumber: company.phoneNumber ?? "",
      address: company.address ?? "",
      config: {
        pollsEnabled: company.companyConfig?.pollsEnabled ?? true,
        productsEnabled: company.companyConfig?.productsEnabled ?? true,
        chatEnabled: company.companyConfig?.chatEnabled ?? true,
        trainingEnabled: company.companyConfig?.trainingEnabled ?? true,
      },
      options: {
        maxActiveReservations: company.scheduleOptions?.maxActiveReservations ?? 0,
        maxAdvanceBookingDays: company.scheduleOptions?.maxAdvanceBookingDays ?? 0,
        sameDayBookingAllowed: company.scheduleOptions?.sameDayBookingAllowed ?? true,
        fullOpenHours: company.scheduleOptions?.fullOpenHours ?? 0,
        bookingCutoffMinutes: company.scheduleOptions?.bookingCutoffMinutes ?? 0,
        minBookingsRequired: company.scheduleOptions?.minBookingsRequired ?? 0,
      },
    });
  }, [company]);

  const [updateCompany, { loading: saving }] = useMutation(UPDATE_COMPANY);

  const handleSave = async () => {
    if (!companyId) return;
    const { data: result } = await updateCompany({
      variables: {
        companyId,
        companyData: {
          name: form.name,
          email: form.email,
          phoneNumber: form.phoneNumber,
          address: form.address,
          code: company?.code || undefined,
          companyConfig: form.config,
        },
        scheduleOptions: form.options,
      },
    });
    if (result?.updateCompany?.success) {
      toast(t("saved"));
    } else {
      toast(result?.updateCompany?.message ?? t("saveFailed"), "error");
    }
  };

  if (loading && !company) {
    return <div className="h-64 animate-pulse rounded-2xl bg-zinc-100" />;
  }

  return (
    <>
      <div className="space-y-6">
        <Section title={t("companyData")}>
          {company ? (
            <div className="mb-6 border-b border-zinc-100 pb-6">
              <CompanyLogoUpload company={company} />
            </div>
          ) : null}
          <div className="grid gap-5 md:grid-cols-2">
            <Field label={t("name")}>
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </Field>
            <Field label={t("email")}>
              <Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </Field>
            <Field label={t("phone")}>
              <Input value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} />
            </Field>
            <div className="md:col-span-2">
              <Field label={t("address")}>
                <Input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
              </Field>
            </div>
          </div>
        </Section>

        <Section title={t("activeModules")}>
          <div className="grid gap-3 md:grid-cols-2">
            {(Object.keys(CONFIG_LABELS) as (keyof typeof CONFIG_LABELS)[]).map((key) => (
              <label
                key={key}
                className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-3 text-sm text-zinc-700"
              >
                {CONFIG_LABELS[key]}
                <Checkbox
                  checked={form.config[key]}
                  onChange={(event) =>
                    setForm({ ...form, config: { ...form.config, [key]: event.target.checked } })
                  }
                />
              </label>
            ))}
          </div>
        </Section>

        <Section title={t("bookingRules")}>
          <div className="grid gap-5 md:grid-cols-3">
            {OPTION_FIELDS.map(({ key, label }) => (
              <Field key={key} label={label}>
                <Input
                  type="number"
                  min={0}
                  value={form.options[key]}
                  onChange={(event) =>
                    setForm({ ...form, options: { ...form.options, [key]: Number(event.target.value) } })
                  }
                />
              </Field>
            ))}
            <label className="flex items-center gap-2.5 self-end pb-2 text-sm text-zinc-600">
              <Checkbox
                checked={form.options.sameDayBookingAllowed}
                onChange={(event) =>
                  setForm({
                    ...form,
                    options: { ...form.options, sameDayBookingAllowed: event.target.checked },
                  })
                }
              />
              {t("sameDayBooking")}
            </label>
          </div>
        </Section>

        <div className="flex justify-end">
          <Button variant="primary" onClick={handleSave} disabled={saving || !companyId}>
            {saving ? t("saving") : t("saveChanges")}
          </Button>
        </div>
      </div>
    </>
  );
}
