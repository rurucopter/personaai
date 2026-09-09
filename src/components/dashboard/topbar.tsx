import Link from "next/link";
import { signOut } from "@/lib/auth/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { DashboardMobileNav } from "@/components/dashboard/mobile-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertTriangle, LogOut } from "lucide-react";

const LOW_CREDIT_THRESHOLD = 2;

interface DashboardTopbarProps {
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  creditBalance: number;
}

export function DashboardTopbar({
  email,
  fullName,
  avatarUrl,
  creditBalance,
}: DashboardTopbarProps) {
  const initials = (fullName ?? email).slice(0, 2).toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-6">
      <DashboardMobileNav />
      <div className="flex items-center gap-3">
        {creditBalance <= LOW_CREDIT_THRESHOLD && (
          <Link
            href="/dashboard/billing"
            className="flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
          >
            <AlertTriangle className="size-3" />
            Crédits bas — recharger
          </Link>
        )}
        <Badge
          variant="secondary"
          className={
            creditBalance <= LOW_CREDIT_THRESHOLD
              ? "border-destructive/30 bg-destructive/10 font-medium text-destructive"
              : "border-primary/25 bg-primary/10 font-medium text-primary"
          }
        >
          {creditBalance} crédit{creditBalance !== 1 ? "s" : ""}
        </Badge>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="gap-2 px-2" />}>
            <Avatar className="size-7">
              <AvatarImage src={avatarUrl ?? undefined} alt={fullName ?? email} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-sm">
              <p className="font-medium">{fullName ?? "Mon compte"}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
            <DropdownMenuSeparator />
            <form action={signOut}>
              <DropdownMenuItem
                render={<button type="submit" className="flex w-full items-center gap-2" />}
              >
                <LogOut className="size-4" />
                Se déconnecter
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
