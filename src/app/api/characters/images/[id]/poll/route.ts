import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getCharacterImageJobStatus } from "@/lib/ai/character-provider";
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

  if (result.status === "completed") {
    const { data: updated } = await supabase
      .from("character_images")
      .update({ status: "completed", image_url: result.imageUrl })
      .eq("id", image.id)
      .select()
      .single();

    return NextResponse.json({ image: updated ?? image });
  }

  if (result.status === "failed") {
    const { data: updated } = await supabase
      .from("character_images")
      .update({ status: "failed", error_message: result.errorMessage ?? "La génération a échoué." })
      .eq("id", image.id)
      .select()
      .single();

    const service = createServiceRoleClient();
    await service.rpc("refund_credits", {
      p_user_id: user.id,
      p_amount: image.credits_spent,
      p_video_id: null,
    });

    return NextResponse.json({ image: updated ?? image });
  }

  return NextResponse.json({ image });
}
