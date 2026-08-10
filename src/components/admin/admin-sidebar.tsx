"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart3, CreditCard, LayoutDashboard, Users, type LucideIcon } from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Statistiques", icon: BarChart3 },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/subscriptions", label: "Abonnements", icon: CreditCard },
];

export function isAdminNavActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-background md:flex">
      <div className="flex h-16 items-center gap-2 px-6">
        <span className="text-sm font-semibold tracking-tight">
          Persona<span className="text-brand">AI</span>
        </span>
        <span className="text-xs text-muted-foreground">Admin</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {ADMIN_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isAdminNavActive(pathname, href);
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

        <Link
          href="/dashboard"
          className="mt-auto mb-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
        >
          <LayoutDashboard className="size-4" />
          Retour à l&apos;app
        </Link>
      </nav>
    </aside>
  );
}
