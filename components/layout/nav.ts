import {
  BadgePercent,
  BarChart3,
  Building2,
  CalendarDays,
  CreditCard,
  FileText,
  LayoutGrid,
  ListChecks,
  Megaphone,
  Package,
  Receipt,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
}

export const MAIN_NAV: NavItem[] = [
  { href: "/", labelKey: "dashboard", icon: LayoutGrid },
  { href: "/members", labelKey: "members", icon: Users },
  { href: "/calendar", labelKey: "calendar", icon: CalendarDays },
  { href: "/plans", labelKey: "plans", icon: ListChecks },
  { href: "/subscriptions", labelKey: "subscriptions", icon: CreditCard },
  { href: "/billing", labelKey: "billing", icon: Receipt },
  { href: "/products", labelKey: "products", icon: Package },
  { href: "/promotions", labelKey: "promotions", icon: BadgePercent },
  { href: "/polls", labelKey: "polls", icon: BarChart3 },
  { href: "/broadcast", labelKey: "broadcast", icon: Megaphone },
  { href: "/reports", labelKey: "reports", icon: FileText },
  { href: "/settings", labelKey: "settings", icon: Settings },
];

export const SYSTEM_NAV: NavItem[] = [
  { href: "/system", labelKey: "overview", icon: BarChart3 },
  { href: "/system/companies", labelKey: "companies", icon: Building2 },
];

/** Claves de traducción (namespace "nav.segments") por segmento de ruta para las migas de pan. */
export const SEGMENT_LABEL_KEYS: Record<string, string> = {
  members: "members",
  calendar: "calendar",
  plans: "plans",
  subscriptions: "subscriptions",
  billing: "billing",
  products: "products",
  promotions: "promotions",
  polls: "polls",
  broadcast: "broadcast",
  reports: "reports",
  settings: "settings",
  system: "system",
  companies: "companies",
  profile: "profile",
  finance: "finance",
  onboarding: "onboarding",
  danger: "danger",
};