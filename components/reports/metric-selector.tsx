"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { METRIC_GROUPS, METRICS, type MetricId, metricsInGroup } from "./metrics-catalog";

interface MetricSelectorProps {
  selected: Set<MetricId>;
  onChange: (next: Set<MetricId>) => void;
}

export function MetricSelector({ selected, onChange }: MetricSelectorProps) {
  const toggle = (id: MetricId) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  };

  const selectAll = () => onChange(new Set(METRICS.map((metric) => metric.id)));
  const clearAll = () => onChange(new Set());
  const selectOnly = (ids: MetricId[]) => onChange(new Set(ids));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={selectAll}>
          Seleccionar todo
        </Button>
        <Button size="sm" variant="ghost" onClick={clearAll}>
          Limpiar selección
        </Button>
        <Button size="sm" variant="ghost" onClick={() => selectOnly(metricsInGroup("financial"))}>
          Solo ingresos
        </Button>
        <Button size="sm" variant="ghost" onClick={() => selectOnly(metricsInGroup("users"))}>
          Solo usuarios
        </Button>
      </div>

      {METRIC_GROUPS.map((group) => (
        <div key={group.id}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">{group.label}</h3>
          <div className="space-y-2">
            {METRICS.filter((metric) => metric.group === group.id).map((metric) => (
              <label
                key={metric.id}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                <Checkbox checked={selected.has(metric.id)} onChange={() => toggle(metric.id)} />
                {metric.label}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
