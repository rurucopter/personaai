import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { VideoRow } from "@/types/database";

/**
 * Generic webhook receiver for AI video providers. Each provider's payload
 * shape differs, so this route normalizes to { requestId, status, resultUrl,
 * thumbnailUrl, errorMessage } before touching the DB. Providers are matched
 * to a video row via provider_job_id, not the fal-specific field names.
 */
export async function POST(request: Request) {
  const payload = await request.json();

  const requestId: string | undefined = payload.request_id ?? payload.id;
  if (!requestId) {
    return NextResponse.json({ error: "Missing job id." }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const { data: video } = await supabase
    .from("videos")
    .select("*")
    .eq("provider_job_id", requestId)
    .single<VideoRow>();

  if (!video) {
    return NextResponse.json({ error: "Unknown job." }, { status: 404 });
  }

  const status: string = payload.status ?? "";
  const failed = status === "ERROR" || status === "FAILED";

  if (failed) {
    await supabase
      .from("videos")
      .update({
        status: "failed",
        error_message: payload.error ?? "La génération a échoué.",
      })
      .eq("id", video.id);

    await supabase.rpc("refund_credits", {
      p_user_id: video.user_id,
      p_amount: video.credits_spent,
      p_video_id: video.id,
    });

    return NextResponse.json({ success: true });
  }

  await supabase
    .from("videos")
    .update({
      status: "completed",
      progress: 100,
      result_video_url: payload.video?.url ?? payload.result_video_url,
      thumbnail_url: payload.thumbnail?.url ?? payload.thumbnail_url,
    })
    .eq("id", video.id);

  return NextResponse.json({ success: true });
}
