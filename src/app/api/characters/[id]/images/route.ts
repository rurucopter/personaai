import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { submitCharacterImage } from "@/lib/ai/character-provider";
import { CHARACTER_IMAGE_COST } from "@/lib/credit-costs";
import type { CharacterRow } from "@/types/database";

interface GenerateImageBody {
  prompt: string;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: characterId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { data: character } = await supabase
    .from("ai_characters")
    .select("*")
    .eq("id", characterId)
    .eq("user_id", user.id)
    .single<CharacterRow>();

  if (!character) return NextResponse.json({ error: "Personnage introuvable." }, { status: 404 });
  if (!character.reference_image_url) {
    return NextResponse.json(
      { error: "L'image de référence du personnage n'est pas encore prête." },
      { status: 409 }
    );
  }

  const body = (await request.json()) as GenerateImageBody;
  if (!body.prompt?.trim()) {
    return NextResponse.json({ error: "Description de la scène requise." }, { status: 400 });
  }

  const service = createServiceRoleClient();

  const { data: canSpend, error: spendError } = await service.rpc("spend_credits", {
    p_user_id: user.id,
    p_amount: CHARACTER_IMAGE_COST,
    p_video_id: null,
  });

  if (spendError) return NextResponse.json({ error: spendError.message }, { status: 500 });
  if (!canSpend) return NextResponse.json({ error: "Crédits insuffisants." }, { status: 402 });

  const { data: image, error: insertError } = await supabase
    .from("character_images")
    .insert({
      character_id: character.id,
      user_id: user.id,
      prompt: body.prompt.trim(),
      is_reference: false,
      provider: "fal",
      status: "queued",
      credits_spent: CHARACTER_IMAGE_COST,
    })
    .select()
    .single();

  if (insertError || !image) {
    await service.rpc("refund_credits", {
      p_user_id: user.id,
      p_amount: CHARACTER_IMAGE_COST,
      p_video_id: null,
    });
    return NextResponse.json(
      { error: insertError?.message ?? "Échec de création." },
      { status: 500 }
    );
  }

  try {
    const requestId = await submitCharacterImage(
      character.reference_image_url,
      body.prompt.trim(),
      `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/character-generation`
    );

    await supabase
      .from("character_images")
      .update({ provider_job_id: requestId, status: "processing" })
      .eq("id", image.id);
  } catch (err) {
    await supabase
      .from("character_images")
      .update({
        status: "failed",
        error_message: err instanceof Error ? err.message : "Erreur du fournisseur IA.",
      })
      .eq("id", image.id);

    await service.rpc("refund_credits", {
      p_user_id: user.id,
      p_amount: CHARACTER_IMAGE_COST,
      p_video_id: null,
    });
  }

  return NextResponse.json({ image });
}
