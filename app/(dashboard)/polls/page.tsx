"use client";

import { useMutation, useQuery } from "@apollo/client";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Field, Input, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/sticky-header";
import { SlideOver } from "@/components/ui/slide-over";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/format";
import { CREATE_POLL, GET_ADMIN_POLLS, REMOVE_POLLS } from "@/lib/graphql/polls";
import type { Poll } from "@/lib/graphql/types";

function PollCard({ poll, onRemove }: { poll: Poll; onRemove: () => void }) {
  const t = useTranslations("polls");
  const votes = poll.pollVotes ?? [];
  const total = votes.length;
  const ended = new Date(Number(poll.endDate) || poll.endDate) < new Date();

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-card">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-zinc-900">{poll.title}</h3>
          <p className="mt-0.5 text-xs text-zinc-400">
            {ended ? t("ended") : t("open")} · {t("until", { date: formatDate(poll.endDate) })} ·{" "}
            {t("voteCount", { count: total })}
          </p>
        </div>
        <button
          onClick={onRemove}
          className="rounded-lg p-1.5 text-zinc-300 transition-colors hover:bg-red-50 hover:text-red-500"
          title={t("deletePoll")}
        >
          <Trash2 size={15} strokeWidth={1.5} />
        </button>
      </div>
      <ul className="space-y-3">
        {poll.options.map((option) => {
          const count = votes.filter((vote) => vote.optionSelected === option).length;
          const percentage = total === 0 ? 0 : Math.round((count / total) * 100);
          return (
            <li key={option} title={t("optionTitle", { option, count, percentage })}>
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
  const t = useTranslations("polls");
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
      toast(t("created"));
      setForm({ title: "", options: "", endDate: "" });
      setCreating(false);
      refetch();
    } else {
      toast(result?.createPoll?.message ?? t("createFailed"), "error");
    }
  };

  const handleRemove = async () => {
    if (!removing) return;
    const { data: result } = await removePolls({ variables: { ids: [removing.id] } });
    if (result?.removePolls?.success) {
      toast(t("removed"));
      refetch();
    } else {
      toast(result?.removePolls?.message ?? t("removeFailed"), "error");
    }
    setRemoving(null);
  };

  return (
    <>
      <PageShell
        header={
          <PageHeader
            title={t("title")}
            subtitle={t("subtitle")}
            actions={
              <Button variant="primary" onClick={() => setCreating(true)}>
                <Plus size={15} strokeWidth={1.5} />
                {t("newPoll")}
              </Button>
            }
          />
        }
      >
        {loading && polls.length === 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="h-40 animate-pulse rounded-xl bg-zinc-100" />
            <div className="h-40 animate-pulse rounded-xl bg-zinc-100" />
          </div>
        ) : polls.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-200 py-16 text-center text-sm text-zinc-400">
            {t("emptyState")}
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {polls.map((poll) => (
              <PollCard key={poll.id} poll={poll} onRemove={() => setRemoving(poll)} />
            ))}
          </div>
        )}
      </PageShell>

      <SlideOver
        open={creating}
        onClose={() => setCreating(false)}
        title={t("newPoll")}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              {t("cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={createState.loading || !form.title || options.length < 2 || !form.endDate}
            >
              {createState.loading ? t("creating") : t("publish")}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Field label={t("question")}>
            <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </Field>
          <Field label={t("options")} hint={t("optionsHint")}>
            <Textarea
              rows={4}
              value={form.options}
              onChange={(event) => setForm({ ...form, options: event.target.value })}
            />
          </Field>
          <Field label={t("closingDate")}>
            <DatePicker
              value={form.endDate}
              onChange={(value) => setForm({ ...form, endDate: value })}
            />
          </Field>
        </div>
      </SlideOver>

      <ConfirmDialog
        open={Boolean(removing)}
        title={t("deletePoll")}
        description={t("deleteConfirmDescription", { title: removing?.title ?? "" })}
        confirmLabel={t("delete")}
        danger
        loading={removeState.loading}
        onConfirm={handleRemove}
        onCancel={() => setRemoving(null)}
      />
    </>
  );
}
