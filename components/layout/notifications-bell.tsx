"use client";

import { useQuery } from "@apollo/client";
import { Bell } from "lucide-react";
import { useState } from "react";

import { Popover } from "@/components/ui/popover";
import { GET_NOTIFICATIONS } from "@/lib/graphql/notifications";

interface Notification {
  id: string;
  created_at: string;
  type: string;
  message: string;
  link: string;
}

type NotificationsData = {
  getNotifications: { success: boolean; notifications: Notification[] | null } | null;
};

function timeAgo(value: string): string {
  const date = new Date(Number.isNaN(Number(value)) ? value : Number(value));
  const diff = Date.now() - date.getTime();
  if (Number.isNaN(diff)) return "";
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const { data, loading } = useQuery<NotificationsData>(GET_NOTIFICATIONS, {
    fetchPolicy: "cache-and-network",
    pollInterval: 120_000,
  });

  const notifications = data?.getNotifications?.notifications ?? [];
  const count = notifications.length;

  return (
    <Popover
      open={open}
      onClose={() => setOpen(false)}
      panelClassName="w-80"
      trigger={
        <button
          onClick={() => setOpen((value) => !value)}
          className="relative rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          aria-label={count ? `Notificaciones (${count})` : "Notificaciones"}
        >
          <Bell size={16} strokeWidth={1.5} />
          {count > 0 ? (
            <span className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-semibold leading-none text-primary-foreground">
              {count > 9 ? "9+" : count}
            </span>
          ) : null}
        </button>
      }
    >
      <div className="border-b border-zinc-100 px-4 py-3">
        <p className="text-sm font-medium text-zinc-900">Notificaciones</p>
      </div>
      <ul className="max-h-80 overflow-y-auto py-1">
        {notifications.slice(0, 12).map((notification) => (
          <li
            key={notification.id}
            className="flex items-start gap-2.5 px-4 py-2.5 transition-colors hover:bg-zinc-50"
          >
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            <div className="min-w-0">
              <p className="text-sm text-zinc-700">{notification.message}</p>
              <p className="mt-0.5 text-[11px] text-zinc-400">{timeAgo(notification.created_at)}</p>
            </div>
          </li>
        ))}
        {notifications.length === 0 ? (
          <li className="px-4 py-10 text-center text-xs text-zinc-400">
            {loading ? "Cargando…" : "No tienes notificaciones"}
          </li>
        ) : null}
      </ul>
    </Popover>
  );
}
