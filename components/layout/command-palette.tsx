"use client";

import { useQuery } from "@apollo/client";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Search, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { fullName } from "@/lib/format";
import { GET_USERS } from "@/lib/graphql/users";
import type { User } from "@/lib/graphql/types";

import { MAIN_NAV, SYSTEM_NAV } from "./nav";
import { useSession } from "./session-provider";

interface PaletteItem {
  id: string;
  group: "Navegación" | "Miembros";
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
}

type UsersData = {
  getUsers: { success: boolean; users: User[] | null } | null;
};

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { user } = useSession();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setDebounced("");
      setHighlighted(0);
      // el input se monta en este mismo render
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(timeout);
  }, [query]);

  const { data: usersData, loading: loadingUsers } = useQuery<UsersData>(GET_USERS, {
    variables: { query: debounced, page: 0 },
    skip: !open || debounced.length < 2,
    fetchPolicy: "cache-and-network",
  });

  const items = useMemo<PaletteItem[]>(() => {
    const q = query.trim().toLowerCase();
    const nav = [...MAIN_NAV, ...(user?.isSuperAdmin ? SYSTEM_NAV : [])]
      .filter((item) => !q || item.label.toLowerCase().includes(q))
      .map<PaletteItem>((item) => ({
        id: `nav-${item.href}`,
        group: "Navegación",
        label: item.label,
        icon: <item.icon size={15} strokeWidth={1.5} />,
        action: () => router.push(item.href),
      }));

    const members = (usersData?.getUsers?.users ?? []).slice(0, 6).map<PaletteItem>((member) => ({
      id: `user-${member.id}`,
      group: "Miembros",
      label: fullName(member),
      description: member.email ?? undefined,
      icon: <UserRound size={15} strokeWidth={1.5} />,
      action: () => router.push(`/members?q=${encodeURIComponent(member.email ?? fullName(member))}`),
    }));

    return [...nav, ...(debounced.length >= 2 ? members : [])];
  }, [query, debounced, usersData, user?.isSuperAdmin, router]);

  useEffect(() => {
    setHighlighted(0);
  }, [items.length, open]);

  const run = (item: PaletteItem) => {
    onClose();
    item.action();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose();
    } else if (event.key === "ArrowDown") {
      setHighlighted((index) => Math.min(index + 1, items.length - 1));
      event.preventDefault();
    } else if (event.key === "ArrowUp") {
      setHighlighted((index) => Math.max(index - 1, 0));
      event.preventDefault();
    } else if (event.key === "Enter") {
      const item = items[highlighted];
      if (item) run(item);
      event.preventDefault();
    }
  };

  let lastGroup: string | null = null;

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-zinc-950/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-pop"
          >
        <div className="flex items-center gap-2.5 border-b border-zinc-100 px-4">
          <Search size={15} strokeWidth={1.5} className="shrink-0 text-zinc-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Buscar pantallas o miembros…"
            className="h-12 w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
          />
        </div>
        <ul className="max-h-80 overflow-y-auto py-1.5">
          {items.map((item, index) => {
            const showGroup = item.group !== lastGroup;
            lastGroup = item.group;
            return (
              <li key={item.id}>
                {showGroup ? (
                  <p className="px-4 pb-1 pt-2.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                    {item.group}
                  </p>
                ) : null}
                <button
                  onClick={() => run(item)}
                  onMouseEnter={() => setHighlighted(index)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors",
                    index === highlighted ? "bg-primary/10 text-primary" : "text-zinc-600",
                  )}
                >
                  <span className={index === highlighted ? "text-primary" : "text-zinc-400"}>
                    {item.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{item.label}</span>
                    {item.description ? (
                      <span
                        className={cn(
                          "block truncate text-xs",
                          index === highlighted ? "text-primary/70" : "text-zinc-400",
                        )}
                      >
                        {item.description}
                      </span>
                    ) : null}
                  </span>
                  {index === highlighted ? (
                    <CornerDownLeft size={13} strokeWidth={1.5} className="shrink-0 opacity-60" />
                  ) : null}
                </button>
              </li>
            );
          })}
          {items.length === 0 ? (
            <li className="px-4 py-10 text-center text-xs text-zinc-400">
              {loadingUsers ? "Buscando…" : "Sin resultados"}
            </li>
          ) : null}
        </ul>
        <div className="flex items-center gap-3 border-t border-zinc-100 px-4 py-2 text-[10px] text-zinc-400">
          <span>↑↓ navegar</span>
          <span>↵ abrir</span>
          <span>esc cerrar</span>
        </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
