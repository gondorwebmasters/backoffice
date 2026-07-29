"use client";

import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { Building2, Check, ChevronsUpDown, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { SET_ACTIVE_COMPANY } from "@/lib/graphql/auth";
import { GET_ACTIVE_COMPANY_NAME, GET_COMPANY_OPTIONS } from "@/lib/graphql/companies";
import { cn } from "@/lib/cn";

import { useSession } from "./session-provider";

type CompanyOption = { id: string; name: string };

type CompanyOptionsData = {
  getCompanies: { success: boolean; companies: CompanyOption[] | null } | null;
};

export function CompanySwitcher() {
  const { user, companies } = useSession();
  const t = useTranslations("companySwitcher");
  const client = useApolloClient();
  const [setActiveCompany, { loading: switching }] = useMutation(SET_ACTIVE_COMPANY);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin = Boolean(user?.isSuperAdmin);

  // Superadmin: todas las empresas del sistema, con búsqueda en servidor.
  const { data: optionsData, loading: loadingOptions } = useQuery<CompanyOptionsData>(
    GET_COMPANY_OPTIONS,
    {
      variables: { page: 1, query: search || undefined },
      skip: !isSuperAdmin || !open,
      fetchPolicy: "cache-and-network",
    },
  );

  // La empresa activa puede no estar en me.companies (superadmin gestionando
  // una ajena): resolvemos su nombre aparte para que el trigger siempre la muestre.
  const activeInSession = companies.some((company) => company.id === user?.activeCompanyId);
  const { data: activeData } = useQuery<{
    getCompanies: { company: CompanyOption | null } | null;
  }>(GET_ACTIVE_COMPANY_NAME, {
    variables: { companyId: user?.activeCompanyId },
    skip: !user?.activeCompanyId || activeInSession,
  });

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;
  if (!isSuperAdmin && companies.length < 2) return null;

  const options: CompanyOption[] = isSuperAdmin
    ? (optionsData?.getCompanies?.companies ?? [])
    : companies.filter((company) =>
        company.name.toLowerCase().includes(search.trim().toLowerCase()),
      );

  const fetchedActive = activeData?.getCompanies?.company;
  const activeCompany =
    companies.find((company) => company.id === user.activeCompanyId) ??
    (fetchedActive?.id === user.activeCompanyId ? fetchedActive : undefined) ??
    options.find((company) => company.id === user.activeCompanyId);

  const handleSelect = async (companyId: string) => {
    setOpen(false);
    setSearch("");
    if (!companyId || companyId === user.activeCompanyId) return;
    await setActiveCompany({ variables: { companyId } });
    await client.resetStore();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        disabled={switching}
        className="flex h-8 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-600 shadow-sm transition-colors hover:border-zinc-300 hover:text-zinc-900 disabled:opacity-60"
      >
        <Building2 size={13} strokeWidth={1.5} className="text-zinc-400" />
        <span className="max-w-40 truncate">
          {switching ? t("switching") : (activeCompany?.name ?? t("select"))}
        </span>
        <ChevronsUpDown size={12} strokeWidth={1.5} className="text-zinc-400" />
      </button>

      {open ? (
        <div className="absolute right-0 top-10 z-50 w-64 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-pop">
          <div className="flex items-center gap-2 border-b border-zinc-100 px-3">
            <Search size={13} strokeWidth={1.5} className="text-zinc-400" />
            <input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-9 w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {options.map((company) => (
              <li key={company.id}>
                <button
                  onClick={() => handleSelect(company.id)}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-zinc-50",
                    company.id === user.activeCompanyId
                      ? "font-medium text-zinc-900"
                      : "text-zinc-600",
                  )}
                >
                  <span className="truncate">{company.name}</span>
                  {company.id === user.activeCompanyId ? (
                    <Check size={13} strokeWidth={2} className="shrink-0 text-primary" />
                  ) : null}
                </button>
              </li>
            ))}
            {options.length === 0 ? (
              <li className="px-3 py-6 text-center text-xs text-zinc-400">
                {loadingOptions ? t("loading") : t("noResults")}
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}