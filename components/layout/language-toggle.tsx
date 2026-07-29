"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { LOCALE_COOKIE, type Locale } from "@/i18n/locales";

const NEXT_LOCALE: Record<Locale, Locale> = {
  es: "pt",
  pt: "es",
};

export function LanguageToggle() {
  const locale = useLocale() as Locale;
  const t = useTranslations("languageSwitcher");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const switchLocale = () => {
    const next = NEXT_LOCALE[locale];
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000`;
    startTransition(() => router.refresh());
  };

  return (
    <button
      onClick={switchLocale}
      disabled={pending}
      className="rounded-lg px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50"
      aria-label={t("label")}
      title={t(locale)}
    >
      {locale}
    </button>
  );
}