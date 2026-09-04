import Link from "next/link";
import { ArrowRight, Coins, Gift, Sparkles, Video as VideoIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { VideoCard } from "@/components/videos/video-card";
import { ReferralCard } from "@/components/dashboard/referral-card";
import type { CreditsRow, SubscriptionRow, UserRow, VideoRow } from "@/types/database";

const PLAN_LABEL: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
  business: "Business",
  entreprise: "Entreprise",
};

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: credits }, { data: subscription }, { count }, { data: recent }, { data: favorites }, { data: profile }] =
    await Promise.all([
      supabase.from("credits").select("balance").eq("user_id", user!.id).maybeSingle<CreditsRow>(),
      supabase
        .from("subscriptions")
        .select("plan, status")
        .eq("user_id", user!.id)
        .maybeSingle<SubscriptionRow>(),
      supabase
        .from("videos")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id),
      supabase
        .from("videos")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(3)
        .returns<VideoRow[]>(),
      supabase.from("favorites").select("video_id").eq("user_id", user!.id),
      supabase.from("users").select("referral_code").eq("id", user!.id).maybeSingle<UserRow>(),
    ]);

  const favoriteIds = new Set((favorites ?? []).map((f) => f.video_id));
  const activePlan =
    subscription && subscription.status === "active"
      ? PLAN_LABEL[subscription.plan] ?? subscription.plan
      : "Gratuit";

  const stats = [
    { icon: Coins, label: "Crédits", value: credits?.balance ?? 0 },
    { icon: VideoIcon, label: "Vidéos générées", value: count ?? 0 },
    { icon: Sparkles, label: "Abonnement", value: activePlan },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Accueil</h1>
        <p className="text-muted-foreground">Bienvenue sur votre espace PersonaAI.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <stat.icon className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-semibold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/10 to-transparent p-6 sm:p-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold">Créez une nouvelle vidéo</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Écrivez votre histoire, choisissez un style, générez.
            </p>
          </div>
          <Button
            size="lg"
            render={<Link href="/dashboard/create" />}
            nativeButton={false}
            className="gap-2 shadow-[0_8px_30px_-8px_var(--brand)]"
          >
            <Sparkles className="size-4" />
            Commencer
          </Button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Gift className="size-4" />
          </div>
          <h2 className="text-lg font-semibold">Parrainez un ami, gagnez 3 crédits</h2>
        </div>
        <ReferralCard referralCode={profile?.referral_code ?? ""} />
      </div>

      {recent && recent.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Vidéos récentes</h2>
            <Link
              href="/dashboard/videos"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Tout voir
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((video) => (
              <VideoCard key={video.id} video={video} isFavorite={favoriteIds.has(video.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
