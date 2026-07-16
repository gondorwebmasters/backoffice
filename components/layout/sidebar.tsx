"use client";

import { ChevronsLeft, ChevronsRight, Dumbbell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

import { useShell } from "./app-shell";
import { MAIN_NAV, SYSTEM_NAV, type NavItem } from "./nav";
import { useSession } from "./session-provider";

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const { href, label, icon: Icon } = item;
  const active =
    href === "/" || href === "/system" ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200",
        collapsed && "justify-center px-0",
        active
          ? "bg-gradient-to-r from-primary to-primary/85 font-semibold text-primary-foreground shadow-md shadow-primary/25"
          : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900",
      )}
    >
      <Icon size={16} strokeWidth={1.5} className="shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

export function Sidebar() {
  const { user } = useSession();
  const { collapsed, toggleCollapsed } = useShell();

  return (
    <aside
      className={cn(
        "fixed inset-y-4 left-4 z-20 flex flex-col rounded-2xl border border-zinc-200/80 bg-white shadow-card transition-[width] duration-200",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2.5 py-6",
          collapsed ? "justify-center px-0" : "px-6",
        )}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/75 shadow-md shadow-primary/25">
          <Dumbbell size={16} strokeWidth={2} className="text-primary-foreground" />
        </span>
        {!collapsed && (
          <>
            <span className="truncate text-sm font-semibold tracking-tight text-zinc-900">
              FitConnect
            </span>
            <span className="rounded border border-zinc-200 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
              Admin
            </span>
          </>
        )}
      </div>

      <nav className={cn("flex-1 space-y-0.5 overflow-y-auto pb-4", collapsed ? "px-2.5" : "px-3")}>
        {MAIN_NAV.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} />
        ))}
        {user?.isSuperAdmin ? (
          <>
            {collapsed ? (
              <div className="mx-2 my-3 border-t border-zinc-100" />
            ) : (
              <p className="px-3 pb-1 pt-6 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                Sistema
              </p>
            )}
            {SYSTEM_NAV.map((item) => (
              <NavLink key={item.href} item={item} collapsed={collapsed} />
            ))}
          </>
        ) : null}
      </nav>

      <div className={cn("border-t border-zinc-100 py-3", collapsed ? "px-2.5" : "px-3")}>
        <button
          onClick={toggleCollapsed}
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-900",
            collapsed && "justify-center px-0",
          )}
        >
          {collapsed ? (
            <ChevronsRight size={16} strokeWidth={1.5} />
          ) : (
            <>
              <ChevronsLeft size={16} strokeWidth={1.5} />
              <span>Colapsar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
