"use client";

import { useQuery } from "@apollo/client";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { CreateCompanyForm, EditCompanyForm } from "@/components/system/company-form";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/sticky-header";
import { SlideOver } from "@/components/ui/slide-over";
import { GET_COMPANIES } from "@/lib/graphql/companies";
import type { Company } from "@/lib/graphql/types";

export default function SystemCompaniesPage() {
  const t = useTranslations("system.companies");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  // getCompanies pagina 1-based con páginas de 10 (company.service.ts)
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Company | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const { data, loading, refetch } = useQuery<{ getCompanies: { companies: Company[] | null } }>(GET_COMPANIES, {
    variables: { page, query: query || undefined },
  });

  const companies = data?.getCompanies?.companies ?? [];

  const columns: Column<Company>[] = [
    {
      key: "company",
      header: t("columns.company"),
      render: (company) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm" name={company.name} url={company.logo?.url} />
          <div>
            <p className="font-medium text-zinc-900">{company.name}</p>
            <p className="text-xs text-zinc-400">{company.email}</p>
          </div>
        </div>
      ),
    },
    { key: "phone", header: t("columns.phone"), render: (company) => <span className="text-zinc-600">{company.phoneNumber ?? "—"}</span> },
    { key: "address", header: t("columns.address"), render: (company) => <span className="text-zinc-600">{company.address ?? "—"}</span> },
    {
      key: "code",
      header: t("columns.code"),
      render: (company) => <span className="font-mono text-xs text-zinc-500">{company.code ?? "—"}</span>,
    },
  ];

  return (
    <>
      <PageShell
        header={
          <>
            <PageHeader
              title={t("title")}
              subtitle={t("subtitle")}
              actions={
                <Button variant="primary" onClick={() => setCreating(true)}>
                  <Plus size={15} strokeWidth={2} />
                  {t("newCompany")}
                </Button>
              }
            />

            <div className="relative mb-6 w-72">
              <Search size={15} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
              />
            </div>
          </>
        }
      >
        <DataTable
          columns={columns}
          rows={companies}
          rowKey={(company) => company.id}
          onRowClick={setSelected}
          loading={loading}
          emptyMessage={t("emptyTable")}
        />

        <div className="mt-4 flex items-center justify-end gap-2">
          <span className="text-xs text-zinc-400">{t("pageLabel", { page })}</span>
          <Button size="sm" variant="ghost" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>
            <ChevronLeft size={15} strokeWidth={1.5} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={companies.length < 10}
            onClick={() => setPage((value) => value + 1)}
          >
            <ChevronRight size={15} strokeWidth={1.5} />
          </Button>
        </div>
      </PageShell>

      <SlideOver open={creating} onClose={() => setCreating(false)} title={t("newCompany")} subtitle={t("newCompanySubtitle")}>
        <CreateCompanyForm
          onDone={() => {
            setCreating(false);
            refetch();
          }}
        />
      </SlideOver>

      <SlideOver
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ""}
        subtitle={selected?.email}
      >
        {selected ? (
          <EditCompanyForm
            key={selected.id}
            company={selected}
            onDone={() => {
              setSelected(null);
              refetch();
            }}
          />
        ) : null}
      </SlideOver>
    </>
  );
}
