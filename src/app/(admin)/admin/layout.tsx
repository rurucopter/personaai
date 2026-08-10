import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-2 border-b border-border px-4 md:hidden">
          <AdminMobileNav />
          <span className="text-sm font-semibold tracking-tight">
            Persona<span className="text-brand">AI</span>{" "}
            <span className="text-xs font-normal text-muted-foreground">Admin</span>
          </span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
