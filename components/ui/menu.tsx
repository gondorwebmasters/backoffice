"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Popover } from "./popover";

interface MenuProps {
  /** Render del botón disparador; recibe el estado abierto. */
  trigger: (open: boolean) => ReactNode;
  children: ReactNode;
  align?: "start" | "end";
}

export function Menu({ trigger, children, align = "end" }: MenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      open={open}
      onClose={() => setOpen(false)}
      align={align}
      trigger={<div onClick={() => setOpen((value) => !value)}>{trigger(open)}</div>}
    >
      <div className="py-1" onClick={() => setOpen(false)}>
        {children}
      </div>
    </Popover>
  );
}

interface MenuItemProps {
  onClick?: () => void;
  icon?: ReactNode;
  children: ReactNode;
  tone?: "default" | "danger";
  disabled?: boolean;
}

export function MenuItem({ onClick, icon, children, tone = "default", disabled }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors disabled:pointer-events-none disabled:opacity-40",
        tone === "danger"
          ? "text-red-500 hover:bg-red-50"
          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
      )}
    >
      {icon ? <span className="text-zinc-400">{icon}</span> : null}
      {children}
    </button>
  );
}

export function MenuSeparator() {
  return <div className="my-1 border-t border-zinc-100" />;
}
