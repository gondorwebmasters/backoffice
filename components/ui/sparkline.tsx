"use client";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Mini-gráfico de tendencia decorativo (serie única, sin ejes ni leyenda).
 * El valor real siempre debe mostrarse como texto junto a él — el sparkline
 * solo aporta forma de la tendencia. Trazo 2px en --primary-chart (variante
 * del acento validada por modo claro/oscuro).
 */
export function Sparkline({ data, width = 96, height = 28, className }: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 2; // deja sitio al grosor del trazo

  const points = data.map((value, index) => {
    const x = pad + (index / (data.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (value - min) / range) * (height - pad * 2);
    return [x, y] as const;
  });

  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${pad},${height} ${line} ${width - pad},${height}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <polygon points={area} className="fill-primary-chart/10" />
      <polyline
        points={line}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-primary-chart"
      />
    </svg>
  );
}
