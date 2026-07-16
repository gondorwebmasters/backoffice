"use client";

import { useMutation, useQuery } from "@apollo/client";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, Input, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { SlideOver } from "@/components/ui/slide-over";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/format";
import { CREATE_POLL, GET_ADMIN_POLLS, REMOVE_POLLS } from "@/lib/graphql/polls";
import type { Poll } from "@/lib/graphql/types";

function PollCard({ poll, onRemove }: { poll: Poll; onRemove: () => void }) {
  const votes = poll.pollVotes ?? [];
  const total = votes.length;
  const ended = new Date(Number(poll.endDate) || poll.endDate) < new Date();

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-card">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-zinc-900">{poll.title}</h3>
          <p className="mt-0.5 text-xs text-zinc-400">
            {ended ? "Finalizada" : "Abierta"} · hasta {formatDate(poll.endDate)} · {total}{" "}
            {total === 1 ? "voto" : "votos"}
          </p>
        </div>
        <button
          onClick={onRemove}
          className="rounded-lg p-1.5 text-zinc-300 transition-colors hover:bg-red-50 hover:text-red-500"
          title="Eliminar encuesta"
        >
          <Trash2 size={15} strokeWidth={1.5} />
        </button>
      </div>
      <ul className="space-y-3">
        {poll.options.map((option) => {
          const count = votes.filter((vote) => vote.optionSelected === option).length;
          const percentage = total === 0 ? 0 : Math.round((count / total) * 100);
          return (
            <li key={option} title={`${option}: ${count} votos (${percentage}%)`}>
              <div className="mb-1 flex items-baseline justify-between text-sm">
                <span className="text-zinc-600">{option}</span>
                <span className="tabular-nums text-zinc-400">
                  {count} · {percentage}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-100">
                <div className="h-1.5 rounded-full bg-zinc-900" style={{ width: `${percentage}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function PollsPage() {
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState<Poll | null>(null);
  const [form, setForm] = useState({ title: "", options: "", endDate: "" });

  const { data, loading, refetch } = useQuery<{ getAdminPolls: { polls: Poll[] | null } }>(GET_ADMIN_POLLS);
  const [createPoll, createState] = useMutation(CREATE_POLL);
  const [removePolls, removeState] = useMutation(REMOVE_POLLS);

  const polls = data?.getAdminPolls?.polls ?? [];

  const options = form.options
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const handleCreate = async () => {
    const { data: result } = await createPoll({
      variables: { poll: { title: form.title, options, endDate: form.endDate } },
    });
    if (result?.createPoll?.success) {
      toast("Encuesta creada");
      setForm({ title: "", options: "", endDate: "" });
      setCreating(false);
      refetch();
    } else {
      toast(result?.createPoll?.message ?? "No se pudo crear", "error");
    }
  };

  const handleRemove = async () => {
    if (!removing) return;
    const { data: result } = await removePolls({ variables: { ids: [removing.id] } });
    if (result?.removePolls?.success) {
      toast("Encuesta eliminada");
      refetch();
    } else {
      toast(result?.removePolls?.message ?? "No se pudo eliminar", "error");
    }
    setRemoving(null);
  };

  return (
    <>
      <PageHeader
        title="Encuestas"
        subtitle="Consultas a los miembros y resultados"
        actions={
          <Button variant="primary" onClick={() => setCreating(true)}>
            <Plus size={15} strokeWidth={1.5} />
            Nueva encuesta
          </Button>
        }
      />

      {loading && polls.length === 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-40 animate-pulse rounded-xl bg-zinc-100" />
          <div className="h-40 animate-pulse rounded-xl bg-zinc-100" />
        </div>
      ) : polls.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-200 py-16 text-center text-sm text-zinc-400">
          Aún no hay encuestas
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} onRemove={() => setRemoving(poll)} />
          ))}
        </div>
      )}

      <SlideOver
        open={creating}
        onClose={() => setCreating(false)}
        title="Nueva encuesta"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={createState.loading || !form.title || options.length < 2 || !form.endDate}
            >
              {createState.loading ? "Creando…" : "Publicar encuesta"}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Field label="Pregunta">
            <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </Field>
          <Field label="Opciones" hint="Una por línea, mínimo dos">
            <Textarea
              rows={4}
              value={form.options}
              onChange={(event) => setForm({ ...form, options: event.target.value })}
            />
          </Field>
          <Field label="Fecha de cierre">
            <Input
              type="date"
              value={form.endDate}
              onChange={(event) => setForm({ ...form, endDate: event.target.value })}
            />
          </Field>
        </div>
      </SlideOver>

      <ConfirmDialog
        open={Boolean(removing)}
        title="Eliminar encuesta"
        description={`Se eliminará "${removing?.title}" y todos sus votos.`}
        confirmLabel="Eliminar"
        danger
        loading={removeState.loading}
        onConfirm={handleRemove}
        onCancel={() => setRemoving(null)}
      />
    </>
  );
}
