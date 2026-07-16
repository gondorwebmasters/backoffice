const CURRENCY_SYMBOLS: Record<string, string> = { eur: "€", usd: "$", gbp: "£" };

/** Los importes del server están en céntimos (ver server/src/entities/Plan.ts). */
export function formatCents(amount: number, currency = "eur"): string {
  const value = (amount / 100).toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${value} ${CURRENCY_SYMBOLS[currency] ?? currency.toUpperCase()}`;
}

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(isNaN(Number(value)) ? value : Number(value));
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(isNaN(Number(value)) ? value : Number(value));
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = (result.getDay() + 6) % 7; // lunes = 0
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export const DAYS_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function fullName(user?: { name?: string | null; surname?: string | null; nickname?: string } | null): string {
  if (!user) return "—";
  const name = [user.name, user.surname].filter(Boolean).join(" ");
  return name || user.nickname || "—";
}
