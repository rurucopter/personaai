import { createServiceRoleClient } from "@/lib/supabase/server";
import type { PageViewRow } from "@/lib/admin/analytics";
import { StatCard } from "@/components/admin/stat-card";
import { BarChart } from "@/components/admin/bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DayPoint } from "@/lib/admin/analytics";

const DAY_LABEL = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" });

function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default async function AdminTrafficPage() {
  const supabase = createServiceRoleClient();
  const { data: pageViews } = await supabase
    .from("page_views")
    .select("*")
    .returns<PageViewRow[]>();

  const pvSafe = pageViews ?? [];

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayISO = todayStart.toISOString();

  const pvToday = pvSafe.filter((pv) => pv.created_at >= todayISO);

  const visitorsToday = new Set(pvToday.map((pv) => pv.visitor_id)).size;
  const pageViewsToday = pvToday.length;
  const totalVisitors = new Set(pvSafe.map((pv) => pv.visitor_id)).size;
  const totalPageViews = pvSafe.length;

  const days = lastNDays(30);

  const visitorsByDay: DayPoint[] = days.map((d) => {
    const dayViews = pvSafe.filter((pv) => pv.created_at.slice(0, 10) === d);
    return {
      label: DAY_LABEL.format(new Date(d)),
      value: new Set(dayViews.map((pv) => pv.visitor_id)).size,
    };
  });

  const pageViewsByDay: DayPoint[] = days.map((d) => ({
    label: DAY_LABEL.format(new Date(d)),
    value: pvSafe.filter((pv) => pv.created_at.slice(0, 10) === d).length,
  }));

  // Top pages
  const pageMap = new Map<string, { views: number; visitors: Set<string> }>();
  for (const pv of pvSafe) {
    const entry = pageMap.get(pv.path) ?? { views: 0, visitors: new Set() };
    entry.views += 1;
    entry.visitors.add(pv.visitor_id);
    pageMap.set(pv.path, entry);
  }
  const topPages = Array.from(pageMap.entries())
    .map(([path, { views, visitors }]) => ({
      path,
      views,
      uniqueVisitors: visitors.size,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 20);

  // Top referrer sources
  const refMap = new Map<string, number>();
  for (const pv of pvSafe) {
    if (pv.referrer) {
      try {
        const host = new URL(pv.referrer).hostname;
        refMap.set(host, (refMap.get(host) ?? 0) + 1);
      } catch {
        refMap.set(pv.referrer, (refMap.get(pv.referrer) ?? 0) + 1);
      }
    }
  }
  const topReferrers = Array.from(refMap.entries())
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  // Device breakdown (rough from user-agent)
  let mobile = 0;
  let desktop = 0;
  for (const pv of pvSafe) {
    if (pv.user_agent && /mobile|android|iphone|ipad/i.test(pv.user_agent)) {
      mobile++;
    } else {
      desktop++;
    }
  }

  // Today's top pages
  const todayPageMap = new Map<string, number>();
  for (const pv of pvToday) {
    todayPageMap.set(pv.path, (todayPageMap.get(pv.path) ?? 0) + 1);
  }
  const todayTopPages = Array.from(todayPageMap.entries())
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Trafic</h1>
        <p className="text-muted-foreground">
          Analyse des visites sur le site.
        </p>
      </div>

      {/* Aujourd'hui */}
      <div>
        <h2 className="mb-3 text-sm font-medium tracking-widest text-muted-foreground uppercase">
          Aujourd&apos;hui
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Visiteurs uniques" value={String(visitorsToday)} />
          <StatCard label="Pages vues" value={String(pageViewsToday)} />
          <StatCard
            label="Pages / visiteur"
            value={visitorsToday > 0 ? (pageViewsToday / visitorsToday).toFixed(1) : "—"}
          />
          <StatCard
            label="Mobile vs Desktop"
            value={`${mobile > 0 ? Math.round((mobile / (mobile + desktop)) * 100) : 0}% mobile`}
          />
        </div>
      </div>

      {/* Total */}
      <div>
        <h2 className="mb-3 text-sm font-medium tracking-widest text-muted-foreground uppercase">
          Total
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Visiteurs uniques" value={String(totalVisitors)} />
          <StatCard label="Pages vues" value={String(totalPageViews)} />
          <StatCard
            label="Pages / visiteur"
            value={totalVisitors > 0 ? (totalPageViews / totalVisitors).toFixed(1) : "—"}
          />
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Visiteurs uniques (30 jours)</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={visitorsByDay} color="var(--chart-3)" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pages vues (30 jours)</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={pageViewsByDay} color="var(--brand)" />
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pages les plus visitées</CardTitle>
          </CardHeader>
          <CardContent>
            {topPages.length === 0 ? (
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
                  {topPages.map((p) => (
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
            {topReferrers.length === 0 ? (
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
                  {topReferrers.map((r) => (
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

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pages vues aujourd&apos;hui</CardTitle>
          </CardHeader>
          <CardContent>
            {todayTopPages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune visite aujourd&apos;hui pour le moment.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Page</th>
                    <th className="pb-2 font-medium">Vues</th>
                  </tr>
                </thead>
                <tbody>
                  {todayTopPages.map((p) => (
                    <tr key={p.path} className="border-b border-border last:border-0">
                      <td className="py-2 font-mono text-xs">{p.path}</td>
                      <td className="py-2">{p.views}</td>
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
