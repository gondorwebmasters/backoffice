"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useState } from "react";

import { BadgeDot } from "@/components/ui/badge-dot";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Field, Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { formatCents, formatDate } from "@/lib/format";
import { LIST_PLANS } from "@/lib/graphql/plans";
import {
  CANCEL_SUBSCRIPTION,
  CREATE_SUBSCRIPTION,
  EXTEND_SUBSCRIPTION_PERIOD,
  FORCE_RENEWAL,
  LIST_USER_SUBSCRIPTIONS,
  PAUSE_SUBSCRIPTION,
  RESUME_SUBSCRIPTION,
} from "@/lib/graphql/subscriptions";
import type { Plan, Subscription, SubscriptionStatus } from "@/lib/graphql/types";

const STATUS_LABELS: Record<SubscriptionStatus, { label: string; tone: "positive" | "neutral" | "warning" | "negative" | "muted" }> = {
  active: { label: "Activa", tone: "positive" },
  trialing: { label: "En prueba", tone: "neutral" },
  past_due: { label: "Pago vencido", tone: "warning" },
  paused: { label: "Pausada", tone: "muted" },
  canceled: { label: "Cancelada", tone: "muted" },
  unpaid: { label: "Impagada", tone: "negative" },
  incomplete: { label: "Incompleta", tone: "warning" },
  incomplete_expired: { label: "Expirada", tone: "muted" },
};

