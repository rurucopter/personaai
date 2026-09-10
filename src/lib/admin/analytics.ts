import { createServiceRoleClient } from "@/lib/supabase/server";
import type {
  CreditsRow,
  CreditTransactionRow,
  PaymentRow,
  SubscriptionRow,
  UserRow,
  VideoRow,
} from "@/types/database";

const PLAN_PRICE_CENTS: Record<string, number> = {
  starter: 999,
  pro: 1999,
  business: 3999,
  enterprise: 0,
};

export interface DayPoint {
  label: string;
  value: number;
}

export interface PageViewRow {
  id: string;
  path: string;
  referrer: string | null;
  visitor_id: string;
  user_agent: string | null;
  created_at: string;
}

export interface TodayStats {
  visitorsToday: number;
  pageViewsToday: number;
  signupsToday: number;
  videosToday: number;
  revenueToday: number;
  visitorsTotal: number;
  pageViewsTotal: number;
}

export interface AnalyticsData {
  today: TodayStats;
  kpis: {
    mrrCents: number;
    totalRevenueCents: number;
    monthRevenueCents: number;
    totalUsers: number;
    payingUsers: number;
    conversionRate: number;
    totalVideos: number;
    completedVideos: number;
    failedVideos: number;
    videoSuccessRate: number;
    referredUsers: number;
    referralConversions: number;
    referralConversionRate: number;
    avgGenerationSeconds: number;
  };
  signupsByDay: DayPoint[];
  revenueByDay: DayPoint[];
  videosByDay: DayPoint[];
  visitorsByDay: DayPoint[];
  planBreakdown: { plan: string; activeCount: number; mrrCents: number }[];
  personaBreakdown: {
    persona: string;
    total: number;
    completed: number;
    failed: number;
    successRate: number;
  }[];
  credits: {
    totalGrantedOrPurchased: number;
    totalSpent: number;
    totalRefunded: number;
    outstandingBalance: number;
  };
  topReferrers: { email: string; referredCount: number }[];
  recentSignups: { email: string; createdAt: string; referredBy: boolean }[];
  recentVideos: {
    email: string;
    persona: string;
    status: string;
    story: string | null;
    createdAt: string;
  }[];
  topPages: { path: string; views: number; uniqueVisitors: number }[];
  topReferrers2: { referrer: string; count: number }[];
}

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

function bucketByDay<T>(rows: T[], getDate: (row: T) => string, days: string[]): Map<string, T[]> {
  const map = new Map<string, T[]>(days.map((d) => [d, []]));
  for (const row of rows) {
    const day = getDate(row).slice(0, 10);
    if (map.has(day)) map.get(day)!.push(row);
  }
  return map;
}

