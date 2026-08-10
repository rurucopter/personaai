import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getCharacterImageJobStatus } from "@/lib/ai/character-provider";
import { failCharacterImageAndRefund } from "@/lib/generation-finalize";
import { rehostCharacterImage } from "@/lib/character-media";
import type { CharacterImageRow } from "@/types/database";

/**
 * Fallback for local dev, where fal's webhook can't reach localhost:
 * actively polls fal.ai for job status and syncs the DB. Mirrors
 * /api/videos/[id]/poll for the character-image generation path.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { data: image } = await supabase
    .from("character_images")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single<CharacterImageRow>();

  if (!image) return NextResponse.json({ error: "Image introuvable." }, { status: 404 });

  if (!["queued", "processing"].includes(image.status) || !image.provider_job_id) {
    return NextResponse.json({ image });
  }

  const result = await getCharacterImageJobStatus(image.provider_job_id);
  const service = createServiceRoleClient();

  if (result.status === "completed") {
    // Completed with no image is a failure — refund instead of a dead row.
    if (!result.imageUrl) {
      const updated = await failCharacterImageAndRefund(service, image, "Aucune image produite.");
      return NextResponse.json({ image: updated ?? image });
    }

    // Re-host so the image survives the provider CDN URL expiring.
    const durableUrl = await rehostCharacterImage(result.imageUrl, image.user_id, image.id);

    const { data: updated } = await supabase
      .from("character_images")
      .update({ status: "completed", image_url: durableUrl })
      .eq("id", image.id)
      .in("status", ["queued", "processing"])
      .select()
      .maybeSingle();

    if (image.is_reference) {
      await supabase
        .from("ai_characters")
        .update({ reference_image_url: durableUrl, updated_at: new Date().toISOString() })
        .eq("id", image.character_id);
    }

    return NextResponse.json({ image: updated ?? image });
  }

  if (result.status === "failed") {
    const updated = await failCharacterImageAndRefund(
      service,
      image,
      result.errorMessage ?? "La génération a échoué."
    );
    return NextResponse.json({ image: updated ?? image });
  }

  return NextResponse.json({ image });
}
