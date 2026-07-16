"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { useTheme } from "@/components/providers/theme-provider";
import type { ThemeMode } from "@/lib/theme/palette";

const NEXT_MODE: Record<ThemeMode, ThemeMode> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const MODE_LABEL: Record<ThemeMode, string> = {
  light: "Modo claro",
  dark: "Modo oscuro",
  system: "Según el sistema",
};

export function ThemeToggle() {
  const { mode, setMode } = useTheme();
  // Evita mismatch de hidratación: el modo real solo se conoce en cliente
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : Monitor;

  return (
    <button
      onClick={() => setMode(NEXT_MODE[mode])}
      className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
      aria-label={MODE_LABEL[mode]}
      title={MODE_LABEL[mode]}
    >
      {mounted ? <Icon size={16} strokeWidth={1.5} /> : <Sun size={16} strokeWidth={1.5} />}
    </button>
  );
}
