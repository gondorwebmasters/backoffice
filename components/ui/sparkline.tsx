"use client";

import { Area, AreaChart } from "recharts";

import { CHART_COLORS } from "@/components/dashboard/chart-theme";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Mini-gráfico de tendencia decorativo (serie única, sin ejes ni leyenda).
 * El valor real siempre debe mostrarse como texto junto a él — el sparkline
 * solo aporta forma de la tendencia.
 */
export function Sparkline({ data, width = 96, height = 28, className }: SparklineProps) {
  if (data.length < 2) return null;

  const points = data.map((value, index) => ({ index, value }));

  return (
    <div className={className} style={{ width, height }}>
      <AreaChart width={width} height={height} data={points} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <defs>
          <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.35} />
            <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={CHART_COLORS.primary}
          strokeWidth={2}
          fill="url(#sparkline-fill)"
          isAnimationActive={false}
        />
      </AreaChart>
    </div>
  );
}
