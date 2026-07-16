"use client";

import { useMutation } from "@apollo/client";
import { Eye, EyeOff } from "lucide-react";
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
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-2 text-zinc-400 transition-colors hover:text-zinc-600"
      >
        {visible ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
      </button>
    </div>
  );
}

export function PasswordForm() {
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
        toast("Contraseña actualizada");
        setForm(EMPTY);
      } else {
        toast(data?.updatePassword?.message ?? "No se pudo cambiar la contraseña", "error");
      }
    } catch {
      toast("No se pudo cambiar la contraseña", "error");
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white shadow-card transition-shadow hover:shadow-card-hover">
      <header className="border-b border-zinc-100 px-7 py-5">
        <h2 className="text-sm font-semibold text-zinc-900">Seguridad</h2>
        <p className="text-xs text-zinc-400">Cambia tu contraseña de acceso</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5 p-7">
        <Field label="Contraseña actual">
          <PasswordInput
            value={form.currentPassword}
            onChange={set("currentPassword")}
            autoComplete="current-password"
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nueva contraseña" hint="Mínimo 6 caracteres">
            <PasswordInput value={form.newPassword} onChange={set("newPassword")} autoComplete="new-password" />
          </Field>
          <Field label="Confirmar contraseña">
            <PasswordInput
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              autoComplete="new-password"
            />
          </Field>
        </div>
        {mismatch ? (
          <p role="alert" className="text-xs text-red-500">
            Las contraseñas no coinciden
          </p>
        ) : null}

        <div className="flex justify-end pt-1">
          <Button type="submit" variant="primary" disabled={loading || mismatch}>
            {loading ? "Actualizando…" : "Cambiar contraseña"}
          </Button>
        </div>
      </form>
    </section>
  );
}
