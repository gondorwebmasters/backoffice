import { Circle, Defs, LinearGradient, Path, Stop, Svg, Text as SvgText } from "@react-pdf/renderer";

import { buildPoints, buildSmoothLinePath, FULL_CHART_LAYOUT, type ChartLayout } from "./chart-geometry";

interface PdfAreaChartProps {
  data: { label: string; value: number }[];
  formatValue?: (value: number) => string;
  color?: string;
  layout?: ChartLayout;
}

/**
 * Equivalente vectorial (SVG nativo de @react-pdf/renderer) del área con
 * degradado que usa `RevenueTrendChart` en el dashboard.
 */
export function PdfAreaChart({ data, formatValue, color = "#EF4444", layout = FULL_CHART_LAYOUT }: PdfAreaChartProps) {
  const format = formatValue ?? ((value: number) => String(value));
  const { points, baseline } = buildPoints(data, layout);
  const gradientId = `revenueFill-${color.replace("#", "")}`;

  const linePath = buildSmoothLinePath(points);
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x},${baseline} L ${points[0].x},${baseline} Z`
      : "";

  return (
    <Svg width={layout.width} height={layout.height} viewBox={`0 0 ${layout.width} ${layout.height}`}>
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity={0.32} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>

      <Path
        d={`M ${layout.padding.left},${baseline} L ${layout.width - layout.padding.right},${baseline}`}
        stroke="#E4E4E7"
        strokeWidth={0.75}
      />

      {areaPath ? <Path d={areaPath} fill={`url(#${gradientId})`} /> : null}
      {linePath ? <Path d={linePath} stroke={color} strokeWidth={1.75} fill="none" strokeLinecap="round" /> : null}

      {points.map((point) => (
        <Circle key={point.label} cx={point.x} cy={point.y} r={2} fill={color} />
      ))}

      {points.map((point) => (
        <SvgText
          key={`${point.label}-value`}
          x={point.x}
          y={point.y - 6}
          textAnchor="middle"
          style={{ fontSize: 7 }}
          fill="#18181B"
        >
          {format(point.value)}
        </SvgText>
      ))}

      {points.map((point) => (
        <SvgText
          key={`${point.label}-label`}
          x={point.x}
          y={baseline + 12}
          textAnchor="middle"
          style={{ fontSize: 7 }}
          fill="#71717A"
        >
          {point.label}
        </SvgText>
      ))}
    </Svg>
  );
}