"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Clock,
  CreditCard,
  Heart,
  Home,
  Settings,
  Sparkles,
  UserRound,
  Video,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/dashboard/create", label: "Créer une transformation", icon: Sparkles },
  { href: "/dashboard/character", label: "Personnage IA", icon: UserRound },
  { href: "/dashboard/videos", label: "Mes vidéos", icon: Video },
  { href: "/dashboard/history", label: "Historique", icon: Clock },
  { href: "/dashboard/favorites", label: "Favoris", icon: Heart },
  { href: "/dashboard/billing", label: "Facturation", icon: CreditCard },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-background md:flex">
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
          PersonaAI
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard" ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/12 text-primary"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
