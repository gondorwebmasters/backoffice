"use client";

import { useMutation } from "@apollo/client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SlideOver } from "@/components/ui/slide-over";
import { useToast } from "@/components/ui/toast";
import { CREATE_USER } from "@/lib/graphql/users";

import { ROLE_OPTIONS } from "./member-filters";

interface CreateMemberFormProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateMemberForm({ open, onClose, onCreated }: CreateMemberFormProps) {
  const toast = useToast();
  const [form, setForm] = useState({ email: "", nickname: "", password: "", role: "standard" });
  const [createUser, { loading }] = useMutation(CREATE_USER);

  const set = (key: keyof typeof form) => (value: string) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async () => {
    const { data } = await createUser({ variables: { user: form } });
    const result = data?.createUser;
    if (result?.success) {
      toast("Miembro creado");
      setForm({ email: "", nickname: "", password: "", role: "standard" });
      onCreated();
      onClose();
    } else {
      toast(result?.message ?? "No se pudo crear el miembro", "error");
    }
  };

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title="Nuevo miembro"
      subtitle="Se creará con acceso a la empresa activa"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading || !form.email || !form.nickname || !form.password}
          >
            {loading ? "Creando…" : "Crear miembro"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Email">
          <Input type="email" value={form.email} onChange={(event) => set("email")(event.target.value)} />
        </Field>
        <Field label="Usuario">
          <Input value={form.nickname} onChange={(event) => set("nickname")(event.target.value)} />
        </Field>
        <Field label="Contraseña" hint="El miembro podrá cambiarla desde la app">
          <Input type="password" value={form.password} onChange={(event) => set("password")(event.target.value)} />
        </Field>
        <Field label="Rol">
          <Select options={ROLE_OPTIONS} value={form.role} onChange={(event) => set("role")(event.target.value)} />
        </Field>
      </div>
    </SlideOver>
  );
}
