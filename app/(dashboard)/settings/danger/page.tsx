"use client";

import { useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useSession } from "@/components/layout/session-provider";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { fullName } from "@/lib/format";
import { DELETE_USER } from "@/lib/graphql/users";

export default function DangerSettingsPage() {
  const toast = useToast();
  const router = useRouter();
  const { user } = useSession();
  const [confirming, setConfirming] = useState(false);

  const [deleteUser, { loading }] = useMutation(DELETE_USER);

  const handleDelete = async () => {
    if (!user) return;
    try {
      const { data } = await deleteUser({ variables: { id: user.id } });
      if (data?.deleteUser?.success) {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      } else {
        toast(data?.deleteUser?.message ?? "No se pudo eliminar la cuenta", "error");
        setConfirming(false);
      }
    } catch {
      toast("No se pudo eliminar la cuenta", "error");
      setConfirming(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <section className="rounded-2xl border border-red-200 bg-white shadow-card">
        <header className="border-b border-red-200/60 px-7 py-5">
          <h2 className="text-sm font-semibold text-red-600">Eliminar mi cuenta</h2>
          <p className="text-xs text-zinc-400">Acción permanente e irreversible</p>
        </header>

        <div className="flex flex-col gap-4 p-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-sm leading-relaxed text-zinc-500">
            Se eliminará definitivamente tu cuenta de administrador y todos tus datos personales. Perderás el
            acceso a este panel. Esta acción no se puede deshacer.
          </p>
          <Button variant="danger" onClick={() => setConfirming(true)} disabled={!user}>
            Eliminar cuenta
          </Button>
        </div>
      </section>

      <ConfirmDialog
        open={confirming}
        title="¿Eliminar tu cuenta definitivamente?"
        description={`Se eliminará la cuenta de ${user ? fullName(user) : ""} y todos sus datos. No podrás volver a acceder al panel. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar definitivamente"
        danger
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
