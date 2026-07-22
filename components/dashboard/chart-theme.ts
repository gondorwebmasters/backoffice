/**
 * Colores de Recharts como CSS vars del design system (ver globals.css /
 * tailwind.config.ts). Al ser strings CSS crudos (no clases Tailwind),
 * heredan el cambio de tema claro/oscuro sin necesidad de releer nada en JS.
 */
export const CHART_COLORS = {
  primary: "rgb(var(--primary-chart))",
  primarySoft: "rgb(var(--primary-chart) / 0.18)",
  primaryFaint: "rgb(var(--primary-chart) / 0.08)",
  grid: "rgb(var(--z-200))",
  axis: "rgb(var(--z-400))",
  text: "rgb(var(--z-600))",
  tooltipBg: "rgb(var(--surface))",
  tooltipBorder: "rgb(var(--z-200))",
};

export const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: CHART_COLORS.tooltipBg,
    border: `1px solid ${CHART_COLORS.tooltipBorder}`,
    borderRadius: 12,
    boxShadow: "0 4px 8px -2px rgb(2 6 23 / 0.10), 0 20px 40px -8px rgb(2 6 23 / 0.22)",
    fontSize: 12,
    padding: "8px 12px",
  },
  labelStyle: { color: CHART_COLORS.text, fontWeight: 500, marginBottom: 2 },
  itemStyle: { color: CHART_COLORS.text, padding: 0 },
  cursor: { fill: CHART_COLORS.primaryFaint },
} as const;
