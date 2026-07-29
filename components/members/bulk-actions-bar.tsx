"use client";

import { useMutation } from "@apollo/client";
import { AnimatePresence, motion } from "framer-motion";
import { Ban, CheckCircle2, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import type { User } from "@/lib/graphql/types";
import { DELETE_USER, UPDATE_USER } from "@/lib/graphql/users";

interface BulkActionsBarProps {
  users: User[];
  onClear: () => void;
  onDone: () => void;
}

/**
 * No existe un endpoint de bulk en el backend: cada operación se dispara en
 * paralelo como mutaciones individuales ya existentes (Promise.allSettled)
 * sobre los miembros seleccionados.
 */
export function BulkActionsBar({ users, onClear, onDone }: BulkActionsBarProps) {
  const t = useTranslations("members.bulkActions");
  const toast = useToast();
  const [updateUser] = useMutation(UPDATE_USER);
  const [deleteUser] = useMutation(DELETE_USER);
  const [busy, setBusy] = useState<"block" | "unblock" | "delete" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const count = users.length;

  const setBlocked = async (isBlocked: boolean) => {
    setBusy(isBlocked ? "block" : "unblock");
    const results = await Promise.allSettled(
      users.map((user) =>
        updateUser({
          variables: {
            user: { id: user.id, email: user.email, nickname: user.nickname, isBlocked },
          },
        }),
      ),
    );
    const failed = results.filter((result) => result.status === "rejected").length;
    setBusy(null);
    toast(
      failed
        ? t("updatedPartial", { updated: count - failed, count, failed })
        : t("updatedSuccess", { count }),
      failed ? "error" : "success",
    );
    onDone();
  };

  const handleDelete = async () => {
    setBusy("delete");
    const results = await Promise.allSettled(users.map((user) => deleteUser({ variables: { id: user.id } })));
    const failed = results.filter((result) => result.status === "rejected").length;
    setBusy(null);
    setConfirmDelete(false);
    toast(
      failed
        ? t("deletedPartial", { updated: count - failed, count, failed })
        : t("deletedSuccess", { count }),
      failed ? "error" : "success",
    );
    onDone();
  };

  return (
    <>
      <AnimatePresence>
        {count > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4 overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-2.5 shadow-sm">
              <div className="flex items-center gap-2">
                <button
                  onClick={onClear}
                  className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-white hover:text-zinc-700"
                  aria-label={t("clearSelection")}
                >
                  <X size={14} strokeWidth={1.5} />
                </button>
                <span className="text-sm font-medium text-zinc-700">{t("selected", { count })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" disabled={busy !== null} onClick={() => setBlocked(false)}>
                  <CheckCircle2 size={14} strokeWidth={1.5} />
                  {busy === "unblock" ? "…" : t("unblock")}
                </Button>
                <Button size="sm" variant="secondary" disabled={busy !== null} onClick={() => setBlocked(true)}>
                  <Ban size={14} strokeWidth={1.5} />
                  {busy === "block" ? "…" : t("block")}
                </Button>
                <Button size="sm" variant="danger" disabled={busy !== null} onClick={() => setConfirmDelete(true)}>
                  <Trash2 size={14} strokeWidth={1.5} />
                  {t("delete")}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmDelete}
        title={t("deleteConfirmTitle", { count })}
        description={t("deleteConfirmDescription")}
        confirmLabel={t("delete")}
        danger
        loading={busy === "delete"}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
