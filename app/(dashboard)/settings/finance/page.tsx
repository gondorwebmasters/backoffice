"use client";

import { useMutation, useQuery } from "@apollo/client";
import { AlertTriangle, CheckCircle2, Unplug } from "lucide-react";
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
        toast(result?.getPaymentOnboardingUrl?.message ?? "No se pudo iniciar la conexión", "error");
      }
    } catch {
      toast("No se pudo iniciar la conexión", "error");
    }
  };

  const handleDisconnect = async () => {
    if (!companyId) return;
    try {
      const { data: result } = await disconnect({ variables: { companyId } });
      if (result?.disconnectPaymentAccount?.success) {
        toast("Pasarela de pagos desconectada");
        refetch();
      } else {
        toast(result?.disconnectPaymentAccount?.message ?? "No se pudo desconectar", "error");
      }
    } catch {
      toast("No se pudo desconectar", "error");
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
          <h2 className="text-sm font-semibold text-zinc-900">Pasarela de pagos</h2>
          <p className="text-xs text-zinc-400">Cuenta conectada para cobrar suscripciones y productos</p>
        </header>

        <div className="space-y-5 p-7">
          {connected ? (
            <>
              <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                <CheckCircle2 size={16} strokeWidth={2} className="shrink-0 text-emerald-500" />
                <p className="text-sm font-medium text-emerald-500">Cuenta conectada</p>
              </div>

              <dl className="space-y-3 text-sm">
                {status?.accountId ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-zinc-400">Cuenta</dt>
                    <dd className="mt-0.5 font-mono text-xs text-zinc-700">{status.accountId}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs uppercase tracking-wider text-zinc-400">Capacidades</dt>
                  <dd className="mt-1.5 flex flex-wrap gap-2">
                    <Chip tone={status?.chargesEnabled ? "success" : "warning"}>
                      {status?.chargesEnabled ? "Cobros activos" : "Cobros pendientes"}
                    </Chip>
                    <Chip tone={status?.payoutsEnabled ? "success" : "warning"}>
                      {status?.payoutsEnabled ? "Transferencias activas" : "Transferencias pendientes"}
                    </Chip>
                  </dd>
                </div>
              </dl>

              {status?.missingRequirements?.length ? (
                <div className="flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <AlertTriangle size={15} strokeWidth={1.75} className="mt-0.5 shrink-0 text-amber-600" />
                  <div className="text-sm text-amber-700">
                    <p className="font-medium">Faltan requisitos por completar:</p>
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
                    {connecting ? "Redirigiendo…" : "Completar configuración"}
                  </Button>
                ) : null}
                <Button variant="danger" onClick={() => setConfirmingDisconnect(true)}>
                  <Unplug size={14} strokeWidth={1.75} />
                  Desconectar
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-zinc-500">
                Conecta una cuenta de pagos para poder cobrar suscripciones, facturas y productos a tus
                miembros. Te redirigiremos al proceso de alta seguro de la pasarela.
              </p>
              <div className="flex justify-end">
                <Button variant="primary" onClick={handleConnect} disabled={connecting || !companyId}>
                  {connecting ? "Redirigiendo…" : "Conectar pasarela de pagos"}
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      <ConfirmDialog
        open={confirmingDisconnect}
        title="Desconectar pasarela de pagos"
        description="Dejarás de poder cobrar suscripciones y productos hasta que vuelvas a conectar una cuenta. Los cobros ya procesados no se ven afectados."
        confirmLabel="Desconectar"
        danger
        loading={disconnecting}
        onConfirm={handleDisconnect}
        onCancel={() => setConfirmingDisconnect(false)}
      />
    </div>
  );
}
