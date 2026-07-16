"use client";

import { useMutation } from "@apollo/client";
import { UserX } from "lucide-react";
import { useState } from "react";

import { Avatar } from "@/components/ui/avatar";
import { BadgeDot } from "@/components/ui/badge-dot";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SlideOver } from "@/components/ui/slide-over";
import { useToast } from "@/components/ui/toast";
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
      toast("Clase eliminada");
      onChanged();
      onClose();
    } else {
      toast(data?.removeSchedule?.message ?? "No se pudo eliminar", "error");
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
              Eliminar
            </Button>
            <Button
              variant={cancelled ? "primary" : "secondary"}
              disabled={statusState.loading}
              onClick={() => changeStatus({ variables: { scheduleId: schedule.id } })}
            >
              {statusState.loading ? "…" : cancelled ? "Reactivar clase" : "Cancelar clase"}
            </Button>
          </>
        ) : undefined
      }
    >
      {schedule ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <BadgeDot
              tone={cancelled ? "negative" : "positive"}
              label={cancelled ? "Cancelada" : "Disponible"}
            />
            <p className="text-sm tabular-nums text-zinc-500">
              {schedule.users?.length ?? 0}/{schedule.maxUsers} plazas
            </p>
          </div>

          {schedule.description ? (
            <p className="text-sm leading-relaxed text-zinc-600">{schedule.description}</p>
          ) : null}

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-400">Tipo</dt>
              <dd className="mt-0.5 text-zinc-700">{schedule.type}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-400">Entrenador</dt>
              <dd className="mt-0.5 text-zinc-700">{fullName(schedule.admin)}</dd>
            </div>
          </dl>

          <section>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
              Asistentes ({schedule.users?.length ?? 0})
            </h3>
            {(schedule.users ?? []).length === 0 ? (
              <p className="py-3 text-sm text-zinc-400">Nadie apuntado todavía</p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {(schedule.users ?? []).map((user) => (
                  <li key={user.id} className="flex items-center gap-3 py-2.5">
                    <Avatar size="sm" name={fullName(user)} url={user.pictureUrl?.url} />
                    <span className="flex-1 text-sm text-zinc-700">{fullName(user)}</span>
                    <button
                      onClick={() => removeUser({ variables: { scheduleId: schedule.id, userId: user.id } })}
                      className="rounded-lg p-1.5 text-zinc-300 transition-colors hover:bg-red-50 hover:text-red-500"
                      title="Quitar de la clase"
                    >
                      <UserX size={15} strokeWidth={1.5} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {(schedule.waitListUsers ?? []).length > 0 ? (
              <p className="mt-3 text-xs text-zinc-400">
                Lista de espera: {(schedule.waitListUsers ?? []).map((user) => fullName(user)).join(", ")}
              </p>
            ) : null}
          </section>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmDelete}
        title="Eliminar clase"
        description="Se eliminará la clase y las reservas asociadas. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        danger
        loading={removeState.loading}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </SlideOver>
  );
}
