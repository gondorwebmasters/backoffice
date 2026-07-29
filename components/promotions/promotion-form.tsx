"use client";

import { useMutation } from "@apollo/client";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Field, Input, Textarea } from "@/components/ui/input";
import { SlideOver } from "@/components/ui/slide-over";
import { useToast } from "@/components/ui/toast";
import { CREATE_PROMOTION, LIST_PROMOTIONS, UPDATE_PROMOTION } from "@/lib/graphql/promotions";
import type { Promotion } from "@/lib/graphql/types";

const DEFAULT_ACCENT = "#F59E0B";

const EMPTY_FORM = {
  title: "",
  description: "",
  discountTag: "",
  originalPrice: "",
  newPrice: "",
  expiresAt: "",
  accentColor: DEFAULT_ACCENT,
  isHero: false,
  isActive: true,
};

/** ISO string -> valor para <input type="datetime-local"> (hora local, sin segundos). */
function toDateTimeLocal(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface PromotionFormProps {
  open: boolean;
  promotion: Promotion | null; // null = crear
  onClose: () => void;
  onSaved: () => void;
}

export function PromotionForm({ open, promotion, onClose, onSaved }: PromotionFormProps) {
  const t = useTranslations("promotions.form");
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (promotion) {
      setForm({
        title: promotion.title,
        description: promotion.description,
        discountTag: promotion.discountTag,
        originalPrice: String(promotion.originalPrice),
        newPrice: String(promotion.newPrice),
        expiresAt: toDateTimeLocal(promotion.expiresAt),
        accentColor: promotion.accentColor ?? DEFAULT_ACCENT,
        isHero: promotion.isHero,
        isActive: promotion.isActive,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [promotion, open]);

  const [createPromotion, createState] = useMutation(CREATE_PROMOTION, {
    refetchQueries: [{ query: LIST_PROMOTIONS, variables: { includeInactive: true } }],
  });
  const [updatePromotion, updateState] = useMutation(UPDATE_PROMOTION, {
    refetchQueries: [{ query: LIST_PROMOTIONS, variables: { includeInactive: true } }],
  });
  const loading = createState.loading || updateState.loading;

  const set = <K extends keyof typeof form>(key: K) => (value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async () => {
    const input = {
      title: form.title,
      description: form.description,
      discountTag: form.discountTag,
      originalPrice: Number(form.originalPrice.replace(",", ".")),
      newPrice: Number(form.newPrice.replace(",", ".")),
      expiresAt: new Date(form.expiresAt).toISOString(),
      accentColor: form.accentColor || undefined,
      isHero: form.isHero,
      isActive: form.isActive,
    };

    if (promotion) {
      const { data } = await updatePromotion({ variables: { id: promotion.id, promotion: input } });
      if (data?.updatePromotion?.success) {
        toast(t("updated"));
        onSaved();
        onClose();
      } else {
        toast(data?.updatePromotion?.message ?? t("updateFailed"), "error");
      }
    } else {
      const { data } = await createPromotion({ variables: { promotion: input } });
      if (data?.createPromotion?.success) {
        toast(t("created"));
        onSaved();
        onClose();
      } else {
        toast(data?.createPromotion?.message ?? t("createFailed"), "error");
      }
    }
  };

  const valid =
    form.title &&
    form.discountTag &&
    Number(form.originalPrice.replace(",", ".")) > 0 &&
    Number(form.newPrice.replace(",", ".")) >= 0 &&
    Boolean(form.expiresAt);

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title={promotion ? t("editTitle", { title: promotion.title }) : t("newPromotion")}
      subtitle={promotion ? t("editSubtitle") : t("createSubtitle")}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!valid || loading}>
            {loading ? t("saving") : promotion ? t("saveChanges") : t("createPromotion")}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Field label={t("titleField")}>
          <Input value={form.title} onChange={(event) => set("title")(event.target.value)} />
        </Field>
        <Field label={t("description")}>
          <Textarea value={form.description} onChange={(event) => set("description")(event.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t("discountTag")} hint={t("discountTagHint")}>
            <Input value={form.discountTag} onChange={(event) => set("discountTag")(event.target.value)} />
          </Field>
          <Field label={t("accentColor")}>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.accentColor}
                onChange={(event) => set("accentColor")(event.target.value)}
                className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-zinc-200 bg-white p-1"
              />
              <Input value={form.accentColor} onChange={(event) => set("accentColor")(event.target.value)} />
            </div>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t("originalPrice")}>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.originalPrice}
              onChange={(event) => set("originalPrice")(event.target.value)}
            />
          </Field>
          <Field label={t("discountedPrice")}>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.newPrice}
              onChange={(event) => set("newPrice")(event.target.value)}
            />
          </Field>
        </div>
        <Field label={t("expires")}>
          <DatePicker withTime value={form.expiresAt} onChange={set("expiresAt")} />
        </Field>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <Checkbox checked={form.isActive} onChange={(event) => set("isActive")(event.target.checked)} />
            {t("active")}
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <Checkbox checked={form.isHero} onChange={(event) => set("isHero")(event.target.checked)} />
            {t("featured")}
          </label>
        </div>
      </div>
    </SlideOver>
  );
}
