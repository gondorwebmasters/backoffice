"use client";

import type { ReactNode } from "react";

import type { ReportMetricsData } from "@/lib/graphql/reports";

import { FULL_CHART_LAYOUT } from "./chart-geometry";
import { HtmlAreaChart } from "./html-area-chart";
import { HtmlBarChart } from "./html-bar-chart";
import { HtmlVerticalBarChart } from "./html-vertical-bar-chart";
import type { MetricId } from "./metrics-catalog";

function formatEuros(cents: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(cents);
}

interface ReportPreviewHtmlProps {
  selectedMetrics: MetricId[];
  data: ReportMetricsData;
  gymName: string;
  owner: string;
  generatedAt: Date;
  logoUrl?: string;
}

/**
 * Espejo en HTML/CSS de `ReportDocument`, usado solo para la vista previa
 * inline. Recompilar el binario PDF (@react-pdf/renderer) en cada cambio de
 * checkbox recarga el iframe del PDFViewer entero y produce un parpadeo
 * visible — este componente es DOM normal, así que React solo reconcilia,
 * sin flash. El PDF real (para el lightbox y la descarga) sigue siendo
 * `ReportDocument`.
 */
export function ReportPreviewHtml({
  selectedMetrics,
  data,
  gymName,
  owner,
  generatedAt,
  logoUrl,
}: ReportPreviewHtmlProps) {
  const has = (id: MetricId) => selectedMetrics.includes(id);

  const kpis: { id: MetricId; label: string; value: string }[] = [
    has("totalUsers") ? { id: "totalUsers", label: "Usuarios dados de alta", value: String(data.totalUsers) } : null,
    has("churnedUsers") ? { id: "churnedUsers", label: "Usuarios de baja", value: String(data.churnedUsers) } : null,
    has("totalRevenue")
      ? { id: "totalRevenue", label: "Ingresos totales", value: formatEuros(data.totalRevenue) }
      : null,
    has("productsSold")
      ? { id: "productsSold", label: "Productos vendidos", value: String(data.productsSold) }
      : null,
    has("promotionsApplied")
      ? { id: "promotionsApplied", label: "Promociones aplicadas", value: String(data.promotionsApplied) }
      : null,
  ].filter((kpi): kpi is { id: MetricId; label: string; value: string } => kpi !== null);

  const dateLabel = new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(generatedAt);

  const metricSections: { key: string; title: string; chart: ReactNode; list: ReactNode }[] = [];

  if (has("newUsersByMonth")) {
    const points = data.newUsersByMonth.map((item) => ({ label: item.month, value: item.count }));
    metricSections.push({
      key: "newUsersByMonth",
      title: "Altas por mes",
      chart: points.length > 0 ? <HtmlVerticalBarChart layout={FULL_CHART_LAYOUT} data={points} /> : null,
      list:
        points.length > 0 ? (
          <HtmlBarChart data={points} />
        ) : (
          <p className="text-[11px] text-zinc-400">Sin datos en el período.</p>
        ),
    });
  }

  if (has("churnedUsersByMonth")) {
    const points = data.churnedUsersByMonth.map((item) => ({ label: item.month, value: item.count }));
    metricSections.push({
      key: "churnedUsersByMonth",
      title: "Bajas por mes",
      chart: points.length > 0 ? <HtmlVerticalBarChart layout={FULL_CHART_LAYOUT} data={points} /> : null,
      list:
        points.length > 0 ? (
          <HtmlBarChart data={points} />
        ) : (
          <p className="text-[11px] text-zinc-400">Sin datos en el período.</p>
        ),
    });
  }

  if (has("usersByAgeRange")) {
    const points = data.usersByAgeRange.map((item) => ({ label: item.range, value: item.count }));
    metricSections.push({
      key: "usersByAgeRange",
      title: "Clientes por rango de edad",
      chart: points.length > 0 ? <HtmlVerticalBarChart layout={FULL_CHART_LAYOUT} data={points} /> : null,
      list:
        points.length > 0 ? (
          <HtmlBarChart data={points} />
        ) : (
          <p className="text-[11px] text-zinc-400">Sin datos disponibles.</p>
        ),
    });
  }

  if (has("revenueByMonth")) {
    const points = data.revenueByMonth.map((item) => ({ label: item.month, value: item.amount }));
    metricSections.push({
      key: "revenueByMonth",
      title: "Ingresos por mes",
      chart:
        points.length > 0 ? (
          <HtmlAreaChart layout={FULL_CHART_LAYOUT} data={points} formatValue={formatEuros} />
        ) : null,
      list:
        points.length > 0 ? (
          <HtmlBarChart data={points} formatValue={formatEuros} />
        ) : (
          <p className="text-[11px] text-zinc-400">Sin datos disponibles.</p>
        ),
    });
  }

  if (has("promotionsAppliedByMonth")) {
    const points = data.promotionsAppliedByMonth.map((item) => ({ label: item.month, value: item.count }));
    metricSections.push({
      key: "promotionsAppliedByMonth",
      title: "Promociones aplicadas por mes",
      chart: points.length > 0 ? <HtmlVerticalBarChart layout={FULL_CHART_LAYOUT} data={points} /> : null,
      list:
        points.length > 0 ? (
          <HtmlBarChart data={points} />
        ) : (
          <p className="text-[11px] text-zinc-400">Sin datos en el período.</p>
        ),
    });
  }

  return (
    <div className="relative mx-auto aspect-[210/297] w-full max-w-[720px] overflow-y-auto bg-white p-8 text-zinc-900 shadow-xl">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 w-[46%] -translate-x-1/2 -translate-y-1/2 opacity-10"
        />
      ) : null}

      <div className="relative mb-5 border-b-[1.5px] border-primary pb-3">
        <h1 className="text-lg font-bold text-zinc-900">{gymName}</h1>
        <p className="mt-0.5 text-[11px] text-zinc-500">
          Owner: {owner} · Generado el {dateLabel}
        </p>
      </div>

      <div className="relative space-y-5">
        {selectedMetrics.length === 0 ? (
          <p className="text-xs text-zinc-400">No hay métricas seleccionadas. Marca al menos una en el panel izquierdo.</p>
        ) : null}

        {kpis.length > 0 ? (
          <section>
            <h2 className="mb-2 text-[13px] font-bold text-zinc-900">Resumen</h2>
            <div className="flex flex-wrap gap-2.5">
              {kpis.map((kpi) => (
                <div key={kpi.id} className="w-[150px] rounded-md border border-zinc-200 bg-zinc-50 p-2.5">
                  <p className="mb-1 text-[9px] text-zinc-500">{kpi.label}</p>
                  <p className="text-lg font-bold text-zinc-900">{kpi.value}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {metricSections.map((section) => (
          <section key={section.key}>
            <h2 className="mb-2 text-[13px] font-bold text-zinc-900">{section.title}</h2>
            {section.chart ? <div className="mb-2.5">{section.chart}</div> : null}
            {section.list}
          </section>
        ))}
      </div>

      <p className="relative mt-8 border-t border-zinc-100 pt-2 text-center text-[9px] text-zinc-400">
        FitConnect 2026 - Todos los derechos reservados
      </p>
    </div>
  );
}
