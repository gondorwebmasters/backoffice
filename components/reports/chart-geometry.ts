/**
 * Matemática pura (sin dependencias de renderer) compartida entre los charts
 * SVG del PDF (`@react-pdf/renderer`) y su espejo HTML de previsualización.
 * Ambos entornos entienden el mismo string `d` de un `<path>`, así que basta
 * con generar las coordenadas una sola vez.
 */

export interface ChartPoint {
  x: number;
  y: number;
  label: string;
  value: number;
}

export function scaleValue(value: number, max: number, plotHeight: number): number {
  if (max <= 0) return plotHeight;
  return plotHeight - (value / max) * plotHeight;
}

/**
 * Curva suave tipo "monotone" (spline de Catmull-Rom convertida a Bézier
 * cúbica) para que el área/línea de ingresos no se vea como un zigzag.
 */
export function buildSmoothLinePath(points: ChartPoint[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;

  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

/** Rectángulo con esquinas superiores redondeadas (las inferiores rectas). */
export function roundedTopRectPath(x: number, y: number, width: number, height: number, radius: number): string {
  if (height <= 0 || width <= 0) return "";
  const r = Math.max(0, Math.min(radius, width / 2, height));
  if (r === 0) {
    return `M ${x},${y + height} L ${x},${y} L ${x + width},${y} L ${x + width},${y + height} Z`;
  }
  return [
    `M ${x},${y + height}`,
    `L ${x},${y + r}`,
    `Q ${x},${y} ${x + r},${y}`,
    `L ${x + width - r},${y}`,
    `Q ${x + width},${y} ${x + width},${y + r}`,
    `L ${x + width},${y + height}`,
    "Z",
  ].join(" ");
}

export interface ChartLayout {
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
}

/** Ancho/alto por defecto del chart, a ancho completo de la página, encima del listado. */
export const FULL_CHART_LAYOUT: ChartLayout = {
  width: 500,
  height: 130,
  padding: { top: 16, right: 8, bottom: 18, left: 8 },
};

export function buildPoints(
  data: { label: string; value: number }[],
  layout: ChartLayout,
): { points: ChartPoint[]; plotWidth: number; plotHeight: number; baseline: number; max: number } {
  const { width, height, padding } = layout;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const max = Math.max(1, ...data.map((item) => item.value));
  const step = data.length > 1 ? plotWidth / (data.length - 1) : 0;

  const points = data.map((item, index) => ({
    x: padding.left + (data.length > 1 ? index * step : plotWidth / 2),
    y: padding.top + scaleValue(item.value, max, plotHeight),
    label: item.label,
    value: item.value,
  }));

  return { points, plotWidth, plotHeight, baseline: padding.top + plotHeight, max };
}