"use client";

import { useMutation, useQuery } from "@apollo/client";
import { AlertTriangle, Info, Megaphone, MessageSquare, Send, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { MemberFilters } from "@/components/members/member-filters";
import { Avatar } from "@/components/ui/avatar";
import { BadgeDot } from "@/components/ui/badge-dot";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Dropdown } from "@/components/ui/dropdown";
import { Field, Textarea, Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/sticky-header";
import { useToast } from "@/components/ui/toast";
import { fullName } from "@/lib/format";
import { SEND_NOTIFICATION } from "@/lib/graphql/broadcast";
import type { User } from "@/lib/graphql/types";
import { GET_USERS } from "@/lib/graphql/users";

const SERVER_PAGE_SIZE = 50; // ver user.service.ts — no configurable desde el cliente
const PAGE_SIZE = 10;

type NotificationType = "info" | "message" | "warning" | "error";

const TYPE_OPTIONS: { value: NotificationType; label: string }[] = [
  { value: "info", label: "Información" },
  { value: "message", label: "Mensaje" },
  { value: "warning", label: "Aviso" },
  { value: "error", label: "Urgente" },
];

const TYPE_META: Record<NotificationType, { tone: "positive" | "neutral" | "warning" | "negative"; icon: typeof Info }> = {
  info: { tone: "neutral", icon: Info },
  message: { tone: "positive", icon: MessageSquare },
  warning: { tone: "warning", icon: AlertTriangle },
  error: { tone: "negative", icon: XCircle },
};

function memberState(user: User): { tone: "positive" | "neutral" | "warning" | "negative" | "muted"; label: string } {
  if (user.isBlocked) return { tone: "negative", label: "Bloqueado" };
  if (user.isPending) return { tone: "warning", label: "Pendiente" };
  if (user.isActive === false) return { tone: "muted", label: "Inactivo" };
  return { tone: "positive", label: "Activo" };
}

export default function BroadcastPage() {
  const toast = useToast();

  // ── Audiencia (mismo patrón de filtros + paginación de Miembros) ──
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [state, setState] = useState("");
  const [serverPage, setServerPage] = useState(0);
  const [subPage, setSubPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedUsers, setSelectedUsers] = useState<Map<string, User>>(new Map());

  useEffect(() => {
    const timeout = setTimeout(() => {
      setQuery(search);
      setServerPage(0);
      setSubPage(0);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const { data, loading } = useQuery<{ getUsers: { users: User[] | null } }>(GET_USERS, {
    variables: {
      query: query || undefined,
      page: serverPage,
      roleFilter: role ? [role] : undefined,
      stateFilter: state || undefined,
    },
  });

  const batch = data?.getUsers?.users ?? [];
  const users = batch.slice(subPage * PAGE_SIZE, subPage * PAGE_SIZE + PAGE_SIZE);

  const hasMoreInBatch = (subPage + 1) * PAGE_SIZE < batch.length;
  const hasMoreServerPages = batch.length === SERVER_PAGE_SIZE;
  const canGoNext = hasMoreInBatch || (subPage === Math.floor((batch.length - 1) / PAGE_SIZE) && hasMoreServerPages);
  const canGoPrev = subPage > 0 || serverPage > 0;

  const goNext = () => {
    if (hasMoreInBatch) setSubPage((value) => value + 1);
    else if (hasMoreServerPages) {
      setServerPage((value) => value + 1);
      setSubPage(0);
    }
  };
  const goPrev = () => {
    if (subPage > 0) setSubPage((value) => value - 1);
    else if (serverPage > 0) {
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
    setSelectedUsers((current) => {
      const next = new Map(current);
      if (next.has(user.id)) next.delete(user.id);
      else next.set(user.id, user);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const allSelected = users.length > 0 && users.every((user) => selectedIds.has(user.id));
    setSelectedIds((current) => {
      const next = new Set(current);
      users.forEach((user) => (allSelected ? next.delete(user.id) : next.add(user.id)));
      return next;
    });
    setSelectedUsers((current) => {
      const next = new Map(current);
      users.forEach((user) => (allSelected ? next.delete(user.id) : next.set(user.id, user)));
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectedUsers(new Map());
  };

  // ── Composición del mensaje ──
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<NotificationType>("info");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [sendNotification, { loading: sending }] = useMutation(SEND_NOTIFICATION);

  const canSend = title.trim().length > 0 && body.trim().length > 0 && selectedIds.size > 0;

  const handleSend = async () => {
    const { data: result } = await sendNotification({
      variables: {
        notification: {
          title: title.trim(),
          body: body.trim(),
          forAll: false,
          userIds: [...selectedIds],
          type,
        },
      },
    });

    setConfirmOpen(false);

    if (result?.sendNotification?.success) {
      toast(`Notificación enviada a ${selectedIds.size} ${selectedIds.size === 1 ? "miembro" : "miembros"}`);
      setTitle("");
      setBody("");
      clearSelection();
    } else {
      toast(result?.sendNotification?.message ?? "No se pudo enviar la notificación", "error");
    }
  };

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
      key: "state",
      header: "Estado",
      render: (user) => {
        const { tone, label } = memberState(user);
        return <BadgeDot tone={tone} label={label} />;
      },
    },
  ];

  const TypeIcon = TYPE_META[type].icon;

  return (
    <PageShell
      header={
        <PageHeader
          title="Notificaciones push"
          subtitle="Envía notificaciones push a una selección de miembros"
        />
      }
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-card">
            <div className="mb-5 flex items-center gap-2">
              <Megaphone size={16} strokeWidth={1.5} className="text-primary" />
              <h2 className="text-sm font-medium text-zinc-900">Componer mensaje</h2>
            </div>

            <div className="space-y-5">
              <Field label="Título">
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ej. Cierre por vacaciones"
                  maxLength={80}
                />
              </Field>

              <Field label="Mensaje">
                <Textarea
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Escribe el contenido de la notificación…"
                  rows={5}
                  maxLength={400}
                />
              </Field>

              <Field label="Tipo">
                <Dropdown
                  options={TYPE_OPTIONS}
                  value={type}
                  onChange={(value) => setType(value as NotificationType)}
                />
              </Field>

              <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <TypeIcon size={14} strokeWidth={1.5} />
                    Destinatarios seleccionados
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-zinc-900">{selectedIds.size}</span>
                </div>
                {selectedIds.size > 0 ? (
                  <button
                    onClick={clearSelection}
                    className="mt-1 text-xs text-zinc-400 underline-offset-2 hover:text-zinc-600 hover:underline"
                  >
                    Limpiar selección
                  </button>
                ) : (
                  <p className="mt-1 text-xs text-zinc-400">Selecciona miembros en la tabla de la derecha</p>
                )}
              </div>

              <Button
                variant="primary"
                className="w-full"
                disabled={!canSend || sending}
                onClick={() => setConfirmOpen(true)}
              >
                <Send size={15} strokeWidth={1.5} />
                Enviar notificación
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
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

          <DataTable
            columns={columns}
            rows={users}
            rowKey={(user) => user.id}
            loading={loading}
            emptyMessage="No hay miembros que coincidan con los filtros"
            selection={{ selectedIds, onToggle: toggleSelected, onToggleAll: toggleSelectAll }}
          />

          <div className="mt-4 flex items-center justify-end gap-2">
            <span className="text-xs tabular-nums text-zinc-400">
              Página {serverPage * (SERVER_PAGE_SIZE / PAGE_SIZE) + subPage + 1}
            </span>
            <Button size="sm" variant="ghost" disabled={!canGoPrev} onClick={goPrev}>
              Anterior
            </Button>
            <Button size="sm" variant="ghost" disabled={!canGoNext} onClick={goNext}>
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Enviar notificación push"
        description={`Se enviará "${title}" a ${selectedIds.size} ${
          selectedIds.size === 1 ? "miembro" : "miembros"
        } seleccionados: ${[...selectedUsers.values()].slice(0, 3).map(fullName).join(", ")}${
          selectedUsers.size > 3 ? `, +${selectedUsers.size - 3} más` : ""
        }. Esta acción no se puede deshacer.`}
        confirmLabel={sending ? "Enviando…" : "Enviar"}
        loading={sending}
        onConfirm={handleSend}
        onCancel={() => setConfirmOpen(false)}
      />
    </PageShell>
  );
}
