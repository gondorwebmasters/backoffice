"use client";

import { useQuery } from "@apollo/client";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download, Maximize2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { GET_ACTIVE_COMPANY_LOGO, GET_ACTIVE_COMPANY_NAME } from "@/lib/graphql/companies";
import { GET_REPORT_METRICS, type ReportMetricsData } from "@/lib/graphql/reports";
import { fullName } from "@/lib/format";
import { getAccentPreset } from "@/lib/theme/palette";

import { useSession } from "@/components/layout/session-provider";
import { useTheme } from "@/components/providers/theme-provider";

import { ALL_METRIC_IDS, type MetricId, type ReportLabels } from "./metrics-catalog";
import { MetricSelector } from "./metric-selector";
import { ReportDocument } from "./report-document";
import { ReportLightbox } from "./report-lightbox";
import { ReportPreviewHtml } from "./report-preview-html";

const INTL_LOCALE: Record<string, string> = { es: "es-ES", pt: "pt-PT" };

const EMPTY_METRICS: ReportMetricsData = {
  totalUsers: 0,
  churnedUsers: 0,
  newUsersByMonth: [],
  churnedUsersByMonth: [],
  usersByAgeRange: [],
  totalRevenue: 0,
  revenueByMonth: [],
  productsSold: 0,
  promotionsApplied: 0,
  promotionsAppliedByMonth: [],
};

export function ReportsView() {
  const t = useTranslations("reports.view");
  const td = useTranslations("reports.document");
  const locale = useLocale();
  const intlLocale = INTL_LOCALE[locale] ?? locale;
  const { user, companies } = useSession();
  const { accent } = useTheme();
  const accentHex = getAccentPreset(accent).hex;
  const { data, loading } = useQuery<{ getReportMetrics: { success: boolean; metrics: ReportMetricsData | null } }>(
    GET_REPORT_METRICS,
  );

  const [selected, setSelected] = useState<Set<MetricId>>(new Set(ALL_METRIC_IDS));
  const [debounced, setDebounced] = useState<Set<MetricId>>(selected);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(selected), 300);
    return () => clearTimeout(timeout);
  }, [selected]);

  const metrics = data?.getReportMetrics?.metrics ?? EMPTY_METRICS;
  const activeInSession = companies.some((company) => company.id === user?.activeCompanyId);
  const { data: activeCompanyData } = useQuery<{
    getCompanies: { company: { id: string; name: string } | null } | null;
  }>(GET_ACTIVE_COMPANY_NAME, {
    variables: { companyId: user?.activeCompanyId },
    skip: !user?.activeCompanyId || activeInSession,
  });
  const activeCompany =
    companies.find((company) => company.id === user?.activeCompanyId) ??
    activeCompanyData?.getCompanies?.company ??
    undefined;
  const gymName = activeCompany?.name ?? "FitConnect";
  const owner = fullName(user);
  const selectedMetrics = Array.from(debounced);

  const { data: logoData } = useQuery<{
    getCompanies: { company: { id: string; logo?: { url: string } | null } | null } | null;
  }>(GET_ACTIVE_COMPANY_LOGO, {
    variables: { companyId: user?.activeCompanyId },
    skip: !user?.activeCompanyId,
  });
  const rawLogoUrl = logoData?.getCompanies?.company?.logo?.url;
  const logoUrl = rawLogoUrl
    ? `/api/reports/logo?src=${encodeURIComponent(rawLogoUrl)}&color=${encodeURIComponent(accentHex)}`
    : undefined;

  const generatedAt = new Date();
  const dateLabel = new Intl.DateTimeFormat(intlLocale, { dateStyle: "long" }).format(generatedAt);
  const labels: ReportLabels = {
    kpis: {
      totalUsers: td("kpis.totalUsers"),
      churnedUsers: td("kpis.churnedUsers"),
      totalRevenue: td("kpis.totalRevenue"),
      productsSold: td("kpis.productsSold"),
      promotionsApplied: td("kpis.promotionsApplied"),
    },
    sections: {
      newUsersByMonth: td("sections.newUsersByMonth"),
      churnedUsersByMonth: td("sections.churnedUsersByMonth"),
      usersByAgeRange: td("sections.usersByAgeRange"),
      revenueByMonth: td("sections.revenueByMonth"),
      promotionsAppliedByMonth: td("sections.promotionsAppliedByMonth"),
    },
    noDataPeriod: td("noDataPeriod"),
    noDataAvailable: td("noDataAvailable"),
    noMetricsSelected: td("noMetricsSelected"),
    summary: td("summary"),
    subtitle: td("subtitle", { owner, date: dateLabel }),
    footer: td("footer"),
  };

  const document = (
    <ReportDocument
      selectedMetrics={selectedMetrics}
      data={metrics}
      gymName={gymName}
      locale={intlLocale}
      labels={labels}
      logoUrl={logoUrl}
      accentColor={accentHex}
    />
  );

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-card">
          <h2 className="mb-5 text-sm font-medium text-zinc-900">{t("reportMetrics")}</h2>
          <MetricSelector selected={selected} onChange={setSelected} />

          <div className="mt-6 border-t border-zinc-100 pt-5">
            <PDFDownloadLink document={document} fileName="reporte-fitconnect.pdf">
              {({ loading: pdfLoading }) => (
                <Button variant="primary" className="w-full" disabled={loading || pdfLoading}>
                  <Download size={15} strokeWidth={1.5} />
                  {pdfLoading ? t("preparing") : t("confirmAndDownload")}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </div>
      </div>

      <div className="lg:col-span-3">
        <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
            <h2 className="text-sm font-medium text-zinc-900">{t("preview")}</h2>
            <Button size="sm" variant="secondary" onClick={() => setLightboxOpen(true)}>
              <Maximize2 size={13} strokeWidth={1.5} />
              {t("viewFull")}
            </Button>
          </div>
          <div className="max-h-[730px] overflow-y-auto bg-zinc-100 p-6">
            <ReportPreviewHtml
              selectedMetrics={selectedMetrics}
              data={metrics}
              gymName={gymName}
              locale={intlLocale}
              labels={labels}
              logoUrl={logoUrl}
            />
          </div>
        </div>
      </div>

      <ReportLightbox open={lightboxOpen} onClose={() => setLightboxOpen(false)} document={document} />
    </div>
  );
}
