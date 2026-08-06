"use client";

import Link from "next/link";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "#fonctionnement", label: "Comment ça marche" },
  { href: "#cas-usage", label: "Cas d'usage" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Persona<span className="text-brand">AI</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" render={<Link href="/login" />} nativeButton={false}>
            Se connecter
          </Button>
          <Button render={<Link href="/signup" />} nativeButton={false}>
            Commencer
          </Button>
        </div>

        <DialogPrimitive.Root>
          <DialogPrimitive.Trigger
            render={<Button variant="ghost" size="icon" aria-label="Ouvrir le menu" />}
            nativeButton={false}
            className="md:hidden"
          >
            <Menu className="size-5" />
          </DialogPrimitive.Trigger>

          <DialogPrimitive.Portal>
            <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
            <DialogPrimitive.Popup className="fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col gap-6 border-l border-white/10 bg-card p-6 duration-200 data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold tracking-tight">
                  Persona<span className="text-brand">AI</span>
                </span>
                <DialogPrimitive.Close
                  render={<Button variant="ghost" size="icon-sm" aria-label="Fermer le menu" />}
                  nativeButton={false}
                >
                  <X className="size-4" />
                </DialogPrimitive.Close>
              </div>

              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <DialogPrimitive.Close
                    key={link.href}
                    render={<a href={link.href} />}
                    className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                  >
                    {link.label}
                  </DialogPrimitive.Close>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-2">
                <Button variant="outline" render={<Link href="/login" />} nativeButton={false}>
                  Se connecter
                </Button>
                <Button render={<Link href="/signup" />} nativeButton={false}>
                  Commencer
                </Button>
              </div>
            </DialogPrimitive.Popup>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </div>
    </header>
  );
}
