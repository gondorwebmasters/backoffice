"use client";

import { useMutation } from "@apollo/client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useSession } from "@/components/layout/session-provider";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { fullName } from "@/lib/format";
import { DELETE_USER } from "@/lib/graphql/users";

export default function DangerSettingsPage() {
  const t = useTranslations("settings.danger");
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
        toast(data?.deleteUser?.message ?? t("deleteFailed"), "error");
        setConfirming(false);
      }
    } catch {
      toast(t("deleteFailed"), "error");
      setConfirming(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <section className="rounded-2xl border border-red-200 bg-white shadow-card">
        <header className="border-b border-red-200/60 px-7 py-5">
          <h2 className="text-sm font-semibold text-red-600">{t("title")}</h2>
          <p className="text-xs text-zinc-400">{t("subtitle")}</p>
        </header>

        <div className="flex flex-col gap-4 p-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-sm leading-relaxed text-zinc-500">{t("description")}</p>
          <Button variant="danger" onClick={() => setConfirming(true)} disabled={!user}>
            {t("deleteAccount")}
          </Button>
        </div>
      </section>

      <ConfirmDialog
        open={confirming}
        title={t("confirmTitle")}
        description={t("confirmDescription", { name: user ? fullName(user) : "" })}
        confirmLabel={t("confirmDelete")}
        danger
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
