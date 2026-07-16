"use client";

import { Check } from "lucide-react";
import { Fragment } from "react";

import { cn } from "@/lib/cn";

export interface Step {
  id: string;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  /** Índice del paso activo (los anteriores se marcan completados). */
  active: number;
  className?: string;
}

export function Stepper({ steps, active, className }: StepperProps) {
  return (
    <ol className={cn("flex items-center gap-2", className)}>
      {steps.map((step, index) => {
        const done = index < active;
        const current = index === active;
        return (
          <Fragment key={step.id}>
            {index > 0 ? (
              <div
                className={cn("h-px min-w-6 flex-1", done || current ? "bg-primary" : "bg-zinc-200")}
              />
            ) : null}
            <li className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  done && "bg-primary text-primary-foreground",
                  current && "bg-primary/10 text-primary ring-1 ring-primary",
                  !done && !current && "bg-zinc-100 text-zinc-400",
                )}
              >
                {done ? <Check size={13} strokeWidth={2.5} /> : index + 1}
              </span>
              <span className="hidden sm:block">
                <span
                  className={cn(
                    "block text-xs font-medium",
                    current ? "text-zinc-900" : "text-zinc-500",
                  )}
                >
                  {step.label}
                </span>
                {step.description ? (
                  <span className="block text-[11px] text-zinc-400">{step.description}</span>
                ) : null}
              </span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
