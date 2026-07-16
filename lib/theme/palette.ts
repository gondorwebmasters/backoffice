/**
 * Paleta de acentos del backoffice — los mismos 12 presets que el
 * color-picker de la app cliente (client/context/app-settings-context.tsx).
 * Los valores rgb (tripleta "R G B") alimentan la CSS var --primary.
 */

export interface AccentPreset {
  id: string;
  label: string;
  hex: string;
  /** Tripleta "R G B" para --primary. */
  rgb: string;
  /** Color de texto sobre el acento (--primary-fg). Siempre blanco por
   * decisión de producto: los elementos seleccionados (sidebar, botones…)
   * llevan tipografía blanca con cualquier acento. */
  fgRgb: string;
  /** Variante aclarada para trazos de gráfico en modo oscuro (--primary-chart). */
  chartDarkRgb: string;
}

function hexToRgb(hex: string): string {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

const WHITE = "255 255 255";

function preset(id: string, label: string, hex: string, chartDarkHex: string): AccentPreset {
  return {
    id,
    label,
    hex,
    rgb: hexToRgb(hex),
    fgRgb: WHITE,
    chartDarkRgb: hexToRgb(chartDarkHex),
  };
}

// Variantes oscuras = shade 400 de Tailwind del mismo matiz (como hace el
// cliente móvil: primary #6366F1 light / #818CF8 dark).
export const ACCENT_PRESETS: AccentPreset[] = [
  preset("indigo", "Índigo", "#6366F1", "#818CF8"),
  preset("purple", "Púrpura", "#8B5CF6", "#A78BFA"),
  preset("pink", "Rosa", "#EC4899", "#F472B6"),
  preset("red", "Rojo", "#EF4444", "#F87171"),
  preset("orange", "Naranja", "#F97316", "#FB923C"),
  preset("amber", "Ámbar", "#F59E0B", "#FBBF24"),
  preset("green", "Verde", "#22C55E", "#4ADE80"),
  preset("emerald", "Esmeralda", "#10B981", "#34D399"),
  preset("cyan", "Cian", "#06B6D4", "#22D3EE"),
  preset("blue", "Azul", "#3B82F6", "#60A5FA"),
  preset("navy", "Azul Marino", "#1E40AF", "#3B82F6"),
  preset("gray", "Gris", "#6B7280", "#9CA3AF"),
];

export const DEFAULT_ACCENT = "indigo";

export function getAccentPreset(id: string): AccentPreset {
  return ACCENT_PRESETS.find((accent) => accent.id === id) ?? ACCENT_PRESETS[0];
}

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeSettings {
  mode: ThemeMode;
  accent: string;
}

export const THEME_STORAGE_KEY = "fc-bo-theme";

export const DEFAULT_THEME: ThemeSettings = {
  mode: "system",
  accent: DEFAULT_ACCENT,
};
