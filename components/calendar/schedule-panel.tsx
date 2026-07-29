"use client";

import { useMutation } from "@apollo/client";
import { UserX } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Avatar } from "@/components/ui/avatar";
import { BadgeDot } from "@/components/ui/badge-dot";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SlideOver } from "@/components/ui/slide-over";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { formatDateTime, formatTime, fullName } from "@/lib/format";
import {
  CHANGE_SCHEDULE_STATUS,
  REMOVE_SCHEDULE,
  REMOVE_USER_FROM_SCHEDULE,
} from "@/lib/graphql/schedules";
import type { Schedule } from "@/lib/graphql/types";

interface SchedulePanelProps {
  schedule: Schedule | null;
  onClose: () => void;
  onChanged: () => void;
}

export function SchedulePanel({ schedule, onClose, onChanged }: SchedulePanelProps) {
  const t = useTranslations("calendar.schedulePanel");
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [changeStatus, statusState] = useMutation(CHANGE_SCHEDULE_STATUS, { onCompleted: onChanged });
  const [removeUser] = useMutation(REMOVE_USER_FROM_SCHEDULE, { onCompleted: onChanged });
  const [removeSchedule, removeState] = useMutation(REMOVE_SCHEDULE);

  const cancelled = schedule?.state === "cancelled";

  const handleDelete = async () => {
    if (!schedule) return;
    const { data } = await removeSchedule({ variables: { scheduleId: schedule.id } });
    if (data?.removeSchedule?.success) {
      toast(t("deleted"));
      onChanged();
      onClose();
    } else {
      toast(data?.removeSchedule?.message ?? t("deleteFailed"), "error");
      setConfirmDelete(false);
    }
  };

  return (
    <SlideOver
      open={Boolean(schedule)}
      onClose={onClose}
      title={schedule?.title ?? ""}
      subtitle={schedule ? `${formatDateTime(schedule.startDate)} – ${formatTime(schedule.endDate)}` : undefined}
      footer={
        schedule ? (
          <>
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              {t("delete")}
            </Button>
            <Button
              variant={cancelled ? "primary" : "secondary"}
              disabled={statusState.loading}
              onClick={() => changeStatus({ variables: { scheduleId: schedule.id } })}
            >
              {statusState.loading ? "…" : cancelled ? t("reactivate") : t("cancelClass")}
            </Button>
          </>
        ) : undefined
      }
    >
      {schedule ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-card">
            <div className="flex items-center justify-between">
              <BadgeDot
                tone={cancelled ? "negative" : "positive"}
                label={cancelled ? t("cancelled") : t("available")}
              />
              <p className="text-sm font-medium tabular-nums text-zinc-700">
                {schedule.users?.length ?? 0}/{schedule.maxUsers} <span className="font-normal text-zinc-400">{t("spots")}</span>
              </p>
            </div>
            {!cancelled ? (
              <span className="mt-3 block h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                <span
                  className="block h-full rounded-full bg-primary transition-[width] duration-300"
                  style={{
                    width: `${Math.min(((schedule.users?.length ?? 0) / (schedule.maxUsers || 1)) * 100, 100)}%`,
                  }}
                />
              </span>
            ) : null}
          </div>

          {schedule.description ? (
            <p className="text-sm leading-relaxed text-zinc-600">{schedule.description}</p>
          ) : null}

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-zinc-200/80 bg-white p-3 shadow-sm">
              <dt className="text-xs uppercase tracking-wider text-zinc-400">{t("type")}</dt>
              <dd className="mt-0.5 font-medium text-zinc-700">{schedule.type}</dd>
            </div>
            <div className="rounded-xl border border-zinc-200/80 bg-white p-3 shadow-sm">
              <dt className="text-xs uppercase tracking-wider text-zinc-400">{t("trainer")}</dt>
              <dd className="mt-0.5 font-medium text-zinc-700">{fullName(schedule.admin)}</dd>
            </div>
          </dl>

          <section>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
              {t("attendees", { count: schedule.users?.length ?? 0 })}
            </h3>
            {(schedule.users ?? []).length === 0 ? (
              <p className="py-3 text-sm text-zinc-400">{t("noAttendees")}</p>
            ) : (
              <ul className="overflow-hidden rounded-xl border border-zinc-200/80">
                {(schedule.users ?? []).map((user, index) => (
                  <li
                    key={user.id}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-zinc-50",
                      index > 0 && "border-t border-zinc-100",
                    )}
                  >
                    <Avatar size="sm" name={fullName(user)} url={user.pictureUrl?.url} />
                    <span className="flex-1 text-sm font-medium text-zinc-700">{fullName(user)}</span>
                    <button
                      onClick={() => removeUser({ variables: { scheduleId: schedule.id, userId: user.id } })}
                      className="rounded-lg p-1.5 text-zinc-300 transition-colors hover:bg-red-50 hover:text-red-500 active:scale-90"
                      title={t("removeFromClass")}
                    >
                      <UserX size={15} strokeWidth={1.5} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {(schedule.waitListUsers ?? []).length > 0 ? (
              <p className="mt-3 text-xs text-zinc-400">
                {t("waitList")}: {(schedule.waitListUsers ?? []).map((user) => fullName(user)).join(", ")}
              </p>
            ) : null}
          </section>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmDelete}
        title={t("deleteClass")}
        description={t("deleteClassDescription")}
        confirmLabel={t("delete")}
        danger
        loading={removeState.loading}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </SlideOver>
  );
}
