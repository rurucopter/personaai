import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { CharacterImageRow } from "@/types/database";

const FAILED_STATUSES = new Set(["ERROR", "FAILED"]);
const SUCCESS_STATUSES = new Set(["OK", "COMPLETED"]);

/**
 * Fal.ai webhook receiver for character reference/content images. Mirrors
 * /api/webhooks/generation but targets character_images instead of videos,
 * and — for reference portraits — also backfills ai_characters.reference_image_url.
 */
export async function POST(request: Request) {
  const payload = await request.json();

  const requestId: string | undefined = payload.request_id;
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
    await supabase
      .from("character_images")
      .update({
        status: "failed",
        error_message:
          (typeof payload.error === "string" ? payload.error : payload.error?.message) ??
          "La génération a échoué.",
      })
      .eq("id", image.id);

    await supabase.rpc("refund_credits", {
      p_user_id: image.user_id,
      p_amount: image.credits_spent,
      p_video_id: null,
    });

    return NextResponse.json({ success: true });
  }

  if (!SUCCESS_STATUSES.has(status)) {
    return NextResponse.json({ success: true });
  }

  const output = payload.payload ?? payload;
  const imageUrl: string | undefined = output.images?.[0]?.url;

  await supabase
    .from("character_images")
    .update({ status: "completed", image_url: imageUrl ?? null })
    .eq("id", image.id);

  if (image.is_reference && imageUrl) {
    await supabase
      .from("ai_characters")
      .update({ reference_image_url: imageUrl, updated_at: new Date().toISOString() })
      .eq("id", image.character_id);
  }

  return NextResponse.json({ success: true });
}
