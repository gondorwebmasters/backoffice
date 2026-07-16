"use client";

import { cn } from "@/lib/cn";

interface TabsProps {
  items: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

export function Tabs({ items, value, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 border-b border-zinc-100">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            "-mb-px border-b-2 px-3 pb-2.5 pt-1 text-sm transition-colors duration-200",
            item.value === value
              ? "border-primary font-semibold text-primary"
              : "border-transparent text-zinc-400 hover:border-zinc-200 hover:text-zinc-600",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
