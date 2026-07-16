"use client";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { cn } from "@/lib/cn";

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}

export function SlideOver({ open, onClose, title, subtitle, children, footer, wide }: SlideOverProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className={cn("fixed inset-0 z-40", open ? "pointer-events-auto" : "pointer-events-none")}>
      <div
        className={cn(
          "absolute inset-0 bg-zinc-950/20 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "absolute inset-y-0 right-0 flex w-full flex-col border-l border-zinc-200 bg-white shadow-pop transition-transform duration-200 ease-out",
          wide ? "max-w-2xl" : "max-w-lg",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-start justify-between border-b border-zinc-100 px-8 py-6">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900">{title}</h2>
            {subtitle ? <p className="mt-0.5 text-sm text-zinc-400">{subtitle}</p> : null}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Cerrar panel"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-8 py-6">{children}</div>
        {footer ? (
          <footer className="flex justify-end gap-3 border-t border-zinc-100 px-8 py-4">{footer}</footer>
        ) : null}
      </aside>
    </div>
  );
}
