"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ADMIN_NAV_ITEMS, isAdminNavActive } from "@/components/admin/admin-sidebar";
import { cn } from "@/lib/utils";

/** Hamburger + drawer nav for the admin area on small screens. */
export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger
        render={<Button variant="ghost" size="icon" aria-label="Ouvrir le menu" />}
        nativeButton={false}
        className="md:hidden"
      >
        <Menu className="size-5" />
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 md:hidden" />
        <DialogPrimitive.Popup className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col gap-6 border-r border-border bg-background p-4 duration-200 data-open:animate-in data-open:slide-in-from-left data-closed:animate-out data-closed:slide-out-to-left md:hidden">
          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-semibold tracking-tight">
              Persona<span className="text-brand">AI</span>{" "}
              <span className="text-xs font-normal text-muted-foreground">Admin</span>
            </span>
            <DialogPrimitive.Close
              render={<Button variant="ghost" size="icon-sm" aria-label="Fermer le menu" />}
              nativeButton={false}
            >
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>

          <nav className="flex flex-col gap-1">
            {ADMIN_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = isAdminNavActive(pathname, href);
              return (
                <DialogPrimitive.Close
                  key={href}
                  render={<Link href={href} />}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/12 text-primary"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </DialogPrimitive.Close>
              );
            })}

            <DialogPrimitive.Close
              render={<Link href="/dashboard" />}
              className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
            >
              <LayoutDashboard className="size-4" />
              Retour à l&apos;app
            </DialogPrimitive.Close>
          </nav>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
