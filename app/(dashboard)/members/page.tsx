"use client";

import { useQuery } from "@apollo/client";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { CreateMemberForm } from "@/components/members/create-member-form";
import { MemberFilters } from "@/components/members/member-filters";
import { MemberPanel } from "@/components/members/member-panel";
import { Avatar } from "@/components/ui/avatar";
import { BadgeDot } from "@/components/ui/badge-dot";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { fullName } from "@/lib/format";
import type { User } from "@/lib/graphql/types";
import { GET_USERS } from "@/lib/graphql/users";

const PAGE_SIZE = 50; // ver user.service.ts

const ROLE_LABELS: Record<string, string> = { standard: "Estándar", coach: "Coach", admin: "Admin" };

function memberState(user: User): { tone: "positive" | "neutral" | "warning" | "negative" | "muted"; label: string } {
  if (user.isBlocked) return { tone: "negative", label: "Bloqueado" };
  if (user.isPending) return { tone: "warning", label: "Pendiente" };
  if (user.isActive === false) return { tone: "muted", label: "Inactivo" };
  return { tone: "positive", label: "Activo" };
}

function MembersContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [role, setRole] = useState("");
  const [state, setState] = useState(searchParams.get("state") ?? "");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setQuery(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  // Navegación desde el CommandPalette estando ya en /members
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) setSearch(q);
  }, [searchParams]);

  const { data, loading, refetch } = useQuery<{ getUsers: { users: User[] | null } }>(GET_USERS, {
    variables: {
      query: query || undefined,
      page,
      roleFilter: role ? [role] : undefined,
      stateFilter: state || undefined,
    },
  });

  const users = data?.getUsers?.users ?? [];

  const columns: Column<User>[] = [
    {
      key: "member",
      header: "Miembro",
      render: (user) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm" name={fullName(user)} url={user.pictureUrl?.url} />
          <div>
            <p className="font-medium text-zinc-900">{fullName(user)}</p>
            <p className="text-xs text-zinc-400">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Rol",
      render: (user) => (
        <span className="text-zinc-600">{ROLE_LABELS[user.contextRole ?? ""] ?? "—"}</span>
      ),
    },
    {
      key: "phone",
      header: "Teléfono",
      render: (user) => <span className="text-zinc-600">{user.phoneNumber ?? "—"}</span>,
    },
    {
      key: "state",
      header: "Estado",
      render: (user) => {
        const { tone, label } = memberState(user);
        return <BadgeDot tone={tone} label={label} />;
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Miembros"
        subtitle="Gestión de usuarios de la empresa"
        actions={
          <Button variant="primary" onClick={() => setCreating(true)}>
            <Plus size={15} strokeWidth={1.5} />
            Nuevo miembro
          </Button>
        }
      />

      <MemberFilters
        search={search}
        onSearch={setSearch}
        role={role}
        onRole={(value) => {
          setRole(value);
          setPage(0);
        }}
        state={state}
        onState={(value) => {
          setState(value);
          setPage(0);
        }}
      />

      <DataTable
        columns={columns}
        rows={users}
        rowKey={(user) => user.id}
        onRowClick={setSelected}
        loading={loading}
        emptyMessage="No hay miembros que coincidan con los filtros"
      />

      <div className="mt-4 flex items-center justify-end gap-2">
        <span className="text-xs text-zinc-400">Página {page + 1}</span>
        <Button size="sm" variant="ghost" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>
          <ChevronLeft size={15} strokeWidth={1.5} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={users.length < PAGE_SIZE}
          onClick={() => setPage((value) => value + 1)}
        >
          <ChevronRight size={15} strokeWidth={1.5} />
        </Button>
      </div>

      <MemberPanel member={selected} onClose={() => setSelected(null)} onChanged={() => refetch()} />
      <CreateMemberForm open={creating} onClose={() => setCreating(false)} onCreated={() => refetch()} />
    </>
  );
}

export default function MembersPage() {
  return (
    <Suspense>
      <MembersContent />
    </Suspense>
  );
}
