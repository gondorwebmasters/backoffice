import type { ReactNode } from "react";

import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { ReportMetricsData } from "@/lib/graphql/reports";

import { FULL_CHART_LAYOUT } from "./chart-geometry";
import type { MetricId } from "./metrics-catalog";
import { PdfAreaChart } from "./pdf-area-chart";
import { PdfBarChart } from "./pdf-bar-chart";
import { PdfVerticalBarChart } from "./pdf-vertical-bar-chart";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 36,
    fontSize: 10,
    color: "#18181B",
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomStyle: "solid",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#18181B",
  },
  headerSubtitle: {
    marginTop: 3,
    fontSize: 9,
    color: "#71717A",
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 8,
    color: "#18181B",
  },
  chartWrap: {
    marginBottom: 10,
  },
  kpiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  kpiCard: {
    width: 150,
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#FAFAFA",
    border: "1px solid #E4E4E7",
  },
  kpiLabel: {
    fontSize: 8,
    color: "#71717A",
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: 700,
    color: "#18181B",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    textAlign: "center",
    fontSize: 8,
    color: "#A1A1AA",
    borderTop: "0.5px solid #E4E4E7",
    paddingTop: 8,
  },
  empty: {
    fontSize: 9,
    color: "#A1A1AA",
  },
  watermark: {
    position: "absolute",
    top: 210,
    left: 88,
    width: 420,
    height: 420,
    opacity: 0.1,
  },
});

function formatEuros(cents: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(cents);
}

interface ReportDocumentProps {
  selectedMetrics: MetricId[];
  data: ReportMetricsData;
  gymName: string;
  owner: string;
  generatedAt: Date;
  logoUrl?: string;
  accentColor?: string;
}

export function ReportDocument({
  selectedMetrics,
  data,
  gymName,
  owner,
  generatedAt,
  logoUrl,
  accentColor = "#EF4444",
}: ReportDocumentProps) {
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
      chart: points.length > 0 ? <PdfVerticalBarChart layout={FULL_CHART_LAYOUT} color={accentColor} data={points} /> : null,
      list:
        points.length > 0 ? (
          <PdfBarChart color={accentColor} data={points} />
        ) : (
          <Text style={styles.empty}>Sin datos en el período.</Text>
        ),
    });
  }

  if (has("churnedUsersByMonth")) {
    const points = data.churnedUsersByMonth.map((item) => ({ label: item.month, value: item.count }));
    metricSections.push({
      key: "churnedUsersByMonth",
      title: "Bajas por mes",
      chart: points.length > 0 ? <PdfVerticalBarChart layout={FULL_CHART_LAYOUT} color={accentColor} data={points} /> : null,
      list:
        points.length > 0 ? (
          <PdfBarChart color={accentColor} data={points} />
        ) : (
          <Text style={styles.empty}>Sin datos en el período.</Text>
        ),
    });
  }

  if (has("usersByAgeRange")) {
    const points = data.usersByAgeRange.map((item) => ({ label: item.range, value: item.count }));
    metricSections.push({
      key: "usersByAgeRange",
      title: "Clientes por rango de edad",
      chart: points.length > 0 ? <PdfVerticalBarChart layout={FULL_CHART_LAYOUT} color={accentColor} data={points} /> : null,
      list:
        points.length > 0 ? (
          <PdfBarChart color={accentColor} data={points} />
        ) : (
          <Text style={styles.empty}>Sin datos disponibles.</Text>
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
          <PdfAreaChart layout={FULL_CHART_LAYOUT} color={accentColor} data={points} formatValue={formatEuros} />
        ) : null,
      list:
        points.length > 0 ? (
          <PdfBarChart color={accentColor} data={points} formatValue={formatEuros} />
        ) : (
          <Text style={styles.empty}>Sin datos disponibles.</Text>
        ),
    });
  }

  if (has("promotionsAppliedByMonth")) {
    const points = data.promotionsAppliedByMonth.map((item) => ({ label: item.month, value: item.count }));
    metricSections.push({
      key: "promotionsAppliedByMonth",
      title: "Promociones aplicadas por mes",
      chart: points.length > 0 ? <PdfVerticalBarChart layout={FULL_CHART_LAYOUT} color={accentColor} data={points} /> : null,
      list:
        points.length > 0 ? (
          <PdfBarChart color={accentColor} data={points} />
        ) : (
          <Text style={styles.empty}>Sin datos en el período.</Text>
        ),
    });
  }

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {logoUrl ? <Image src={logoUrl} style={styles.watermark} fixed /> : null}

        <View style={[styles.header, { borderBottomColor: accentColor }]} fixed>
          <Text style={styles.headerTitle}>{gymName}</Text>
          <Text style={styles.headerSubtitle}>
            Owner: {owner} · Generado el {dateLabel}
          </Text>
        </View>

        {selectedMetrics.length === 0 ? (
          <Text style={styles.empty}>No hay métricas seleccionadas. Marca al menos una en el panel izquierdo.</Text>
        ) : null}

        {kpis.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumen</Text>
            <View style={styles.kpiRow}>
              {kpis.map((kpi) => (
                <View key={kpi.id} style={styles.kpiCard}>
                  <Text style={styles.kpiLabel}>{kpi.label}</Text>
                  <Text style={styles.kpiValue}>{kpi.value}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {metricSections.map((section) => (
          <View key={section.key} style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.chart ? <View style={styles.chartWrap}>{section.chart}</View> : null}
            {section.list}
          </View>
        ))}

        <Text style={styles.footer} fixed>
          FitConnect 2026 - Todos los derechos reservados
        </Text>
      </Page>
    </Document>
  );
}
