import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { postprocessResultVideo } from "@/lib/video-postprocess";
import { isValidWebhookSecret } from "@/lib/webhooks";
import { failVideoAndRefund } from "@/lib/generation-finalize";
import { readJson } from "@/lib/http";
import type { VideoRow } from "@/types/database";

const FAILED_STATUSES = new Set(["ERROR", "FAILED", "failed", "canceled"]);
const SUCCESS_STATUSES = new Set(["OK", "COMPLETED", "succeeded"]);

interface ProviderOutput {
  video?: { url?: string };
  result_video_url?: string;
  output?: unknown;
  thumbnail?: { url?: string };
  thumbnail_url?: string;
}

interface GenerationWebhookPayload extends ProviderOutput {
  request_id?: string;
  id?: string;
  status?: string;
  error?: string | { message?: string };
  payload?: ProviderOutput;
}

/**
 * Generic webhook receiver for AI video providers. Each provider's payload
 * shape differs:
 * - Fal (active default): { request_id, status: "OK"|"ERROR", payload: { video: { url } }, error }
 * - Replicate: the full prediction object — { id, status: "succeeded"|"failed", output: "<uri>" }
 * Providers are matched to a video row via provider_job_id, not payload shape.
 *
 * Authenticated by a shared secret in the URL — this endpoint writes with the
 * service-role client (RLS bypassed), so an unauthenticated caller could
 * otherwise forge failures (free refunds) or set arbitrary result URLs.
 */
export async function POST(request: Request) {
  if (!isValidWebhookSecret(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await readJson<GenerationWebhookPayload>(request);
  if (!payload) {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const requestId = payload.request_id ?? payload.id;
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
    const message =
      (typeof payload.error === "string" ? payload.error : payload.error?.message) ??
      "La génération a échoué.";
    await failVideoAndRefund(supabase, video, message);
    return NextResponse.json({ success: true });
  }

  if (!SUCCESS_STATUSES.has(status)) {
    // Intermediate event (e.g. Replicate "start"/"logs") — nothing to persist yet.
    return NextResponse.json({ success: true });
  }

  // Fal wraps model output under `payload`; Replicate exposes it at the top level.
  const output: ProviderOutput = payload.payload ?? payload;
  const providerVideoUrl: string | undefined =
    output.video?.url ??
    output.result_video_url ??
    (typeof output.output === "string" ? output.output : undefined);

  // "Completed" with no video is a failure, not a success — otherwise the user
  // is charged for a video that can never play, with no refund.
  if (!providerVideoUrl) {
    await failVideoAndRefund(supabase, video, "Aucune vidéo produite.");
    return NextResponse.json({ success: true });
  }

  const resultVideoUrl = await postprocessResultVideo(providerVideoUrl, video.id);

  await supabase
    .from("videos")
    .update({
      status: "completed",
      progress: 100,
      result_video_url: resultVideoUrl,
      thumbnail_url: output.thumbnail?.url ?? output.thumbnail_url ?? null,
    })
    .eq("id", video.id)
    .in("status", ["queued", "processing"]);

  return NextResponse.json({ success: true });
}