function SubscriptionCard({ subscription, onChanged }: { subscription: Subscription; onChanged: () => void }) {
  const toast = useToast();
  const [extendDays, setExtendDays] = useState("");
  const [extendReason, setExtendReason] = useState("");
  const [showExtend, setShowExtend] = useState(false);

  const options = { onCompleted: onChanged };
  const [pause, pauseState] = useMutation(PAUSE_SUBSCRIPTION, options);
  const [resume, resumeState] = useMutation(RESUME_SUBSCRIPTION, options);
  const [cancel, cancelState] = useMutation(CANCEL_SUBSCRIPTION, options);
  const [forceRenewal, renewState] = useMutation(FORCE_RENEWAL, options);
  const [extend, extendState] = useMutation(EXTEND_SUBSCRIPTION_PERIOD, options);

  const busy =
    pauseState.loading || resumeState.loading || cancelState.loading || renewState.loading || extendState.loading;

  const status = STATUS_LABELS[subscription.status] ?? { label: subscription.status, tone: "neutral" as const };
  const finished = subscription.status === "canceled" || subscription.status === "incomplete_expired";

  const handleExtend = async () => {
    const days = Number(extendDays);
    if (!days || !extendReason) return;
    const { data } = await extend({
      variables: { subscriptionId: subscription.id, days, reason: extendReason },
    });
    if (data?.extendSubscriptionPeriod?.success) {
      toast(`Periodo extendido ${days} días`);
      setShowExtend(false);
      setExtendDays("");
      setExtendReason("");
    } else {
      toast(data?.extendSubscriptionPeriod?.message ?? "No se pudo extender", "error");
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-900">{subscription.plan.name}</p>
          <p className="mt-0.5 text-xs text-zinc-400">
            {formatCents(subscription.plan.amount, subscription.plan.currency)} / {subscription.plan.interval}
          </p>
        </div>
        <BadgeDot tone={status.tone} label={status.label} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div>
          <dt className="text-zinc-400">Fin de periodo</dt>
          <dd className="text-zinc-700">{formatDate(subscription.currentPeriodEnd)}</dd>
        </div>
        <div>
          <dt className="text-zinc-400">Próximo cobro</dt>
          <dd className="text-zinc-700">{formatDate(subscription.nextBillingDate)}</dd>
        </div>
        {subscription.failedPaymentAttempts > 0 ? (
          <div className="col-span-2">
            <dt className="text-zinc-400">Intentos de cobro fallidos</dt>
            <dd className="text-red-600">{subscription.failedPaymentAttempts}</dd>
          </div>
        ) : null}
        {subscription.cancelAtPeriodEnd ? (
          <p className="col-span-2 text-amber-600">Se cancelará al final del periodo</p>
        ) : null}
      </dl>

      {!finished ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-100 pt-4">
          {subscription.status === "paused" ? (
            <Button size="sm" disabled={busy} onClick={() => resume({ variables: { subscriptionId: subscription.id } })}>
              Reanudar
            </Button>
          ) : (
            <Button size="sm" disabled={busy} onClick={() => pause({ variables: { subscriptionId: subscription.id } })}>
              Pausar
            </Button>
          )}
          <Button size="sm" disabled={busy} onClick={() => forceRenewal({ variables: { subscriptionId: subscription.id } })}>
            Renovar ya
          </Button>
          <Button size="sm" disabled={busy} onClick={() => setShowExtend((value) => !value)}>
            Extender
          </Button>
          <Button
            size="sm"
            variant="danger"
            disabled={busy}
            onClick={() =>
              cancel({
                variables: { input: { subscriptionId: subscription.id, cancelAtPeriodEnd: true } },
              })
            }
          >
            Cancelar
          </Button>
        </div>
      ) : null}

      {showExtend ? (
        <div className="mt-4 space-y-3 rounded-lg bg-zinc-50 p-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Días">
              <Input type="number" min={1} value={extendDays} onChange={(event) => setExtendDays(event.target.value)} />
            </Field>
            <Field label="Motivo" hint="Queda en el audit log">
              <Input value={extendReason} onChange={(event) => setExtendReason(event.target.value)} />
            </Field>
          </div>
          <Button size="sm" variant="primary" onClick={handleExtend} disabled={extendState.loading || !extendDays || !extendReason}>
            Confirmar extensión
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function SubscriptionTab({ userId }: { userId: string }) {
  const toast = useToast();
  const [planId, setPlanId] = useState("");

  const { data, loading, refetch } = useQuery<{
    listUserSubscriptions: { subscriptions: Subscription[] | null };
  }>(LIST_USER_SUBSCRIPTIONS, { variables: { userId } });

  const plans = useQuery<{ listPlans: { plans: Plan[] | null } }>(LIST_PLANS, {
    variables: { onlyActive: true },
  });

  const [createSubscription, createState] = useMutation(CREATE_SUBSCRIPTION);

  const subscriptions = data?.listUserSubscriptions?.subscriptions ?? [];
  const hasOngoing = subscriptions.some((subscription) =>
    ["active", "trialing", "past_due", "paused"].includes(subscription.status),
  );

  const handleCreate = async () => {
    const { data: result } = await createSubscription({ variables: { subscription: { planId, userId } } });
    if (result?.createSubscription?.success) {
      toast("Suscripción creada");
      setPlanId("");
      refetch();
    } else {
      toast(result?.createSubscription?.message ?? "No se pudo crear la suscripción", "error");
    }
  };

  if (loading && !data) {
    return <div className="h-32 animate-pulse rounded-lg bg-zinc-50" />;
  }

  return (
    <div className="space-y-4">
      {subscriptions.length === 0 ? (
        <p className="py-4 text-center text-sm text-zinc-400">Sin suscripciones</p>
      ) : (
        subscriptions.map((subscription) => (
          <SubscriptionCard key={subscription.id} subscription={subscription} onChanged={() => refetch()} />
        ))
      )}

      {!hasOngoing ? (
        <div className="flex items-end gap-3 border-t border-zinc-100 pt-5">
          <div className="flex-1">
            <Field label="Asignar plan">
              <Dropdown
                options={(plans.data?.listPlans?.plans ?? []).map((plan) => ({
                  value: plan.id,
                  label: `${plan.name} · ${formatCents(plan.amount, plan.currency)}`,
                }))}
                placeholder="Selecciona un plan…"
                searchable
                value={planId}
                onChange={setPlanId}
              />
            </Field>
          </div>
          <Button variant="primary" onClick={handleCreate} disabled={!planId || createState.loading}>
            {createState.loading ? "…" : "Suscribir"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
