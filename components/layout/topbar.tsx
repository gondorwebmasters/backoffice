"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";

import { useShell } from "./app-shell";
import { Breadcrumbs } from "./breadcrumbs";
import { CompanySwitcher } from "./company-switcher";
import { LanguageToggle } from "./language-toggle";
import { NotificationsBell } from "./notifications-bell";
import { ProfileMenu } from "./profile-menu";
import { ThemeToggle } from "./theme-toggle";

export function Topbar() {
  const { openPalette } = useShell();
  const t = useTranslations("topbar");
  const [scrolled, setScrolled] = useState(false);

  // Barra flotante tipo Material AppBar: gana profundidad extra al hacer
  // scroll, pero siempre mantiene su propia elevación (no es plana nunca).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="sticky top-4 z-30 mx-6 lg:mx-10">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          // Sin overflow-hidden: recortaba los dropdowns/popovers (empresa,
          // notificaciones, perfil) que se abren desde dentro del topbar.
          "relative flex h-16 items-center justify-between gap-4 rounded-2xl border border-zinc-200/70 bg-background/85 px-6 backdrop-blur-md transition-shadow duration-300",
          scrolled
            ? "shadow-[0_8px_24px_-8px_rgb(2_6_23/0.2),0_2px_8px_-2px_rgb(2_6_23/0.1)]"
            : "shadow-[0_4px_16px_-6px_rgb(2_6_23/0.14),0_1px_4px_-1px_rgb(2_6_23/0.08)]",
        )}
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <Breadcrumbs />

        <div className="flex items-center gap-3">
          <motion.button
            onClick={openPalette}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex h-9 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-xs text-zinc-400 shadow-sm transition-colors hover:border-zinc-300 hover:text-zinc-600"
          >
            <Search size={13} strokeWidth={1.5} />
            <span className="hidden md:block">{t("search")}</span>
            <kbd className="hidden rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-px font-sans text-[10px] text-zinc-400 md:block">
              ⌘K
            </kbd>
          </motion.button>

          <span className="h-6 w-px shrink-0 bg-zinc-200/80" />

          <CompanySwitcher />

          <div className="flex items-center gap-0.5 rounded-xl border border-zinc-200/80 bg-white/70 p-1 shadow-sm">
            <NotificationsBell />
            <LanguageToggle />
            <ThemeToggle />
          </div>

          <ProfileMenu />
        </div>
      </motion.header>
    </div>
  );
}