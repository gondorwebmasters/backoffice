"use client";

import { useQuery } from "@apollo/client";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { BulkActionsBar } from "@/components/members/bulk-actions-bar";
import { CreateMemberForm } from "@/components/members/create-member-form";
import { MemberFilters } from "@/components/members/member-filters";
import { MemberPanel } from "@/components/members/member-panel";
import { Avatar } from "@/components/ui/avatar";
import { BadgeDot } from "@/components/ui/badge-dot";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/sticky-header";
import { fullName } from "@/lib/format";
import type { User } from "@/lib/graphql/types";
import { GET_USERS } from "@/lib/graphql/users";

const SERVER_PAGE_SIZE = 50; // ver user.service.ts — no configurable desde el cliente
const PAGE_SIZE = 10; // tamaño de página mostrado en la tabla

function useMemberState() {
  const t = useTranslations("members.page.stateLabels");
  return (user: User): { tone: "positive" | "neutral" | "warning" | "negative" | "muted"; label: string } => {
    if (user.isBlocked) return { tone: "negative", label: t("blocked") };
    if (user.isPending) return { tone: "warning", label: t("pending") };
    if (user.isActive === false) return { tone: "muted", label: t("inactive") };
    return { tone: "positive", label: t("active") };
  };
}

function MembersContent() {
  const t = useTranslations("members.page");
  const memberState = useMemberState();
  const roleLabels = useTranslations("members.page.roleLabels");
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [role, setRole] = useState("");
  const [state, setState] = useState(searchParams.get("state") ?? "");
  // La API solo pagina en bloques de 50 (SERVER_PAGE_SIZE); subPage divide
  // cada bloque ya cargado en páginas de 10 sin peticiones extra de red.
  const [serverPage, setServerPage] = useState(0);
  const [subPage, setSubPage] = useState(0);
  const [selected, setSelected] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timeout = setTimeout(() => {
      setQuery(search);
      setServerPage(0);
      setSubPage(0);
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
      page: serverPage,
      roleFilter: role ? [role] : undefined,
      stateFilter: state || undefined,
    },
  });

  const batch = data?.getUsers?.users ?? [];
  const users = batch.slice(subPage * PAGE_SIZE, subPage * PAGE_SIZE + PAGE_SIZE);
  const selectedUsers = users.filter((user) => selectedIds.has(user.id));

  const hasMoreInBatch = (subPage + 1) * PAGE_SIZE < batch.length;
  const hasMoreServerPages = batch.length === SERVER_PAGE_SIZE;
  const canGoNext = hasMoreInBatch || (subPage === Math.floor((batch.length - 1) / PAGE_SIZE) && hasMoreServerPages);
  const canGoPrev = subPage > 0 || serverPage > 0;

  const goNext = () => {
    if (hasMoreInBatch) {
      setSubPage((value) => value + 1);
    } else if (hasMoreServerPages) {
      setServerPage((value) => value + 1);
      setSubPage(0);
    }
  };

  const goPrev = () => {
    if (subPage > 0) {
      setSubPage((value) => value - 1);
    } else if (serverPage > 0) {
      setServerPage((value) => value - 1);
      setSubPage(Math.floor((SERVER_PAGE_SIZE - 1) / PAGE_SIZE));
    }
  };

  const toggleSelected = (user: User) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(user.id)) next.delete(user.id);
      else next.add(user.id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((current) => {
      const allSelected = users.length > 0 && users.every((user) => current.has(user.id));
      if (allSelected) return new Set();
      return new Set(users.map((user) => user.id));
    });
  };

  const columns: Column<User>[] = [
    {
      key: "member",
      header: t("columns.member"),
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
      header: t("columns.role"),
      render: (user) => (
        <span className="text-zinc-600">
          {["standard", "coach", "admin"].includes(user.contextRole ?? "")
            ? roleLabels(user.contextRole as "standard" | "coach" | "admin")
            : "—"}
        </span>
      ),
    },
    {
      key: "phone",
      header: t("columns.phone"),
      render: (user) => <span className="text-zinc-600">{user.phoneNumber ?? "—"}</span>,
    },
    {
      key: "state",
      header: t("columns.state"),
      render: (user) => {
        const { tone, label } = memberState(user);
        return <BadgeDot tone={tone} label={label} />;
      },
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
                  <Plus size={15} strokeWidth={1.5} />
                  {t("newMember")}
                </Button>
              }
            />

            <MemberFilters
              search={search}
              onSearch={setSearch}
              role={role}
              onRole={(value) => {
                setRole(value);
                setServerPage(0);
                setSubPage(0);
              }}
              state={state}
              onState={(value) => {
                setState(value);
                setServerPage(0);
                setSubPage(0);
              }}
            />
          </>
        }
      >
      <BulkActionsBar
        users={selectedUsers}
        onClear={() => setSelectedIds(new Set())}
        onDone={() => {
          setSelectedIds(new Set());
          refetch();
        }}
      />

      <DataTable
        columns={columns}
        rows={users}
        rowKey={(user) => user.id}
        onRowClick={setSelected}
        loading={loading}
        emptyMessage={t("emptyTable")}
        selection={{ selectedIds, onToggle: toggleSelected, onToggleAll: toggleSelectAll }}
      />

      <div className="mt-4 flex items-center justify-end gap-2">
        <span className="text-xs tabular-nums text-zinc-400">
          {t("pageLabel", { page: serverPage * (SERVER_PAGE_SIZE / PAGE_SIZE) + subPage + 1 })}
        </span>
        <Button size="sm" variant="ghost" disabled={!canGoPrev} onClick={goPrev}>
          <ChevronLeft size={15} strokeWidth={1.5} />
        </Button>
        <Button size="sm" variant="ghost" disabled={!canGoNext} onClick={goNext}>
          <ChevronRight size={15} strokeWidth={1.5} />
        </Button>
      </div>
      </PageShell>

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
