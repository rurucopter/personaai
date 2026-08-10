import { createServiceRoleClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import type { SubscriptionRow, UserRow } from "@/types/database";

export default async function AdminSubscriptionsPage() {
  const supabase = createServiceRoleClient();

  const [{ data: subscriptions }, { data: users }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<SubscriptionRow[]>(),
    supabase.from("users").select("*").returns<UserRow[]>(),
  ]);

  const userById = new Map((users ?? []).map((u) => [u.id, u]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Abonnements</h1>
        <p className="text-muted-foreground">{subscriptions?.length ?? 0} abonnements.</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="p-3 font-medium">Utilisateur</th>
              <th className="p-3 font-medium">Plan</th>
              <th className="p-3 font-medium">Statut</th>
              <th className="p-3 font-medium">Fin de période</th>
            </tr>
          </thead>
          <tbody>
            {(subscriptions ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  Aucun abonnement pour le moment.
                </td>
              </tr>
            )}
            {(subscriptions ?? []).map((sub) => {
              const user = userById.get(sub.user_id);
              return (
                <tr
                  key={sub.id}
                  className="border-b border-border transition-colors last:border-0 hover:bg-muted/40"
                >
                  <td className="p-3">{user?.email ?? sub.user_id}</td>
                  <td className="p-3">
                    <Badge variant="secondary">{sub.plan}</Badge>
                  </td>
                  <td className="p-3">{sub.status}</td>
                  <td className="p-3 text-muted-foreground">
                    {sub.current_period_end
                      ? new Date(sub.current_period_end).toLocaleDateString("fr-FR")
                      : "—"}
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
