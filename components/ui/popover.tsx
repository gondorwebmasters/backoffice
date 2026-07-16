"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";

interface PopoverProps {
  open: boolean;
  onClose: () => void;
  /** Elemento ancla (botón que abre el popover). */
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "end";
  className?: string;
  panelClassName?: string;
}

/**
 * Popover anclado headless: cierra con click fuera y Escape.
 * El panel se eleva con shadow-pop (elevación 4 del design system).
 */
export function Popover({
  open,
  onClose,
  trigger,
  children,
  align = "end",
  className,
  panelClassName,
}: PopoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {trigger}
      {open ? (
        <div
          className={cn(
            "absolute top-full z-50 mt-2 min-w-48 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-pop",
            align === "end" ? "right-0" : "left-0",
            panelClassName,
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
