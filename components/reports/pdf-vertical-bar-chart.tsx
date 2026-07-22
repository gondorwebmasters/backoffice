import { Path, Svg, Text as SvgText } from "@react-pdf/renderer";

import { FULL_CHART_LAYOUT, roundedTopRectPath, type ChartLayout } from "./chart-geometry";

interface PdfVerticalBarChartProps {
  data: { label: string; value: number }[];
  formatValue?: (value: number) => string;
  color?: string;
  layout?: ChartLayout;
}

const BAR_GAP_RATIO = 0.42;

/**
 * Equivalente vectorial (SVG nativo de @react-pdf/renderer) de los bar charts
 * verticales con esquinas redondeadas del dashboard (`AgeRangeChart`,
 * `ActivityOverviewChart`, `UsersStatusChart`).
 */
export function PdfVerticalBarChart({
  data,
  formatValue,
  color = "#EF4444",
  layout = FULL_CHART_LAYOUT,
}: PdfVerticalBarChartProps) {
  const format = formatValue ?? ((value: number) => String(value));
  const { width, height, padding } = layout;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const baseline = padding.top + plotHeight;
  const max = Math.max(1, ...data.map((item) => item.value));

  const slot = data.length > 0 ? plotWidth / data.length : plotWidth;
  const barWidth = Math.min(40, slot * (1 - BAR_GAP_RATIO));

  const bars = data.map((item, index) => {
    const centerX = padding.left + slot * index + slot / 2;
    const barHeight = (item.value / max) * plotHeight;
    return {
      label: item.label,
      value: item.value,
      x: centerX - barWidth / 2,
      y: baseline - barHeight,
      height: barHeight,
      centerX,
    };
  });

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Path d={`M ${padding.left},${baseline} L ${width - padding.right},${baseline}`} stroke="#E4E4E7" strokeWidth={0.75} />

      {bars.map((bar, index) => (
        <Path
          key={bar.label}
          d={roundedTopRectPath(bar.x, bar.y, barWidth, bar.height, 4)}
          fill={color}
          fillOpacity={Math.max(0.55, 1 - index * 0.08)}
        />
      ))}

      {bars.map((bar) => (
        <SvgText
          key={`${bar.label}-value`}
          x={bar.centerX}
          y={bar.y - 4}
          textAnchor="middle"
          style={{ fontSize: 7 }}
          fill="#18181B"
        >
          {format(bar.value)}
        </SvgText>
      ))}

      {bars.map((bar) => (
        <SvgText
          key={`${bar.label}-label`}
          x={bar.centerX}
          y={baseline + 12}
          textAnchor="middle"
          style={{ fontSize: 7 }}
          fill="#71717A"
        >
          {bar.label}
        </SvgText>
      ))}
    </Svg>
  );
}