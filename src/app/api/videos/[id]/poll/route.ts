import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getVideoProvider } from "@/lib/ai/registry";
import type { VideoRow } from "@/types/database";

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

  if (result.status === "completed") {
    const { data: updated } = await supabase
      .from("videos")
      .update({ status: "completed", progress: 100, result_video_url: result.resultVideoUrl })
      .eq("id", video.id)
      .select()
      .single();

    return NextResponse.json({ video: updated ?? video });
  }

  if (result.status === "failed" || result.status === "cancelled") {
    const { data: updated } = await supabase
      .from("videos")
      .update({ status: "failed", error_message: result.errorMessage ?? "La génération a échoué." })
      .eq("id", video.id)
      .select()
      .single();

    const service = createServiceRoleClient();
    await service.rpc("refund_credits", {
      p_user_id: user.id,
      p_amount: video.credits_spent,
      p_video_id: video.id,
    });

    return NextResponse.json({ video: updated ?? video });
  }

  return NextResponse.json({ video });
}
