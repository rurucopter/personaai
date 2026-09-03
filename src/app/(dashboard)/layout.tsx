import { createClient } from "@/lib/supabase/server";
import { requireOwner } from "@/lib/auth/require-owner";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { PendingCreationRedirect } from "@/components/dashboard/pending-creation-redirect";
import type { CreditsRow, UserRow } from "@/types/database";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireOwner();
  const supabase = await createClient();

  const [{ data: profile }, { data: credits }] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single<UserRow>(),
    supabase.from("credits").select("*").eq("user_id", user.id).single<CreditsRow>(),
  ]);

  return (
    <div className="flex min-h-screen">
      <PendingCreationRedirect />
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardTopbar
          email={user.email ?? ""}
          fullName={profile?.full_name ?? null}
          avatarUrl={profile?.avatar_url ?? null}
          creditBalance={credits?.balance ?? 0}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
