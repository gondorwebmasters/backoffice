"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import appIcon from "@/assets/icon.png";
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
        "relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors duration-200",
        collapsed && "justify-center px-0",
        active ? "font-semibold text-primary-foreground" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900",
      )}
    >
      {active ? (
        <motion.span
          layoutId="sidebar-active-pill"
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-primary/85 shadow-md shadow-primary/25"
        />
      ) : null}
      <Icon size={16} strokeWidth={1.5} className="relative shrink-0" />
      {!collapsed && <span className="relative truncate">{label}</span>}
    </Link>
  );
}

export function Sidebar() {
  const { user } = useSession();
  const { collapsed, toggleCollapsed } = useShell();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ type: "spring", stiffness: 400, damping: 40 }}
      className="fixed inset-y-4 left-4 z-20 flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-card"
    >
      <div
        className={cn(
          "flex items-center gap-2.5 py-6",
          collapsed ? "justify-center px-0" : "px-6",
        )}
      >
        <motion.span
          whileHover={{ rotate: -8, scale: 1.05 }}
          className="flex h-8 w-8 shrink-0 items-center justify-center"
        >
          <Image src={appIcon} alt="" width={80} height={80} className="rounded-[5px]" priority />
        </motion.span>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2.5 overflow-hidden whitespace-nowrap"
            >
              <span className="truncate text-sm font-semibold tracking-tight text-zinc-900">
                FitConnect
              </span>
              <span className="rounded border border-zinc-200 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
                Admin
              </span>
            </motion.span>
          )}
        </AnimatePresence>
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
    </motion.aside>
  );
}
