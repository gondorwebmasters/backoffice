"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_THEME,
  getAccentPreset,
  THEME_STORAGE_KEY,
  type ThemeMode,
  type ThemeSettings,
} from "@/lib/theme/palette";

interface ThemeContextValue {
  mode: ThemeMode;
  /** Modo efectivo una vez resuelto "system". */
  resolvedMode: "light" | "dark";
  accent: string;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: DEFAULT_THEME.mode,
  resolvedMode: "light",
  accent: DEFAULT_THEME.accent,
  setMode: () => {},
  setAccent: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function readStoredSettings(): ThemeSettings {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return DEFAULT_THEME;
    const parsed = JSON.parse(raw) as Partial<ThemeSettings>;
    return {
      mode: parsed.mode === "light" || parsed.mode === "dark" ? parsed.mode : "system",
      accent: typeof parsed.accent === "string" ? parsed.accent : DEFAULT_THEME.accent,
    };
  } catch {
    return DEFAULT_THEME;
  }
}

function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(settings: ThemeSettings) {
  const root = document.documentElement;
  const dark = settings.mode === "dark" || (settings.mode === "system" && systemPrefersDark());
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  const preset = getAccentPreset(settings.accent);
  root.style.setProperty("--primary", preset.rgb);
  root.style.setProperty("--primary-fg", preset.fgRgb);
  root.style.setProperty("--primary-chart", dark ? preset.chartDarkRgb : preset.rgb);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(readStoredSettings);

  useEffect(() => {
    applyTheme(settings);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // localStorage no disponible (modo privado estricto) — el tema sigue funcionando en memoria
    }
  }, [settings]);

  // Reaccionar a cambios del sistema cuando el modo es "system"
  useEffect(() => {
    if (settings.mode !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(settings);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [settings]);

  const setMode = useCallback((mode: ThemeMode) => {
    setSettings((current) => ({ ...current, mode }));
  }, []);

  const setAccent = useCallback((accent: string) => {
    setSettings((current) => ({ ...current, accent }));
  }, []);

  const resolvedMode: "light" | "dark" =
    settings.mode === "system" ? (systemPrefersDark() ? "dark" : "light") : settings.mode;

  const value = useMemo(
    () => ({ mode: settings.mode, resolvedMode, accent: settings.accent, setMode, setAccent }),
    [settings.mode, settings.accent, resolvedMode, setMode, setAccent],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
