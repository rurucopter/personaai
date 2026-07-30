import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { VideoGallery } from "@/components/videos/video-gallery";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import type { VideoRow } from "@/types/database";

export default async function VideosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: videos }, { data: favorites }] = await Promise.all([
    supabase
      .from("videos")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .returns<VideoRow[]>(),
    supabase.from("favorites").select("video_id").eq("user_id", user!.id),
  ]);

  const favoriteIds = new Set((favorites ?? []).map((f) => f.video_id));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mes vidéos</h1>
          <p className="text-muted-foreground">
            Retrouvez toutes vos transformations générées.
          </p>
        </div>
        <Button render={<Link href="/dashboard/create" />} nativeButton={false} className="gap-2">
          <Sparkles className="size-4" />
          Nouvelle transformation
        </Button>
      </div>

      {videos && videos.length > 0 ? (
        <VideoGallery videos={videos} favoriteIds={favoriteIds} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Aucune vidéo pour le moment. Créez votre première transformation.
        </p>
      )}
    </div>
  );
}
