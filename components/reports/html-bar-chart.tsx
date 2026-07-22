interface HtmlBarChartProps {
  data: { label: string; value: number }[];
  formatValue?: (value: number) => string;
}

/** Espejo DOM/CSS de `PdfBarChart`, usado solo para la vista previa inline. */
export function HtmlBarChart({ data, formatValue }: HtmlBarChartProps) {
  const max = Math.max(1, ...data.map((item) => item.value));
  const format = formatValue ?? ((value: number) => String(value));

  return (
    <div className="space-y-1.5">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className="w-16 shrink-0 text-[10px] text-zinc-500">{item.label}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-2.5 rounded-full bg-primary transition-[width] duration-300 ease-out"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
          <span className="w-11 shrink-0 text-right text-[10px] tabular-nums text-zinc-900">{format(item.value)}</span>
        </div>
      ))}
    </div>
  );
}
