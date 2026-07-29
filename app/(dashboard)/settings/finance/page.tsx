"use client";

import { useMutation, useQuery } from "@apollo/client";
import { AlertTriangle, CheckCircle2, Unplug } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useSession } from "@/components/layout/session-provider";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import {
  DISCONNECT_PAYMENT_ACCOUNT,
  GET_PAYMENT_CONNECTION_STATUS,
  GET_PAYMENT_ONBOARDING_URL,
  type PaymentConnectionStatus,
} from "@/lib/graphql/payments";

type StatusData = {
  getPaymentConnectionStatus: {
    success: boolean;
    message: string;
    status: PaymentConnectionStatus | null;
  } | null;
};

export default function FinanceSettingsPage() {
  const t = useTranslations("settings.finance");
  const toast = useToast();
  const { user } = useSession();
  const companyId = user?.activeCompanyId;
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false);

  const { data, loading, refetch } = useQuery<StatusData>(GET_PAYMENT_CONNECTION_STATUS, {
    variables: { companyId },
    skip: !companyId,
  });

  const [getOnboardingUrl, { loading: connecting }] = useMutation(GET_PAYMENT_ONBOARDING_URL);
  const [disconnect, { loading: disconnecting }] = useMutation(DISCONNECT_PAYMENT_ACCOUNT);

  const status = data?.getPaymentConnectionStatus?.status ?? null;
  const connected = status?.isConnected ?? false;

  const handleConnect = async () => {
    if (!companyId) return;
    try {
      const { data: result } = await getOnboardingUrl({
        variables: { companyId, platform: "web" },
      });
      const url = result?.getPaymentOnboardingUrl?.url;
      if (result?.getPaymentOnboardingUrl?.success && url) {
        window.location.href = url;
      } else {
        toast(result?.getPaymentOnboardingUrl?.message ?? t("connectFailed"), "error");
      }
    } catch {
      toast(t("connectFailed"), "error");
    }
  };

  const handleDisconnect = async () => {
    if (!companyId) return;
    try {
      const { data: result } = await disconnect({ variables: { companyId } });
      if (result?.disconnectPaymentAccount?.success) {
        toast(t("disconnected"));
        refetch();
      } else {
        toast(result?.disconnectPaymentAccount?.message ?? t("disconnectFailed"), "error");
      }
    } catch {
      toast(t("disconnectFailed"), "error");
    } finally {
      setConfirmingDisconnect(false);
    }
  };

  if (loading && !data) {
    return <div className="h-64 animate-pulse rounded-2xl bg-zinc-100" />;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <section className="rounded-2xl border border-zinc-200/80 bg-white shadow-card">
        <header className="border-b border-zinc-100 px-7 py-5">
          <h2 className="text-sm font-semibold text-zinc-900">{t("title")}</h2>
          <p className="text-xs text-zinc-400">{t("subtitle")}</p>
        </header>

        <div className="space-y-5 p-7">
          {connected ? (
            <>
              <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                <CheckCircle2 size={16} strokeWidth={2} className="shrink-0 text-emerald-500" />
                <p className="text-sm font-medium text-emerald-500">{t("accountConnected")}</p>
              </div>

              <dl className="space-y-3 text-sm">
                {status?.accountId ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-zinc-400">{t("account")}</dt>
                    <dd className="mt-0.5 font-mono text-xs text-zinc-700">{status.accountId}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs uppercase tracking-wider text-zinc-400">{t("capabilities")}</dt>
                  <dd className="mt-1.5 flex flex-wrap gap-2">
                    <Chip tone={status?.chargesEnabled ? "success" : "warning"}>
                      {status?.chargesEnabled ? t("chargesActive") : t("chargesPending")}
                    </Chip>
                    <Chip tone={status?.payoutsEnabled ? "success" : "warning"}>
                      {status?.payoutsEnabled ? t("payoutsActive") : t("payoutsPending")}
                    </Chip>
                  </dd>
                </div>
              </dl>

              {status?.missingRequirements?.length ? (
                <div className="flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <AlertTriangle size={15} strokeWidth={1.75} className="mt-0.5 shrink-0 text-amber-600" />
                  <div className="text-sm text-amber-700">
                    <p className="font-medium">{t("missingRequirements")}</p>
                    <ul className="mt-1 list-inside list-disc text-xs">
                      {status.missingRequirements.filter(Boolean).map((requirement) => (
                        <li key={requirement}>{requirement}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}

              {status?.disabledReason ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {status.disabledReason}
                </p>
              ) : null}

              <div className="flex flex-wrap justify-end gap-3 pt-1">
                {!status?.chargesEnabled ? (
                  <Button variant="primary" onClick={handleConnect} disabled={connecting}>
                    {connecting ? t("redirecting") : t("completeSetup")}
                  </Button>
                ) : null}
                <Button variant="danger" onClick={() => setConfirmingDisconnect(true)}>
                  <Unplug size={14} strokeWidth={1.75} />
                  {t("disconnect")}
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-zinc-500">{t("connectDescription")}</p>
              <div className="flex justify-end">
                <Button variant="primary" onClick={handleConnect} disabled={connecting || !companyId}>
                  {connecting ? t("redirecting") : t("connect")}
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      <ConfirmDialog
        open={confirmingDisconnect}
        title={t("disconnectTitle")}
        description={t("disconnectDescription")}
        confirmLabel={t("disconnect")}
        danger
        loading={disconnecting}
        onConfirm={handleDisconnect}
        onCancel={() => setConfirmingDisconnect(false)}
      />
    </div>
  );
}