const DAY_LABEL = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" });

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const supabase = createServiceRoleClient();

  const [
    { data: users },
    { data: subscriptions },
    { data: payments },
    { data: videos },
    { data: creditTransactions },
    { data: credits },
    { data: pageViews },
  ] = await Promise.all([
    supabase.from("users").select("*").returns<UserRow[]>(),
    supabase.from("subscriptions").select("*").returns<SubscriptionRow[]>(),
    supabase.from("payments").select("*").returns<PaymentRow[]>(),
    supabase.from("videos").select("*").returns<VideoRow[]>(),
    supabase.from("credit_transactions").select("*").returns<CreditTransactionRow[]>(),
    supabase.from("credits").select("*").returns<CreditsRow[]>(),
    supabase.from("page_views").select("*").returns<PageViewRow[]>(),
  ]);

  const usersSafe = users ?? [];
  const subscriptionsSafe = subscriptions ?? [];
  const paymentsSafe = (payments ?? []).filter((p) => p.status === "paid");
  const videosSafe = videos ?? [];
  const creditTxSafe = creditTransactions ?? [];
  const creditsSafe = credits ?? [];
  const pageViewsSafe = pageViews ?? [];

  // ── Today stats ──
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayISO = todayStart.toISOString();

  const pvToday = pageViewsSafe.filter((pv) => pv.created_at >= todayISO);
  const uniqueVisitorsToday = new Set(pvToday.map((pv) => pv.visitor_id)).size;
  const signupsToday = usersSafe.filter((u) => u.created_at >= todayISO).length;
  const videosToday = videosSafe.filter((v) => v.created_at >= todayISO).length;
  const revenueToday =
    paymentsSafe
      .filter((p) => p.created_at >= todayISO)
      .reduce((sum, p) => sum + p.amount_cents, 0) / 100;
  const totalUniqueVisitors = new Set(pageViewsSafe.map((pv) => pv.visitor_id)).size;

  const today: TodayStats = {
    visitorsToday: uniqueVisitorsToday,
    pageViewsToday: pvToday.length,
    signupsToday,
    videosToday,
    revenueToday,
    visitorsTotal: totalUniqueVisitors,
    pageViewsTotal: pageViewsSafe.length,
  };

  // ── KPIs ──
  const activeSubs = subscriptionsSafe.filter(
    (s) => s.status === "active" || s.status === "trialing"
  );
  const mrrCents = activeSubs.reduce((sum, s) => sum + (PLAN_PRICE_CENTS[s.plan] ?? 0), 0);

  const totalRevenueCents = paymentsSafe.reduce((sum, p) => sum + p.amount_cents, 0);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const monthRevenueCents = paymentsSafe
    .filter((p) => new Date(p.created_at) >= startOfMonth)
    .reduce((sum, p) => sum + p.amount_cents, 0);

  const payingUserIds = new Set(activeSubs.map((s) => s.user_id));
  const totalUsers = usersSafe.length;
  const payingUsers = payingUserIds.size;
  const conversionRate = totalUsers > 0 ? payingUsers / totalUsers : 0;

  const completedVideos = videosSafe.filter((v) => v.status === "completed");
  const failedVideos = videosSafe.filter((v) => v.status === "failed");
  const totalVideos = videosSafe.length;
  const videoSuccessRate =
    completedVideos.length + failedVideos.length > 0
      ? completedVideos.length / (completedVideos.length + failedVideos.length)
      : 0;

  const durations = completedVideos.map(
    (v) => (new Date(v.updated_at).getTime() - new Date(v.created_at).getTime()) / 1000
  );
  const avgGenerationSeconds =
    durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

  const referredUsers = usersSafe.filter((u) => u.referred_by).length;
  const referralConversions = usersSafe.filter((u) => u.referral_reward_granted).length;
  const referralConversionRate = referredUsers > 0 ? referralConversions / referredUsers : 0;

  // ── Charts (30 days) ──
  const days = lastNDays(30);
  const signupsByDayMap = bucketByDay(usersSafe, (u) => u.created_at, days);
  const revenueByDayMap = bucketByDay(paymentsSafe, (p) => p.created_at, days);
  const videosByDayMap = bucketByDay(videosSafe, (v) => v.created_at, days);
  const visitorsByDayMap = bucketByDay(pageViewsSafe, (pv) => pv.created_at, days);

  const signupsByDay: DayPoint[] = days.map((d) => ({
    label: DAY_LABEL.format(new Date(d)),
    value: signupsByDayMap.get(d)?.length ?? 0,
  }));
  const revenueByDay: DayPoint[] = days.map((d) => ({
    label: DAY_LABEL.format(new Date(d)),
    value: (revenueByDayMap.get(d) ?? []).reduce((sum, p) => sum + p.amount_cents, 0) / 100,
  }));
  const videosByDay: DayPoint[] = days.map((d) => ({
    label: DAY_LABEL.format(new Date(d)),
    value: videosByDayMap.get(d)?.length ?? 0,
  }));
  const visitorsByDay: DayPoint[] = days.map((d) => {
    const dayViews = visitorsByDayMap.get(d) ?? [];
    return {
      label: DAY_LABEL.format(new Date(d)),
      value: new Set(dayViews.map((pv) => pv.visitor_id)).size,
    };
  });

  // ── Plan breakdown ──
  const planCounts = new Map<string, number>();
  for (const s of activeSubs) {
    planCounts.set(s.plan, (planCounts.get(s.plan) ?? 0) + 1);
  }
  const planBreakdown = Array.from(planCounts.entries())
    .map(([plan, activeCount]) => ({
      plan,
      activeCount,
      mrrCents: activeCount * (PLAN_PRICE_CENTS[plan] ?? 0),
    }))
    .sort((a, b) => b.mrrCents - a.mrrCents);

  // ── Persona breakdown ──
  const personaMap = new Map<string, { total: number; completed: number; failed: number }>();
  for (const v of videosSafe) {
    const entry = personaMap.get(v.persona) ?? { total: 0, completed: 0, failed: 0 };
    entry.total += 1;
    if (v.status === "completed") entry.completed += 1;
    if (v.status === "failed") entry.failed += 1;
    personaMap.set(v.persona, entry);
  }
  const personaBreakdown = Array.from(personaMap.entries())
    .map(([persona, stats]) => ({
      persona,
      total: stats.total,
      completed: stats.completed,
      failed: stats.failed,
      successRate:
        stats.completed + stats.failed > 0 ? stats.completed / (stats.completed + stats.failed) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // ── Credits ──
  const totalGrantedOrPurchased = creditTxSafe
    .filter((t) => t.type === "purchase" || t.type === "subscription_grant")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = Math.abs(
    creditTxSafe.filter((t) => t.type === "generation_spend").reduce((sum, t) => sum + t.amount, 0)
  );
  const totalRefunded = creditTxSafe
    .filter((t) => t.type === "refund")
    .reduce((sum, t) => sum + t.amount, 0);
  const outstandingBalance = creditsSafe.reduce((sum, c) => sum + c.balance, 0);

  // ── Referrers (users who referred others) ──
  const userById = new Map(usersSafe.map((u) => [u.id, u]));
  const referrerCounts = new Map<string, number>();
  for (const u of usersSafe) {
    if (u.referred_by) {
      referrerCounts.set(u.referred_by, (referrerCounts.get(u.referred_by) ?? 0) + 1);
    }
  }
  const topReferrers = Array.from(referrerCounts.entries())
    .map(([referrerId, referredCount]) => ({
      email: userById.get(referrerId)?.email ?? referrerId,
      referredCount,
    }))
    .sort((a, b) => b.referredCount - a.referredCount)
    .slice(0, 5);

  // ── Recent signups ──
  const recentSignups = [...usersSafe]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
    .map((u) => ({ email: u.email, createdAt: u.created_at, referredBy: Boolean(u.referred_by) }));

  // ── Recent videos ──
  const recentVideos = [...videosSafe]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 15)
    .map((v) => ({
      email: userById.get(v.user_id)?.email ?? v.user_id,
      persona: v.persona,
      status: v.status,
      story: v.story,
      createdAt: v.created_at,
    }));

  // ── Top pages ──
  const pageMap = new Map<string, { views: number; visitors: Set<string> }>();
  for (const pv of pageViewsSafe) {
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
    .slice(0, 10);

  // ── Top referrer sources (external referrers) ──
  const refMap = new Map<string, number>();
  for (const pv of pageViewsSafe) {
    if (pv.referrer) {
      try {
        const host = new URL(pv.referrer).hostname;
        refMap.set(host, (refMap.get(host) ?? 0) + 1);
      } catch {
        refMap.set(pv.referrer, (refMap.get(pv.referrer) ?? 0) + 1);
      }
    }
  }
  const topReferrers2 = Array.from(refMap.entries())
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    today,
    kpis: {
      mrrCents,
      totalRevenueCents,
      monthRevenueCents,
      totalUsers,
      payingUsers,
      conversionRate,
      totalVideos,
      completedVideos: completedVideos.length,
      failedVideos: failedVideos.length,
      videoSuccessRate,
      referredUsers,
      referralConversions,
      referralConversionRate,
      avgGenerationSeconds,
    },
    signupsByDay,
    revenueByDay,
    videosByDay,
    visitorsByDay,
    planBreakdown,
    personaBreakdown,
    credits: { totalGrantedOrPurchased, totalSpent, totalRefunded, outstandingBalance },
    topReferrers,
    recentSignups,
    recentVideos,
    topPages,
    topReferrers2,
  };
}
