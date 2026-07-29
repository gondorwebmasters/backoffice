"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/cn";

const SETTINGS_TABS = [
  { href: "/settings", key: "general" },
  { href: "/settings/finance", key: "finance" },
  { href: "/settings/onboarding", key: "onboarding" },
  { href: "/settings/danger", key: "danger" },
] as const;

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations("settings.layout");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <nav className="mb-8 flex flex-wrap gap-1 rounded-xl bg-zinc-100 p-1 sm:inline-flex" aria-label={t("tabsAriaLabel")}>
        {SETTINGS_TABS.map((tab) => {
          const active = tab.href === "/settings" ? pathname === tab.href : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex h-9 items-center rounded-lg px-4 text-sm font-medium transition-all duration-200",
                active
                  ? tab.href === "/settings/danger"
                    ? "bg-gradient-to-r from-red-500 to-red-500/85 text-[white] shadow-md shadow-red-500/25"
                    : "bg-gradient-to-r from-primary to-primary/85 text-primary-foreground shadow-md shadow-primary/25"
                  : "text-zinc-500 hover:text-zinc-700",
              )}
            >
              {t(`tabs.${tab.key}`)}
            </Link>
          );
        })}
      </nav>
      {/*
        Alto fijo relativo al viewport: el título y las pestañas quedan
        siempre visibles y es este contenedor el que hace scroll, no la
        página — igual que las tablas.
      */}
      <div className="max-h-[calc(100vh-21rem)] overflow-y-auto pr-1">{children}</div>
    </>
  );
}
