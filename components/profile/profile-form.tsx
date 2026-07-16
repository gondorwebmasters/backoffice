"use client";

import { useMutation } from "@apollo/client";
import { useEffect, useState } from "react";

import { useSession } from "@/components/layout/session-provider";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { UPDATE_USER } from "@/lib/graphql/users";
import type { User } from "@/lib/graphql/types";

interface FormState {
  name: string;
  surname: string;
  nickname: string;
  email: string;
  phoneNumber: string;
}

function toForm(user: User): FormState {
  return {
    name: user.name ?? "",
    surname: user.surname ?? "",
    nickname: user.nickname ?? "",
    email: user.email ?? "",
    phoneNumber: user.phoneNumber ?? "",
  };
}

export function ProfileForm({ user }: { user: User }) {
  const toast = useToast();
  const { refetch } = useSession();
  const [form, setForm] = useState<FormState>(() => toForm(user));

  useEffect(() => {
    setForm(toForm(user));
  }, [user]);

  const [updateUser, { loading }] = useMutation(UPDATE_USER);

  const set = (key: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const dirty =
    form.name !== (user.name ?? "") ||
    form.surname !== (user.surname ?? "") ||
    form.nickname !== (user.nickname ?? "") ||
    form.email !== (user.email ?? "") ||
    form.phoneNumber !== (user.phoneNumber ?? "");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const { data } = await updateUser({
        variables: {
          user: {
            id: user.id,
            name: form.name.trim() || null,
            surname: form.surname.trim() || null,
            nickname: form.nickname.trim(),
            email: form.email.trim(),
            phoneNumber: form.phoneNumber.trim() || null,
          },
        },
      });
      if (data?.updateUser?.success) {
        toast("Perfil actualizado");
        refetch();
      } else {
        toast(data?.updateUser?.message ?? "No se pudo actualizar el perfil", "error");
      }
    } catch {
      toast("No se pudo actualizar el perfil", "error");
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white shadow-card transition-shadow hover:shadow-card-hover">
      <header className="border-b border-zinc-100 px-7 py-5">
        <h2 className="text-sm font-semibold text-zinc-900">Datos personales</h2>
        <p className="text-xs text-zinc-400">Tu información visible en la plataforma</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5 p-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nombre">
            <Input value={form.name} onChange={set("name")} autoComplete="given-name" />
          </Field>
          <Field label="Apellidos">
            <Input value={form.surname} onChange={set("surname")} autoComplete="family-name" />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nickname">
            <Input value={form.nickname} onChange={set("nickname")} required autoComplete="nickname" />
          </Field>
          <Field label="Teléfono" hint="Solo dígitos, sin espacios">
            <Input
              value={form.phoneNumber}
              onChange={set("phoneNumber")}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="tel"
            />
          </Field>
        </div>
        <Field label="Email">
          <Input value={form.email} onChange={set("email")} type="email" required autoComplete="email" />
        </Field>

        <div className="flex justify-end pt-1">
          <Button type="submit" variant="primary" disabled={!dirty || loading}>
            {loading ? "Guardando…" : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </section>
  );
}
