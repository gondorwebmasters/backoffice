"use client";

import { LogOut, Settings, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar } from "@/components/ui/avatar";
import { Menu, MenuItem, MenuSeparator } from "@/components/ui/menu";
import { fullName } from "@/lib/format";

import { useSession } from "./session-provider";

export function ProfileMenu() {
  const { user } = useSession();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <Menu
      trigger={() => (
        <button className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-zinc-100">
          <Avatar size="sm" name={fullName(user)} url={user.pictureUrl?.url} />
          <span className="hidden max-w-36 truncate text-sm text-zinc-600 lg:block">
            {fullName(user)}
          </span>
        </button>
      )}
    >
      <div className="border-b border-zinc-100 px-3.5 py-2.5">
        <p className="truncate text-sm font-medium text-zinc-900">{fullName(user)}</p>
        <p className="truncate text-xs text-zinc-400">{user.email}</p>
      </div>
      <MenuItem icon={<UserRound size={14} strokeWidth={1.5} />} onClick={() => router.push("/profile")}>
        Mi perfil
      </MenuItem>
      <MenuItem
        icon={<Settings size={14} strokeWidth={1.5} />}
        onClick={() => router.push("/settings")}
      >
        Ajustes
      </MenuItem>
      <MenuSeparator />
      <MenuItem icon={<LogOut size={14} strokeWidth={1.5} />} tone="danger" onClick={handleLogout}>
        Cerrar sesión
      </MenuItem>
    </Menu>
  );
}
