import { createServiceRoleClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

export default async function AdminOverviewPage() {
  const supabase = createServiceRoleClient();

  const [
    { count: userCount },
    { count: videoCount },
    { count: activeSubCount },
    { data: payments },
    { data: completedVideos },
  ] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("videos").select("id", { count: "exact", head: true }),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase.from("payments").select("amount_cents, created_at").eq("status", "paid"),
    supabase
      .from("videos")
      .select("created_at, updated_at")
      .eq("status", "completed"),
  ]);

  const totalRevenueCents = (payments ?? []).reduce((sum, p) => sum + p.amount_cents, 0);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const monthRevenueCents = (payments ?? [])
    .filter((p) => new Date(p.created_at) >= startOfMonth)
    .reduce((sum, p) => sum + p.amount_cents, 0);

  const durations = (completedVideos ?? []).map(
    (v) => (new Date(v.updated_at).getTime() - new Date(v.created_at).getTime()) / 1000
  );
  const avgSeconds =
    durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Statistiques</h1>
        <p className="text-muted-foreground">Vue d&apos;ensemble de la plateforme.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Utilisateurs" value={String(userCount ?? 0)} />
        <StatCard label="Vidéos générées" value={String(videoCount ?? 0)} />
        <StatCard label="Abonnements actifs" value={String(activeSubCount ?? 0)} />
        <StatCard
          label="Revenu total"
          value={`${(totalRevenueCents / 100).toFixed(2)} €`}
        />
        <StatCard
          label="Revenu ce mois-ci"
          value={`${(monthRevenueCents / 100).toFixed(2)} €`}
        />
        <StatCard
          label="Temps moyen de génération"
          value={avgSeconds > 0 ? `${Math.round(avgSeconds)} s` : "—"}
        />
      </div>
    </div>
  );
}
