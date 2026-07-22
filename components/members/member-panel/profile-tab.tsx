"use client";

import { useMutation } from "@apollo/client";
import { useState } from "react";

import { useSession } from "@/components/layout/session-provider";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dropdown } from "@/components/ui/dropdown";
import { Field, Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import type { User } from "@/lib/graphql/types";
import { ADMIT_USER_TO_COMPANY, DELETE_USER, UPDATE_USER } from "@/lib/graphql/users";

import { ROLE_OPTIONS } from "../member-filters";

interface ProfileTabProps {
  member: User;
  onChanged: () => void;
  onDeleted: () => void;
}

export function ProfileTab({ member, onChanged, onDeleted }: ProfileTabProps) {
  const toast = useToast();
  const { user: sessionUser } = useSession();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    name: member.name ?? "",
    surname: member.surname ?? "",
    email: member.email,
    nickname: member.nickname,
    phoneNumber: member.phoneNumber ?? "",
    role: member.contextRole ?? "standard",
    isActive: member.isActive !== false,
    isBlocked: Boolean(member.isBlocked),
  });

  const [updateUser, { loading: saving }] = useMutation(UPDATE_USER);
  const [deleteUser, { loading: deleting }] = useMutation(DELETE_USER);
  const [admitUser, { loading: admitting }] = useMutation(ADMIT_USER_TO_COMPANY);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSave = async () => {
    const { data } = await updateUser({
      variables: {
        user: {
          id: member.id,
          name: form.name || undefined,
          surname: form.surname || undefined,
          email: form.email,
          nickname: form.nickname,
          phoneNumber: form.phoneNumber || undefined,
          role: form.role,
          isActive: form.isActive,
          isBlocked: form.isBlocked,
        },
      },
    });
    const result = data?.updateUser;
    if (result?.success) {
      toast("Perfil actualizado");
      onChanged();
    } else {
      toast(result?.message ?? "No se pudo guardar", "error");
    }
  };

  const handleAdmit = async () => {
    if (!sessionUser?.activeCompanyId) return;
    const { data } = await admitUser({
      variables: { companyId: sessionUser.activeCompanyId, userId: member.id, role: form.role },
    });
    const result = data?.admitUserToCompany;
    if (result?.success) {
      toast("Miembro admitido en la empresa");
      onChanged();
    } else {
      toast(result?.message ?? "No se pudo admitir", "error");
    }
  };

  const handleDelete = async () => {
    const { data } = await deleteUser({ variables: { id: member.id } });
    const result = data?.deleteUser;
    if (result?.success) {
      toast("Miembro eliminado");
      onDeleted();
    } else {
      toast(result?.message ?? "No se pudo eliminar", "error");
      setConfirmDelete(false);
    }
  };

  return (
    <div className="space-y-5">
      {member.isPending ? (
        <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-700">Solicitud de ingreso pendiente</p>
          <Button size="sm" variant="primary" onClick={handleAdmit} disabled={admitting}>
            {admitting ? "…" : "Admitir"}
          </Button>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Nombre">
          <Input value={form.name} onChange={(event) => set("name", event.target.value)} />
        </Field>
        <Field label="Apellidos">
          <Input value={form.surname} onChange={(event) => set("surname", event.target.value)} />
        </Field>
      </div>
      <Field label="Email">
        <Input type="email" value={form.email} onChange={(event) => set("email", event.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Usuario">
          <Input value={form.nickname} onChange={(event) => set("nickname", event.target.value)} />
        </Field>
        <Field label="Teléfono">
          <Input value={form.phoneNumber} onChange={(event) => set("phoneNumber", event.target.value)} />
        </Field>
      </div>
      <Field label="Rol">
        <Dropdown
          options={ROLE_OPTIONS}
          value={form.role}
          onChange={(value) => set("role", value as typeof form.role)}
        />
      </Field>
      <div className="space-y-2.5">
        <label className="flex items-center gap-2.5 text-sm text-zinc-600">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => set("isActive", event.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 accent-zinc-900"
          />
          Miembro activo
        </label>
        <label className="flex items-center gap-2.5 text-sm text-zinc-600">
          <input
            type="checkbox"
            checked={form.isBlocked}
            onChange={(event) => set("isBlocked", event.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 accent-zinc-900"
          />
          Bloquear acceso a la app
        </label>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-100 pt-5">
        <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
          Eliminar miembro
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Eliminar miembro"
        description={`Se eliminará definitivamente a ${form.nickname} y todos sus datos. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
