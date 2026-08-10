import {
  Clock,
  CreditCard,
  Heart,
  Home,
  Settings,
  Sparkles,
  UserRound,
  Video,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Shared by the desktop sidebar and the mobile drawer nav. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/dashboard/create", label: "Créer une transformation", icon: Sparkles },
  { href: "/dashboard/character", label: "Personnage IA", icon: UserRound },
  { href: "/dashboard/videos", label: "Mes vidéos", icon: Video },
  { href: "/dashboard/history", label: "Historique", icon: Clock },
  { href: "/dashboard/favorites", label: "Favoris", icon: Heart },
  { href: "/dashboard/billing", label: "Facturation", icon: CreditCard },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}
