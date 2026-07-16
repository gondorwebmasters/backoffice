"use client";

import { Search } from "lucide-react";

import { useShell } from "./app-shell";
import { Breadcrumbs } from "./breadcrumbs";
import { CompanySwitcher } from "./company-switcher";
import { NotificationsBell } from "./notifications-bell";
import { ProfileMenu } from "./profile-menu";
import { ThemeToggle } from "./theme-toggle";

export function Topbar() {
  const { openPalette } = useShell();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-zinc-200/80 bg-background/80 px-10 shadow-[0_2px_12px_-6px_rgb(2_6_23/0.08)] backdrop-blur">
      <Breadcrumbs />
      <div className="flex items-center gap-2">
        <button
          onClick={openPalette}
          className="flex h-8 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-400 shadow-sm transition-colors hover:border-zinc-300 hover:text-zinc-600"
        >
          <Search size={13} strokeWidth={1.5} />
          <span className="hidden md:block">Buscar…</span>
          <kbd className="hidden rounded border border-zinc-200 bg-zinc-50 px-1 py-px font-sans text-[10px] text-zinc-400 md:block">
            ⌘K
          </kbd>
        </button>
        <CompanySwitcher />
        <NotificationsBell />
        <ThemeToggle />
        <ProfileMenu />
      </div>
    </header>
  );
}
