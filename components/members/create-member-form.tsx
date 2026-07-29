"use client";

import { useMutation } from "@apollo/client";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dropdown } from "@/components/ui/dropdown";
import { Field, Input } from "@/components/ui/input";
import { SlideOver } from "@/components/ui/slide-over";
import { useToast } from "@/components/ui/toast";
import { CREATE_COMPANY_MEMBER } from "@/lib/graphql/users";

import { useRoleOptions } from "./member-filters";

const EMPTY_FORM = { email: "", nickname: "", password: "", role: "standard", isActive: true };

interface CreateMemberFormProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateMemberForm({ open, onClose, onCreated }: CreateMemberFormProps) {
  const t = useTranslations("members.createForm");
  const toast = useToast();
  const roleOptions = useRoleOptions();
  const [form, setForm] = useState(EMPTY_FORM);
  const [createCompanyMember, { loading }] = useMutation(CREATE_COMPANY_MEMBER);

  const set = (key: keyof typeof form) => (value: string) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async () => {
    const { data } = await createCompanyMember({ variables: { user: form } });
    const result = data?.createCompanyMember;
    if (result?.success) {
      toast(t("created"));
      setForm(EMPTY_FORM);
      onCreated();
      onClose();
    } else {
      toast(result?.message ?? t("createFailed"), "error");
    }
  };

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title={t("title")}
      subtitle={t("subtitle")}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading || !form.email || !form.nickname || !form.password}
          >
            {loading ? t("creating") : t("submit")}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Field label={t("email")}>
          <Input type="email" value={form.email} onChange={(event) => set("email")(event.target.value)} />
        </Field>
        <Field label={t("username")}>
          <Input value={form.nickname} onChange={(event) => set("nickname")(event.target.value)} />
        </Field>
        <Field label={t("password")} hint={t("passwordHint")}>
          <Input type="password" value={form.password} onChange={(event) => set("password")(event.target.value)} />
        </Field>
        <Field label={t("role")}>
          <Dropdown options={roleOptions} value={form.role} onChange={set("role")} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <Checkbox
            checked={form.isActive}
            onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
          />
          {t("activateDirectly")}
        </label>
      </div>
    </SlideOver>
  );
}
