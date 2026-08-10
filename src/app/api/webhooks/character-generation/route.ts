import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { isValidWebhookSecret } from "@/lib/webhooks";
import { failCharacterImageAndRefund } from "@/lib/generation-finalize";
import { rehostCharacterImage } from "@/lib/character-media";
import { readJson } from "@/lib/http";
import type { CharacterImageRow } from "@/types/database";

const FAILED_STATUSES = new Set(["ERROR", "FAILED"]);
const SUCCESS_STATUSES = new Set(["OK", "COMPLETED"]);

interface CharacterWebhookPayload {
  request_id?: string;
  status?: string;
  error?: string | { message?: string };
  payload?: { images?: Array<{ url: string }> };
  images?: Array<{ url: string }>;
}

/**
 * Fal.ai webhook receiver for character reference/content images. Mirrors
 * /api/webhooks/generation but targets character_images instead of videos,
 * and — for reference portraits — also backfills ai_characters.reference_image_url.
 * Authenticated by the same shared-secret scheme (service-role writes).
 */
export async function POST(request: Request) {
  if (!isValidWebhookSecret(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await readJson<CharacterWebhookPayload>(request);
  if (!payload) {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const requestId = payload.request_id;
  if (!requestId) {
    return NextResponse.json({ error: "Missing job id." }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const { data: image } = await supabase
    .from("character_images")
    .select("*")
    .eq("provider_job_id", requestId)
    .single<CharacterImageRow>();

  if (!image) {
    return NextResponse.json({ error: "Unknown job." }, { status: 404 });
  }

  const status: string = payload.status ?? "";

  if (FAILED_STATUSES.has(status)) {
    const message =
      (typeof payload.error === "string" ? payload.error : payload.error?.message) ??
      "La génération a échoué.";
    await failCharacterImageAndRefund(supabase, image, message);
    return NextResponse.json({ success: true });
  }

  if (!SUCCESS_STATUSES.has(status)) {
    return NextResponse.json({ success: true });
  }

  const output = payload.payload ?? payload;
  const imageUrl: string | undefined = output.images?.[0]?.url;

  // Completed with no image is a failure — refund rather than leave a dead row.
  if (!imageUrl) {
    await failCharacterImageAndRefund(supabase, image, "Aucune image produite.");
    return NextResponse.json({ success: true });
  }

  // Re-host onto our own bucket so the image survives the provider CDN URL
  // expiring (falls back to the provider URL if re-hosting fails).
  const durableUrl = await rehostCharacterImage(imageUrl, image.user_id, image.id);

  await supabase
    .from("character_images")
    .update({ status: "completed", image_url: durableUrl })
    .eq("id", image.id)
    .in("status", ["queued", "processing"]);

  if (image.is_reference) {
    await supabase
      .from("ai_characters")
      .update({ reference_image_url: durableUrl, updated_at: new Date().toISOString() })
      .eq("id", image.character_id);
  }

  return NextResponse.json({ success: true });
}
