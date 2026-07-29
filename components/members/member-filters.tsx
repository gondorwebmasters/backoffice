"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";

export function useRoleOptions() {
  const t = useTranslations("members.filters.roleOptions");
  return [
    { value: "standard", label: t("standard") },
    { value: "coach", label: t("coach") },
    { value: "admin", label: t("admin") },
  ];
}

export function useStateOptions() {
  const t = useTranslations("members.filters.stateOptions");
  return [
    { value: "new", label: t("new") },
    { value: "pending", label: t("pending") },
    { value: "inactive", label: t("inactive") },
    { value: "blocked", label: t("blocked") },
    { value: "notVerified", label: t("notVerified") },
  ];
}

interface MemberFiltersProps {
  search: string;
  onSearch: (value: string) => void;
  role: string;
  onRole: (value: string) => void;
  state: string;
  onState: (value: string) => void;
}

export function MemberFilters({ search, onSearch, role, onRole, state, onState }: MemberFiltersProps) {
  const t = useTranslations("members.filters");
  const roleOptions = useRoleOptions();
  const stateOptions = useStateOptions();

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <div className="relative w-72">
        <Search size={15} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          className="pl-9"
        />
      </div>
      <Dropdown
        options={roleOptions}
        placeholder={t("allRoles")}
        value={role}
        onChange={onRole}
        clearable
        className="w-44"
      />
      <Dropdown
        options={stateOptions}
        placeholder={t("allStates")}
        value={state}
        onChange={onState}
        clearable
        className="w-52"
      />
    </div>
  );
}
