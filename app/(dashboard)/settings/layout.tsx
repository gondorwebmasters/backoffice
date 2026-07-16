"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/cn";

const SETTINGS_TABS = [
  { href: "/settings", label: "General" },
  { href: "/settings/finance", label: "Finanzas" },
  { href: "/settings/onboarding", label: "Onboarding" },
  { href: "/settings/danger", label: "Zona de peligro" },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <PageHeader title="Ajustes" subtitle="Configuración y administración de la empresa" />
      <nav className="mb-8 flex flex-wrap gap-1 rounded-xl bg-zinc-100 p-1 sm:inline-flex" aria-label="Secciones de ajustes">
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
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </>
  );
}
