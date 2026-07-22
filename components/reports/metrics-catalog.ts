export type MetricId =
  | "totalUsers"
  | "churnedUsers"
  | "newUsersByMonth"
  | "churnedUsersByMonth"
  | "usersByAgeRange"
  | "totalRevenue"
  | "revenueByMonth"
  | "productsSold"
  | "promotionsApplied"
  | "promotionsAppliedByMonth";

export type MetricGroupId = "users" | "financial" | "promotions";

export interface MetricDefinition {
  id: MetricId;
  label: string;
  group: MetricGroupId;
}

export const METRIC_GROUPS: { id: MetricGroupId; label: string }[] = [
  { id: "users", label: "Usuarios & Membresías" },
  { id: "financial", label: "Financiero & Ventas" },
  { id: "promotions", label: "Promociones & Campañas" },
];

export const METRICS: MetricDefinition[] = [
  { id: "totalUsers", label: "Cantidad de usuarios dados de alta", group: "users" },
  { id: "churnedUsers", label: "Usuarios de baja", group: "users" },
  { id: "newUsersByMonth", label: "Altas por mes", group: "users" },
  { id: "churnedUsersByMonth", label: "Bajas por mes", group: "users" },
  { id: "usersByAgeRange", label: "Cantidad de clientes por rango de edad", group: "users" },
  { id: "totalRevenue", label: "Ingresos totales", group: "financial" },
  { id: "revenueByMonth", label: "Ingresos por mes", group: "financial" },
  { id: "productsSold", label: "Cantidad de productos vendidos", group: "financial" },
  { id: "promotionsApplied", label: "Cantidad de promociones aplicadas", group: "promotions" },
  { id: "promotionsAppliedByMonth", label: "Cantidad de promociones por mes", group: "promotions" },
];

export const ALL_METRIC_IDS: MetricId[] = METRICS.map((metric) => metric.id);

export function metricsInGroup(group: MetricGroupId): MetricId[] {
  return METRICS.filter((metric) => metric.group === group).map((metric) => metric.id);
}
