"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/sticky-header";

const ReportsView = dynamic(() => import("@/components/reports/reports-view").then((mod) => mod.ReportsView), {
  ssr: false,
});

export default function ReportsPage() {
  const t = useTranslations("reports.page");
  return (
    <PageShell
      header={<PageHeader title={t("title")} subtitle={t("subtitle")} />}
    >
      <ReportsView />
    </PageShell>
  );
}
