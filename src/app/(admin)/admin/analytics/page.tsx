import { getAnalyticsData } from "@/lib/admin/analytics";
import { StatCard } from "@/components/admin/stat-card";
import { BarChart } from "@/components/admin/bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function eur(cents: number): string {
  return `${(cents / 100).toFixed(2)} €`;
}

export default async function AdminAnalyticsPage() {
  const data = await getAnalyticsData();
  const { kpis } = data;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Vue complète de la performance business de PersonaAI.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="MRR" value={eur(kpis.mrrCents)} hint="Revenu mensuel récurrent" />
        <StatCard label="Revenu total" value={eur(kpis.totalRevenueCents)} />
        <StatCard label="Revenu ce mois-ci" value={eur(kpis.monthRevenueCents)} />
        <StatCard
          label="Taux de conversion"
          value={pct(kpis.conversionRate)}
          hint={`${kpis.payingUsers} payants / ${kpis.totalUsers} inscrits`}
        />
        <StatCard label="Utilisateurs" value={String(kpis.totalUsers)} />
        <StatCard label="Abonnés payants" value={String(kpis.payingUsers)} />
        <StatCard
          label="Vidéos générées"
          value={String(kpis.totalVideos)}
          hint={`${pct(kpis.videoSuccessRate)} de réussite`}
        />
        <StatCard
          label="Parrainages convertis"
          value={`${kpis.referralConversions} / ${kpis.referredUsers}`}
          hint={pct(kpis.referralConversionRate)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Visiteurs uniques (30j)</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={data.visitorsByDay} color="var(--chart-3)" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inscriptions (30j)</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={data.signupsByDay} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenu (30j)</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={data.revenueByDay} formatValue={(v) => `${v.toFixed(2)} €`} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vidéos générées (30j)</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={data.videosByDay} color="var(--chart-2)" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par plan</CardTitle>
          </CardHeader>
          <CardContent>
            {data.planBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun abonnement actif.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Plan</th>
                    <th className="pb-2 font-medium">Abonnés actifs</th>
                    <th className="pb-2 font-medium">MRR</th>
                  </tr>
                </thead>
                <tbody>
                  {data.planBreakdown.map((p) => (
                    <tr key={p.plan} className="border-b border-border last:border-0">
                      <td className="py-2 capitalize">{p.plan}</td>
                      <td className="py-2">{p.activeCount}</td>
                      <td className="py-2">{eur(p.mrrCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par style</CardTitle>
          </CardHeader>
          <CardContent>
            {data.personaBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune vidéo générée.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Style</th>
                    <th className="pb-2 font-medium">Total</th>
                    <th className="pb-2 font-medium">Réussite</th>
                  </tr>
                </thead>
                <tbody>
                  {data.personaBreakdown.map((p) => (
                    <tr key={p.persona} className="border-b border-border last:border-0">
                      <td className="py-2">{p.persona}</td>
                      <td className="py-2">{p.total}</td>
                      <td className="py-2">{pct(p.successRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crédits</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Attribués / achetés</span>
              <span className="font-medium">{data.credits.totalGrantedOrPurchased}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dépensés en génération</span>
              <span className="font-medium">{data.credits.totalSpent}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Remboursés</span>
              <span className="font-medium">{data.credits.totalRefunded}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="text-muted-foreground">Solde total en circulation</span>
              <span className="font-medium">{data.credits.outstandingBalance}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meilleurs parrains</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topReferrers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun parrainage pour le moment.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Utilisateur</th>
                    <th className="pb-2 font-medium">Filleuls</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topReferrers.map((r) => (
                    <tr key={r.email} className="border-b border-border last:border-0">
                      <td className="py-2">{r.email}</td>
                      <td className="py-2">{r.referredCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dernières inscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentSignups.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune inscription pour le moment.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Email</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Parrainé</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentSignups.map((u) => (
                    <tr key={u.email} className="border-b border-border last:border-0">
                      <td className="py-2">{u.email}</td>
                      <td className="py-2 text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-2">{u.referredBy ? "Oui" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pages les plus visitées</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topPages.length === 0 ? (
              <p className="text-sm text-muted-foreground">Pas encore de données.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Page</th>
                    <th className="pb-2 font-medium">Vues</th>
                    <th className="pb-2 font-medium">Visiteurs</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPages.map((p) => (
                    <tr key={p.path} className="border-b border-border last:border-0">
                      <td className="py-2 font-mono text-xs">{p.path}</td>
                      <td className="py-2">{p.views}</td>
                      <td className="py-2">{p.uniqueVisitors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sources de trafic</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topReferrers2.length === 0 ? (
              <p className="text-sm text-muted-foreground">Pas encore de données.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Source</th>
                    <th className="pb-2 font-medium">Visites</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topReferrers2.map((r) => (
                    <tr key={r.referrer} className="border-b border-border last:border-0">
                      <td className="py-2">{r.referrer}</td>
                      <td className="py-2">{r.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
