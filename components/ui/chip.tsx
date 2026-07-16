"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type ChipTone = "default" | "primary" | "success" | "warning" | "error";

const TONES: Record<ChipTone, string> = {
  default: "border-zinc-200 bg-zinc-50 text-zinc-600",
  primary: "border-primary/20 bg-primary/10 text-primary",
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-600",
  error: "border-red-500/20 bg-red-500/10 text-red-500",
};

interface ChipProps {
  children: ReactNode;
  tone?: ChipTone;
  onRemove?: () => void;
  className?: string;
}

export function Chip({ children, tone = "default", onRemove, className }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 max-w-48 items-center gap-1 rounded-full border px-2.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
    >
      <span className="truncate">{children}</span>
      {onRemove ? (
        <button
          onClick={onRemove}
          className="-mr-1 rounded-full p-0.5 transition-colors hover:bg-zinc-900/10"
          aria-label="Quitar"
        >
          <X size={11} strokeWidth={2} />
        </button>
      ) : null}
    </span>
  );
}
