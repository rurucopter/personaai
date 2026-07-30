import { createClient } from "@/lib/supabase/server";
import { VideoGallery } from "@/components/videos/video-gallery";
import type { VideoRow } from "@/types/database";

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: favorites } = await supabase
    .from("favorites")
    .select("video_id, videos(*)")
    .eq("user_id", user!.id);

  const videos = (favorites ?? [])
    .map((f) => f.videos as unknown as VideoRow)
    .filter(Boolean);
  const favoriteIds = new Set(videos.map((v) => v.id));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Favoris</h1>
        <p className="text-muted-foreground">
          Vos transformations préférées, à portée de main.
        </p>
      </div>

      {videos.length > 0 ? (
        <VideoGallery videos={videos} favoriteIds={favoriteIds} />
      ) : (
        <p className="text-sm text-muted-foreground">Aucun favori pour le moment.</p>
      )}
    </div>
  );
}
