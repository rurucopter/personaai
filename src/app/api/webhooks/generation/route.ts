import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { VideoRow } from "@/types/database";

const FAILED_STATUSES = new Set(["ERROR", "FAILED", "failed", "canceled"]);
const SUCCESS_STATUSES = new Set(["OK", "COMPLETED", "succeeded"]);

/**
 * Generic webhook receiver for AI video providers. Each provider's payload
 * shape differs:
 * - Fal (active default): { request_id, status: "OK"|"ERROR", payload: { video: { url } }, error }
 * - Replicate: the full prediction object — { id, status: "succeeded"|"failed", output: "<uri>" }
 * Providers are matched to a video row via provider_job_id, not payload shape.
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

  if (FAILED_STATUSES.has(status)) {
    await supabase
      .from("videos")
      .update({
        status: "failed",
        error_message:
          (typeof payload.error === "string" ? payload.error : payload.error?.message) ??
          "La génération a échoué.",
      })
      .eq("id", video.id);

    await supabase.rpc("refund_credits", {
      p_user_id: video.user_id,
      p_amount: video.credits_spent,
      p_video_id: video.id,
    });

    return NextResponse.json({ success: true });
  }

  if (!SUCCESS_STATUSES.has(status)) {
    // Intermediate event (e.g. Replicate "start"/"logs") — nothing to persist yet.
    return NextResponse.json({ success: true });
  }

  // Fal wraps model output under `payload`; Replicate exposes it at the top level.
  const output = payload.payload ?? payload;
  const resultVideoUrl =
    output.video?.url ?? output.result_video_url ?? (typeof output.output === "string" ? output.output : undefined);

  await supabase
    .from("videos")
    .update({
      status: "completed",
      progress: 100,
      result_video_url: resultVideoUrl,
      thumbnail_url: output.thumbnail?.url ?? output.thumbnail_url ?? null,
    })
    .eq("id", video.id);

  return NextResponse.json({ success: true });
}
