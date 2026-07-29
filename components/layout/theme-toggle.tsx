"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { useTheme } from "@/components/providers/theme-provider";
import type { ThemeMode } from "@/lib/theme/palette";

const NEXT_MODE: Record<ThemeMode, ThemeMode> = {
  light: "dark",
  dark: "system",
  system: "light",
};

export function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const t = useTranslations("themeToggle");
  // Evita mismatch de hidratación: el modo real solo se conoce en cliente
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : Monitor;
  const label = t(mode);

  return (
    <button
      onClick={() => setMode(NEXT_MODE[mode])}
      className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
      aria-label={label}
      title={label}
    >
      {mounted ? <Icon size={16} strokeWidth={1.5} /> : <Sun size={16} strokeWidth={1.5} />}
    </button>
  );
}
