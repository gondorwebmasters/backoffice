"use client";

import { useMutation } from "@apollo/client";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dropdown } from "@/components/ui/dropdown";
import { Field, Input, Textarea } from "@/components/ui/input";
import { SlideOver } from "@/components/ui/slide-over";
import { useToast } from "@/components/ui/toast";
import { planPriceCents } from "@/lib/format";
import { CREATE_PLAN, UPDATE_PLAN } from "@/lib/graphql/plans";
import type { Plan } from "@/lib/graphql/types";

const INTERVAL_VALUES = ["day", "week", "month", "year"] as const;

const SUPPORT_LEVEL_VALUES = ["email", "chat", "phone"] as const;

const PERMISSION_ACTIONS = ["create", "read", "update", "delete", "manage"] as const;

const PERMISSION_MODULES = [
  "users",
  "schedules",
  "payments",
  "settings",
  "promotions",
  "chats",
  "polls",
  "workouts",
  "plans",
  "products",
  "user_weights",
  "stats",
  "companies",
  "subscriptions",
  "transactions",
  "invoices",
] as const;

const STANDARD_PERMISSIONS = ["schedules:read", "users:read", "polls:read"];
const PREMIUM_PERMISSIONS = [
  ...STANDARD_PERMISSIONS,
  "workouts:read",
  "user_weights:read",
  "user_weights:create",
  "user_weights:update",
  "user_weights:delete",
];

const EMPTY_FORM = {
  name: "",
  description: "",
  amount: "",
  interval: "month",
  trialPeriodDays: "",
  features: [] as string[],
  maxUsers: "",
  supportLevel: "email",
  permissions: STANDARD_PERMISSIONS as string[],
};

