"use client";

import { Search } from "lucide-react";

import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";

export const ROLE_OPTIONS = [
  { value: "standard", label: "Estándar" },
  { value: "coach", label: "Coach" },
  { value: "admin", label: "Admin" },
];

export const STATE_OPTIONS = [
  { value: "new", label: "Nuevos (30 días)" },
  { value: "pending", label: "Pendientes de admisión" },
  { value: "inactive", label: "Inactivos" },
  { value: "blocked", label: "Bloqueados" },
  { value: "notVerified", label: "Sin verificar" },
];

interface MemberFiltersProps {
  search: string;
  onSearch: (value: string) => void;
  role: string;
  onRole: (value: string) => void;
  state: string;
  onState: (value: string) => void;
}

export function MemberFilters({ search, onSearch, role, onRole, state, onState }: MemberFiltersProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <div className="relative w-72">
        <Search size={15} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <Input
          placeholder="Buscar por nombre, email o usuario…"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          className="pl-9"
        />
      </div>
      <Dropdown
        options={ROLE_OPTIONS}
        placeholder="Todos los roles"
        value={role}
        onChange={onRole}
        clearable
        className="w-44"
      />
      <Dropdown
        options={STATE_OPTIONS}
        placeholder="Todos los estados"
        value={state}
        onChange={onState}
        clearable
        className="w-52"
      />
    </div>
  );
}
