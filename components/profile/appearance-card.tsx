"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";

import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/cn";
import { ACCENT_PRESETS, type ThemeMode } from "@/lib/theme/palette";

export function AppearanceCard() {
  const t = useTranslations("profile.appearanceCard");
  const { mode, accent, setMode, setAccent } = useTheme();

  const MODES: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
    { value: "light", label: t("modes.light"), icon: Sun },
    { value: "dark", label: t("modes.dark"), icon: Moon },
    { value: "system", label: t("modes.system"), icon: Monitor },
  ];

  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white shadow-card transition-shadow hover:shadow-card-hover">
      <header className="border-b border-zinc-100 px-7 py-5">
        <h2 className="text-sm font-semibold text-zinc-900">{t("title")}</h2>
        <p className="text-xs text-zinc-400">{t("subtitle")}</p>
      </header>

      <div className="space-y-6 p-7">
        <div className="space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">{t("mode")}</span>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-zinc-100 p-1" role="radiogroup" aria-label={t("modeAriaLabel")}>
            {MODES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                role="radio"
                aria-checked={mode === value}
                onClick={() => setMode(value)}
                className={cn(
                  "flex h-9 items-center justify-center gap-2 rounded-lg text-xs font-medium transition-all duration-200",
                  mode === value
                    ? "bg-gradient-to-r from-primary to-primary/85 text-primary-foreground shadow-md shadow-primary/25"
                    : "text-zinc-500 hover:text-zinc-700",
                )}
              >
                <Icon size={14} strokeWidth={1.75} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">{t("accentColor")}</span>
          <div className="grid grid-cols-6 gap-2.5 pt-1">
            {ACCENT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setAccent(preset.id)}
                aria-label={t(`accentNames.${preset.id}`)}
                aria-pressed={accent === preset.id}
                title={t(`accentNames.${preset.id}`)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-150 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                  accent === preset.id && "ring-2 ring-offset-2 ring-primary",
                )}
                style={{ backgroundColor: preset.hex }}
              >
                {accent === preset.id ? (
                  <Check size={15} strokeWidth={2.5} style={{ color: `rgb(${preset.fgRgb})` }} />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
