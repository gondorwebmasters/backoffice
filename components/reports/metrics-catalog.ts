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
  group: MetricGroupId;
}

export const METRIC_GROUPS: { id: MetricGroupId }[] = [{ id: "users" }, { id: "financial" }, { id: "promotions" }];

export const METRICS: MetricDefinition[] = [
  { id: "totalUsers", group: "users" },
  { id: "churnedUsers", group: "users" },
  { id: "newUsersByMonth", group: "users" },
  { id: "churnedUsersByMonth", group: "users" },
  { id: "usersByAgeRange", group: "users" },
  { id: "totalRevenue", group: "financial" },
  { id: "revenueByMonth", group: "financial" },
  { id: "productsSold", group: "financial" },
  { id: "promotionsApplied", group: "promotions" },
  { id: "promotionsAppliedByMonth", group: "promotions" },
];

export const ALL_METRIC_IDS: MetricId[] = METRICS.map((metric) => metric.id);

export function metricsInGroup(group: MetricGroupId): MetricId[] {
  return METRICS.filter((metric) => metric.group === group).map((metric) => metric.id);
}

export interface ReportLabels {
  kpis: {
    totalUsers: string;
    churnedUsers: string;
    totalRevenue: string;
    productsSold: string;
    promotionsApplied: string;
  };
  sections: {
    newUsersByMonth: string;
    churnedUsersByMonth: string;
    usersByAgeRange: string;
    revenueByMonth: string;
    promotionsAppliedByMonth: string;
  };
  noDataPeriod: string;
  noDataAvailable: string;
  noMetricsSelected: string;
  summary: string;
  subtitle: string;
  footer: string;
}
