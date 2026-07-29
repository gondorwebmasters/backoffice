"use client";

import { useMutation } from "@apollo/client";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { UPDATE_PASSWORD } from "@/lib/graphql/auth";

const EMPTY = { currentPassword: "", newPassword: "", confirmPassword: "" };

function PasswordInput({
  value,
  onChange,
  autoComplete,
}: {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete: string;
}) {
  const t = useTranslations("profile.passwordForm");
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        minLength={6}
        required
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? t("hidePassword") : t("showPassword")}
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-2 text-zinc-400 transition-colors hover:text-zinc-600"
      >
        {visible ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
      </button>
    </div>
  );
}

export function PasswordForm() {
  const t = useTranslations("profile.passwordForm");
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [updatePassword, { loading }] = useMutation(UPDATE_PASSWORD);

  const set = (key: keyof typeof EMPTY) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const mismatch = form.confirmPassword.length > 0 && form.newPassword !== form.confirmPassword;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (mismatch) return;
    try {
      const { data } = await updatePassword({ variables: { password: form } });
      if (data?.updatePassword?.success) {
        toast(t("updated"));
        setForm(EMPTY);
      } else {
        toast(data?.updatePassword?.message ?? t("updateFailed"), "error");
      }
    } catch {
      toast(t("updateFailed"), "error");
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white shadow-card transition-shadow hover:shadow-card-hover">
      <header className="border-b border-zinc-100 px-7 py-5">
        <h2 className="text-sm font-semibold text-zinc-900">{t("title")}</h2>
        <p className="text-xs text-zinc-400">{t("subtitle")}</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5 p-7">
        <Field label={t("currentPassword")}>
          <PasswordInput
            value={form.currentPassword}
            onChange={set("currentPassword")}
            autoComplete="current-password"
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("newPassword")} hint={t("newPasswordHint")}>
            <PasswordInput value={form.newPassword} onChange={set("newPassword")} autoComplete="new-password" />
          </Field>
          <Field label={t("confirmPassword")}>
            <PasswordInput
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              autoComplete="new-password"
            />
          </Field>
        </div>
        {mismatch ? (
          <p role="alert" className="text-xs text-red-500">
            {t("mismatch")}
          </p>
        ) : null}

        <div className="flex justify-end pt-1">
          <Button type="submit" variant="primary" disabled={loading || mismatch}>
            {loading ? t("updating") : t("changePassword")}
          </Button>
        </div>
      </form>
    </section>
  );
}
