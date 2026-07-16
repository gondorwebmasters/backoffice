import {
  BarChart3,
  Building2,
  CalendarDays,
  CreditCard,
  LayoutGrid,
  ListChecks,
  Package,
  Receipt,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const MAIN_NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/members", label: "Miembros", icon: Users },
  { href: "/calendar", label: "Calendario", icon: CalendarDays },
  { href: "/plans", label: "Planes", icon: ListChecks },
  { href: "/subscriptions", label: "Suscripciones", icon: CreditCard },
  { href: "/billing", label: "Facturación", icon: Receipt },
  { href: "/products", label: "Productos", icon: Package },
  { href: "/polls", label: "Encuestas", icon: BarChart3 },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

export const SYSTEM_NAV: NavItem[] = [
  { href: "/system", label: "Visión global", icon: BarChart3 },
  { href: "/system/companies", label: "Empresas", icon: Building2 },
];

/** Etiquetas por segmento de ruta para las migas de pan. */
export const SEGMENT_LABELS: Record<string, string> = {
  members: "Miembros",
  calendar: "Calendario",
  plans: "Planes",
  subscriptions: "Suscripciones",
  billing: "Facturación",
  products: "Productos",
  polls: "Encuestas",
  settings: "Ajustes",
  system: "Sistema",
  companies: "Empresas",
  profile: "Mi perfil",
  finance: "Finanzas",
  onboarding: "Onboarding",
  danger: "Zona de peligro",
};
