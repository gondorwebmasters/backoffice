"use client";

import { Check } from "lucide-react";
import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

/**
 * Checkbox custom: el nativo con accent-color deja que el navegador elija
 * el color del check (negro sobre acentos claros). Aquí el check es SIEMPRE
 * blanco sobre el acento del sistema.
 */
export function Checkbox({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <span className={cn("relative inline-flex h-4 w-4 shrink-0", className)}>
      <input
        type="checkbox"
        className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-zinc-300 bg-white transition-colors checked:border-primary checked:bg-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-40"
        {...props}
      />
      <Check
        size={11}
        strokeWidth={3}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 text-[white] peer-checked:block"
      />
    </span>
  );
}
