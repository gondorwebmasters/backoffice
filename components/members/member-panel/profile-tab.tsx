"use client";

import { useMutation } from "@apollo/client";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useSession } from "@/components/layout/session-provider";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dropdown } from "@/components/ui/dropdown";
import { Field, Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ADMIN_UPDATE_PASSWORD } from "@/lib/graphql/auth";
import type { User } from "@/lib/graphql/types";
import { ADMIT_USER_TO_COMPANY, DELETE_USER, UPDATE_USER } from "@/lib/graphql/users";

import { useRoleOptions } from "../member-filters";

const EMPTY_PASSWORD_FORM = { newPassword: "", confirmPassword: "" };

function PasswordInput({
  value,
  onChange,
  autoComplete,
}: {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete: string;
}) {
  const t = useTranslations("members.profileTab");
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        minLength={6}
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

interface ProfileTabProps {
  member: User;
  onChanged: () => void;
  onDeleted: () => void;
}

export function ProfileTab({ member, onChanged, onDeleted }: ProfileTabProps) {
  const t = useTranslations("members.profileTab");
  const tCommon = useTranslations("members.bulkActions");
  const toast = useToast();
  const { user: sessionUser } = useSession();
  const roleOptions = useRoleOptions();
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

  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);

  const [updateUser, { loading: saving }] = useMutation(UPDATE_USER);
  const [deleteUser, { loading: deleting }] = useMutation(DELETE_USER);
  const [admitUser, { loading: admitting }] = useMutation(ADMIT_USER_TO_COMPANY);
  const [adminUpdatePassword, { loading: changingPassword }] = useMutation(ADMIN_UPDATE_PASSWORD);

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
      toast(t("profileUpdated"));
      onChanged();
    } else {
      toast(result?.message ?? t("saveFailed"), "error");
    }
  };

  const handleAdmit = async () => {
    if (!sessionUser?.activeCompanyId) return;
    const { data } = await admitUser({
      variables: { companyId: sessionUser.activeCompanyId, userId: member.id, role: form.role },
    });
    const result = data?.admitUserToCompany;
    if (result?.success) {
      toast(t("admittedSuccess"));
      onChanged();
    } else {
      toast(result?.message ?? t("admitFailed"), "error");
    }
  };

  const passwordMismatch =
    passwordForm.confirmPassword.length > 0 && passwordForm.newPassword !== passwordForm.confirmPassword;

  const handleChangePassword = async () => {
    if (passwordMismatch || passwordForm.newPassword.length < 6) return;
    try {
      const { data } = await adminUpdatePassword({
        variables: { password: { userId: member.id, ...passwordForm } },
      });
      const result = data?.adminUpdatePassword;
      if (result?.success) {
        toast(t("passwordUpdated"));
        setPasswordForm(EMPTY_PASSWORD_FORM);
      } else {
        toast(result?.message ?? t("passwordUpdateFailed"), "error");
      }
    } catch {
      toast(t("passwordUpdateFailed"), "error");
    }
  };

  const handleDelete = async () => {
    const { data } = await deleteUser({ variables: { id: member.id } });
    const result = data?.deleteUser;
    if (result?.success) {
      toast(t("memberDeleted"));
      onDeleted();
    } else {
      toast(result?.message ?? t("deleteFailed"), "error");
      setConfirmDelete(false);
    }
  };

  return (
    <div className="space-y-5">
      {member.isPending ? (
        <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-700">{t("pendingAdmission")}</p>
          <Button size="sm" variant="primary" onClick={handleAdmit} disabled={admitting}>
            {admitting ? "…" : t("admit")}
          </Button>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <Field label={t("name")}>
          <Input value={form.name} onChange={(event) => set("name", event.target.value)} />
        </Field>
        <Field label={t("surname")}>
          <Input value={form.surname} onChange={(event) => set("surname", event.target.value)} />
        </Field>
      </div>
      <Field label={t("email")}>
        <Input type="email" value={form.email} onChange={(event) => set("email", event.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t("username")}>
          <Input value={form.nickname} onChange={(event) => set("nickname", event.target.value)} />
        </Field>
        <Field label={t("phone")}>
          <Input value={form.phoneNumber} onChange={(event) => set("phoneNumber", event.target.value)} />
        </Field>
      </div>
      <Field label={t("role")}>
        <Dropdown
          options={roleOptions}
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
          {t("activeMember")}
        </label>
        <label className="flex items-center gap-2.5 text-sm text-zinc-600">
          <input
            type="checkbox"
            checked={form.isBlocked}
            onChange={(event) => set("isBlocked", event.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 accent-zinc-900"
          />
          {t("blockAccess")}
        </label>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-100 pt-5">
        <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
          {t("deleteMember")}
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? t("saving") : t("saveChanges")}
        </Button>
      </div>

      {sessionUser?.isSuperAdmin ? (
        <div className="space-y-4 border-t border-zinc-100 pt-5">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">{t("passwordSectionTitle")}</h3>
            <p className="text-xs text-zinc-400">{t("passwordSectionHint")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("newPassword")} hint={t("newPasswordHint")}>
              <PasswordInput
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                autoComplete="new-password"
              />
            </Field>
            <Field label={t("confirmPassword")}>
              <PasswordInput
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))
                }
                autoComplete="new-password"
              />
            </Field>
          </div>
          {passwordMismatch ? (
            <p role="alert" className="text-xs text-red-500">
              {t("passwordMismatch")}
            </p>
          ) : null}
          <div className="flex justify-end">
            <Button
              variant="secondary"
              onClick={handleChangePassword}
              disabled={changingPassword || passwordMismatch || passwordForm.newPassword.length < 6}
            >
              {changingPassword ? t("updatingPassword") : t("changePassword")}
            </Button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmDelete}
        title={t("deleteConfirmTitle")}
        description={t("deleteConfirmDescription", { name: form.nickname })}
        confirmLabel={tCommon("delete")}
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