function FeatureListInput({
  features,
  onChange,
  placeholder,
}: {
  features: string[];
  onChange: (features: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const addFeature = () => {
    const value = draft.trim();
    if (!value) return;
    onChange([...features, value]);
    setDraft("");
  };

  const removeFeature = (index: number) => {
    onChange(features.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {features.length > 0 ? (
        <ul className="space-y-1.5">
          {features.map((feature, index) => (
            <li
              key={index}
              className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-700"
            >
              <span className="truncate">{feature}</span>
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="shrink-0 text-zinc-400 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex gap-2">
        <Input
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addFeature();
            }
          }}
        />
        <Button type="button" variant="secondary" onClick={addFeature} disabled={!draft.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function PermissionsMatrix({
  permissions,
  onChange,
  moduleLabel,
  actionLabel,
}: {
  permissions: string[];
  onChange: (permissions: string[]) => void;
  moduleLabel: (module: (typeof PERMISSION_MODULES)[number]) => string;
  actionLabel: (action: (typeof PERMISSION_ACTIONS)[number]) => string;
}) {
  const has = (name: string) => permissions.includes(name);

  const toggle = (name: string) => {
    onChange(has(name) ? permissions.filter((p) => p !== name) : [...permissions, name]);
  };

  return (
    <div className="max-h-72 overflow-y-auto rounded-lg border border-zinc-200">
      <table className="w-full text-xs">
        <thead className="text-zinc-400">
          <tr>
            <th className="sticky top-0 z-10 bg-zinc-50 px-3 py-2 text-left font-medium uppercase tracking-wider">
              ·
            </th>
            {PERMISSION_ACTIONS.map((action) => (
              <th key={action} className="sticky top-0 z-10 bg-zinc-50 px-2 py-2 text-center font-medium">
                {actionLabel(action)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERMISSION_MODULES.map((module) => (
            <tr key={module} className="border-t border-zinc-100">
              <td className="px-3 py-1.5 text-zinc-700">{moduleLabel(module)}</td>
              {PERMISSION_ACTIONS.map((action) => {
                const name = `${module}:${action}`;
                return (
                  <td key={action} className="px-2 py-1.5 text-center">
                    <Checkbox checked={has(name)} onChange={() => toggle(name)} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface PlanFormProps {
  open: boolean;
  plan: Plan | null; // null = crear
  onClose: () => void;
  onSaved: () => void;
}

export function PlanForm({ open, plan, onClose, onSaved }: PlanFormProps) {
  const t = useTranslations("plans.form");
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);

  const INTERVAL_OPTIONS = INTERVAL_VALUES.map((value) => ({ value, label: t(`intervals.${value}`) }));

  useEffect(() => {
    if (plan) {
      const metadata = plan.metadata ?? {};
      const rawPermissions = metadata.permissions;
      const permissions =
        typeof rawPermissions === "string"
          ? rawPermissions
              .split(",")
              .map((p) => p.trim())
              .filter(Boolean)
          : Array.isArray(rawPermissions)
            ? (rawPermissions as string[])
            : [];

      setForm({
        name: plan.name,
        description: plan.description ?? "",
        amount: String(planPriceCents(plan) / 100),
        interval: plan.interval,
        trialPeriodDays: plan.trialPeriodDays ? String(plan.trialPeriodDays) : "",
        features: plan.features ?? [],
        maxUsers: metadata.maxUsers ? String(metadata.maxUsers) : "",
        supportLevel: typeof metadata.supportLevel === "string" ? metadata.supportLevel : "email",
        permissions,
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
    const amountInEuros = Number(form.amount.replace(",", "."));
    const amountInCents = Math.round(amountInEuros * 100);
    const features = form.features;
    const metadata = {
      price: amountInCents,
      maxUsers: form.maxUsers ? Number(form.maxUsers) : undefined,
      supportLevel: form.supportLevel,
      permissions: form.permissions.join(","),
    };

    if (plan) {
      const { data } = await updatePlan({
        variables: {
          plan: {
            id: plan.id,
            name: form.name,
            description: form.description || undefined,
            amount: 0,
            metadata,
            features,
          },
        },
      });
      if (data?.updatePlan?.success) {
        toast(t("updated"));
        onSaved();
        onClose();
      } else {
        toast(data?.updatePlan?.message ?? t("updateFailed"), "error");
      }
    } else {
      const { data } = await createPlan({
        variables: {
          plan: {
            name: form.name,
            description: form.description || undefined,
            amount: 0,
            metadata,
            interval: form.interval,
            trialPeriodDays: form.trialPeriodDays ? Number(form.trialPeriodDays) : undefined,
            features,
          },
        },
      });
      if (data?.createPlan?.success) {
        toast(t("created"));
        onSaved();
        onClose();
      } else {
        toast(data?.createPlan?.message ?? t("createFailed"), "error");
      }
    }
  };

  const valid = form.name && Number(form.amount.replace(",", ".")) > 0;

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title={plan ? t("editTitle", { name: plan.name }) : t("newPlan")}
      subtitle={plan ? t("editSubtitle") : t("createSubtitle")}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!valid || loading}>
            {loading ? t("saving") : plan ? t("saveChanges") : t("createPlan")}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Field label={t("name")}>
          <Input value={form.name} onChange={(event) => set("name")(event.target.value)} />
        </Field>
        <Field label={t("description")}>
          <Textarea value={form.description} onChange={(event) => set("description")(event.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t("price")}>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.amount}
              onChange={(event) => set("amount")(event.target.value)}
            />
          </Field>
          <Field label={t("interval")}>
            <Dropdown
              options={INTERVAL_OPTIONS}
              value={form.interval}
              onChange={set("interval")}
              disabled={Boolean(plan)}
            />
          </Field>
        </div>
        {!plan ? (
          <Field label={t("trialDays")} hint={t("optional")}>
            <Input
              type="number"
              min={0}
              value={form.trialPeriodDays}
              onChange={(event) => set("trialPeriodDays")(event.target.value)}
            />
          </Field>
        ) : null}
        <Field label={t("features")}>
          <FeatureListInput
            features={form.features}
            onChange={(features) => setForm((current) => ({ ...current, features }))}
            placeholder={t("addFeature")}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t("maxUsers")} hint={t("maxUsersHint")}>
            <Input
              type="number"
              min={0}
              value={form.maxUsers}
              onChange={(event) => set("maxUsers")(event.target.value)}
            />
          </Field>
          <Field label={t("supportLevel")}>
            <Dropdown
              options={SUPPORT_LEVEL_VALUES.map((value) => ({ value, label: t(`supportLevels.${value}`) }))}
              value={form.supportLevel}
              onChange={set("supportLevel")}
            />
          </Field>
        </div>
        <Field label={t("accessLevel")}>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={
                form.permissions.length === STANDARD_PERMISSIONS.length &&
                STANDARD_PERMISSIONS.every((p) => form.permissions.includes(p))
                  ? "primary"
                  : "secondary"
              }
              onClick={() => setForm((current) => ({ ...current, permissions: STANDARD_PERMISSIONS }))}
            >
              {t("standardPreset")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={PREMIUM_PERMISSIONS.every((p) => form.permissions.includes(p)) ? "primary" : "secondary"}
              onClick={() => setForm((current) => ({ ...current, permissions: PREMIUM_PERMISSIONS }))}
            >
              {t("premiumPreset")}
            </Button>
          </div>
        </Field>
        <Field label={t("permissions")} hint={t("permissionsHint")}>
          <PermissionsMatrix
            permissions={form.permissions}
            onChange={(permissions) => setForm((current) => ({ ...current, permissions }))}
            moduleLabel={(module) => t(`permissionModules.${module}`)}
            actionLabel={(action) => t(`permissionActions.${action}`)}
          />
        </Field>
      </div>
    </SlideOver>
  );
}
