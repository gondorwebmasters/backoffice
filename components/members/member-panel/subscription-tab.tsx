"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { BadgeDot } from "@/components/ui/badge-dot";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Field, Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { formatCents, formatDate, planPriceCents } from "@/lib/format";
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

const STATUS_TONES: Record<SubscriptionStatus, "positive" | "neutral" | "warning" | "negative" | "muted"> = {
  active: "positive",
  trialing: "neutral",
  past_due: "warning",
  paused: "muted",
  canceled: "muted",
  unpaid: "negative",
  incomplete: "warning",
  incomplete_expired: "muted",
};

function useStatusLabels() {
  const t = useTranslations("members.subscriptionTab.statusLabels");
  return (status: SubscriptionStatus) => ({
    label: t(status),
    tone: STATUS_TONES[status] ?? "neutral",
  });
}

function SubscriptionCard({ subscription, onChanged }: { subscription: Subscription; onChanged: () => void }) {
  const t = useTranslations("members.subscriptionTab");
  const statusLabel = useStatusLabels();
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

  const status = statusLabel(subscription.status);
  const finished = subscription.status === "canceled" || subscription.status === "incomplete_expired";

  const handleExtend = async () => {
    const days = Number(extendDays);
    if (!days || !extendReason) return;
    const { data } = await extend({
      variables: { subscriptionId: subscription.id, days, reason: extendReason },
    });
    if (data?.extendSubscriptionPeriod?.success) {
      toast(t("periodExtended", { days }));
      setShowExtend(false);
      setExtendDays("");
      setExtendReason("");
    } else {
      toast(data?.extendSubscriptionPeriod?.message ?? t("extendFailed"), "error");
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-900">{subscription.plan.name}</p>
          <p className="mt-0.5 text-xs text-zinc-400">
            {formatCents(planPriceCents(subscription.plan), subscription.plan.currency)} / {subscription.plan.interval}
          </p>
        </div>
        <BadgeDot tone={status.tone} label={status.label} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div>
          <dt className="text-zinc-400">{t("periodEnd")}</dt>
          <dd className="text-zinc-700">{formatDate(subscription.currentPeriodEnd)}</dd>
        </div>
        <div>
          <dt className="text-zinc-400">{t("nextBilling")}</dt>
          <dd className="text-zinc-700">{formatDate(subscription.nextBillingDate)}</dd>
        </div>
        {subscription.failedPaymentAttempts > 0 ? (
          <div className="col-span-2">
            <dt className="text-zinc-400">{t("failedAttempts")}</dt>
            <dd className="text-red-600">{subscription.failedPaymentAttempts}</dd>
          </div>
        ) : null}
        {subscription.cancelAtPeriodEnd ? (
          <p className="col-span-2 text-amber-600">{t("willCancelAtPeriodEnd")}</p>
        ) : null}
      </dl>

      {!finished ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-100 pt-4">
          {subscription.status === "paused" ? (
            <Button size="sm" disabled={busy} onClick={() => resume({ variables: { subscriptionId: subscription.id } })}>
              {t("resume")}
            </Button>
          ) : (
            <Button size="sm" disabled={busy} onClick={() => pause({ variables: { subscriptionId: subscription.id } })}>
              {t("pause")}
            </Button>
          )}
          <Button size="sm" disabled={busy} onClick={() => forceRenewal({ variables: { subscriptionId: subscription.id } })}>
            {t("renewNow")}
          </Button>
          <Button size="sm" disabled={busy} onClick={() => setShowExtend((value) => !value)}>
            {t("extend")}
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
            {t("cancel")}
          </Button>
        </div>
      ) : null}

      {showExtend ? (
        <div className="mt-4 space-y-3 rounded-lg bg-zinc-50 p-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("days")}>
              <Input type="number" min={1} value={extendDays} onChange={(event) => setExtendDays(event.target.value)} />
            </Field>
            <Field label={t("reason")} hint={t("reasonHint")}>
              <Input value={extendReason} onChange={(event) => setExtendReason(event.target.value)} />
            </Field>
          </div>
          <Button size="sm" variant="primary" onClick={handleExtend} disabled={extendState.loading || !extendDays || !extendReason}>
            {t("confirmExtend")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function SubscriptionTab({ userId }: { userId: string }) {
  const t = useTranslations("members.subscriptionTab");
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
      toast(t("subscriptionCreated"));
      setPlanId("");
      refetch();
    } else {
      toast(result?.createSubscription?.message ?? t("subscriptionCreateFailed"), "error");
    }
  };

  if (loading && !data) {
    return <div className="h-32 animate-pulse rounded-lg bg-zinc-50" />;
  }

  return (
    <div className="space-y-4">
      {subscriptions.length === 0 ? (
        <p className="py-4 text-center text-sm text-zinc-400">{t("noSubscriptions")}</p>
      ) : (
        subscriptions.map((subscription) => (
          <SubscriptionCard key={subscription.id} subscription={subscription} onChanged={() => refetch()} />
        ))
      )}

      {!hasOngoing ? (
        <div className="flex items-end gap-3 border-t border-zinc-100 pt-5">
          <div className="flex-1">
            <Field label={t("assignPlan")}>
              <Dropdown
                options={(plans.data?.listPlans?.plans ?? []).map((plan) => ({
                  value: plan.id,
                  label: `${plan.name} · ${formatCents(planPriceCents(plan), plan.currency)}`,
                }))}
                placeholder={t("selectPlan")}
                searchable
                value={planId}
                onChange={setPlanId}
              />
            </Field>
          </div>
          <Button variant="primary" onClick={handleCreate} disabled={!planId || createState.loading}>
            {createState.loading ? "…" : t("subscribe")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
