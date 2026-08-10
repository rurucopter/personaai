import { createServiceRoleClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import type { CreditsRow, SubscriptionRow, UserRow } from "@/types/database";

export default async function AdminUsersPage() {
  const supabase = createServiceRoleClient();

  const [{ data: users }, { data: credits }, { data: subscriptions }] = await Promise.all([
    supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .returns<UserRow[]>(),
    supabase.from("credits").select("*").returns<CreditsRow[]>(),
    supabase.from("subscriptions").select("*").returns<SubscriptionRow[]>(),
  ]);

  const creditsByUser = new Map((credits ?? []).map((c) => [c.user_id, c.balance]));
  const subByUser = new Map((subscriptions ?? []).map((s) => [s.user_id, s]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Utilisateurs</h1>
        <p className="text-muted-foreground">{users?.length ?? 0} utilisateurs.</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="p-3 font-medium">Utilisateur</th>
              <th className="p-3 font-medium">Crédits</th>
              <th className="p-3 font-medium">Plan</th>
              <th className="p-3 font-medium">Inscrit le</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  Aucun utilisateur pour le moment.
                </td>
              </tr>
            )}
            {(users ?? []).map((user) => {
              const sub = subByUser.get(user.id);
              return (
                <tr
                  key={user.id}
                  className="border-b border-border transition-colors last:border-0 hover:bg-muted/40"
                >
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{user.full_name ?? "—"}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </td>
                  <td className="p-3">{creditsByUser.get(user.id) ?? 0}</td>
                  <td className="p-3">
                    {sub ? (
                      <Badge variant="secondary">{sub.plan}</Badge>
                    ) : (
                      <span className="text-muted-foreground">Aucun</span>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
