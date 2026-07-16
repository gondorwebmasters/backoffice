import { cn } from "@/lib/cn";

export function Avatar({
  name,
  url,
  size = "md",
}: {
  name: string;
  url?: string | null;
  size?: "sm" | "md" | "xl";
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sizeClasses =
    size === "sm" ? "h-7 w-7 text-[10px]" : size === "xl" ? "h-20 w-20 text-xl" : "h-9 w-9 text-xs";

  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} className={cn("rounded-full object-cover", sizeClasses)} />;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary",
        sizeClasses,
      )}
    >
      {initials || "?"}
    </span>
  );
}
