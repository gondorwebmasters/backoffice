"use client";

import dynamic from "next/dynamic";

import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/sticky-header";

const ReportsView = dynamic(() => import("@/components/reports/reports-view").then((mod) => mod.ReportsView), {
  ssr: false,
});

export default function ReportsPage() {
  return (
    <PageShell
      header={<PageHeader title="Reportes" subtitle="Configura y previsualiza el PDF antes de descargarlo" />}
    >
      <ReportsView />
    </PageShell>
  );
}
