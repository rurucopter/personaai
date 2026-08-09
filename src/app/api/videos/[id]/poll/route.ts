import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getVideoProvider } from "@/lib/ai/registry";
import { postprocessResultVideo } from "@/lib/video-postprocess";
import { failVideoAndRefund } from "@/lib/generation-finalize";
import type { VideoRow } from "@/types/database";

// Hard ceiling on how long a job may sit in queued/processing. Kling and
// Runway realistically finish within a few minutes; well past that the job
// has almost certainly died provider-side without ever reporting failure, so
// we stop waiting, refund, and let the user retry instead of hanging forever.
const MAX_GENERATION_MINUTES = 12;

/**
 * Fallback for local dev, where the provider's webhook can't reach
 * localhost: actively polls the provider for job status and syncs the DB.
 * In production the webhook usually wins the race and this becomes a no-op.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { data: video } = await supabase
    .from("videos")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single<VideoRow>();

  if (!video) return NextResponse.json({ error: "Vidéo introuvable." }, { status: 404 });

  if (!["queued", "processing"].includes(video.status) || !video.provider_job_id) {
    return NextResponse.json({ video });
  }

  const provider = getVideoProvider(video.provider);
  const result = await provider.getJobStatus({
    providerJobId: video.provider_job_id,
    provider: video.provider,
  });

  const service = createServiceRoleClient();

  if (result.status === "completed") {
    // A "completed" job with no video is a failure — refund instead of
    // leaving the user a completed row that can never play.
    if (!result.resultVideoUrl) {
      const updated = await failVideoAndRefund(service, video, "Aucune vidéo produite.");
      return NextResponse.json({ video: updated ?? video });
    }

    const finalUrl = await postprocessResultVideo(result.resultVideoUrl, video.id);

    const { data: updated } = await supabase
      .from("videos")
      .update({ status: "completed", progress: 100, result_video_url: finalUrl })
      .eq("id", video.id)
      .in("status", ["queued", "processing"])
      .select()
      .maybeSingle();

    return NextResponse.json({ video: updated ?? video });
  }

  if (result.status === "failed" || result.status === "cancelled") {
    const updated = await failVideoAndRefund(
      service,
      video,
      result.errorMessage ?? "La génération a échoué."
    );
    return NextResponse.json({ video: updated ?? video });
  }

  // Still queued/processing: enforce the hard timeout so a silently-dead job
  // can't leave the user staring at an endless "Génération en cours".
  const minutesElapsed = (Date.now() - new Date(video.created_at).getTime()) / 60000;
  if (minutesElapsed > MAX_GENERATION_MINUTES) {
    const updated = await failVideoAndRefund(
      service,
      video,
      "La génération a expiré. Vos crédits ont été remboursés, réessayez."
    );
    return NextResponse.json({ video: updated ?? video });
  }

  return NextResponse.json({ video });
}
