import { cn } from "@/lib/cn";

type Tone = "positive" | "neutral" | "warning" | "negative" | "muted";

const TONES: Record<Tone, string> = {
  positive: "bg-emerald-500",
  neutral: "bg-zinc-400",
  warning: "bg-amber-500",
  negative: "bg-red-500",
  muted: "bg-zinc-300",
};

export function BadgeDot({ tone = "neutral", label }: { tone?: Tone; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-zinc-600">
      <span className={cn("h-1.5 w-1.5 rounded-full", TONES[tone])} />
      {label}
    </span>
  );
}
