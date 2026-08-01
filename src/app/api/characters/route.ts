import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { submitMasterReference } from "@/lib/ai/character-provider";
import { CHARACTER_IMAGE_COST } from "@/lib/credit-costs";

interface CreateCharacterBody {
  name: string;
  description: string;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { data: characters } = await supabase
    .from("ai_characters")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ characters: characters ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = (await request.json()) as CreateCharacterBody;
  if (!body.name?.trim() || !body.description?.trim()) {
    return NextResponse.json({ error: "Nom et description requis." }, { status: 400 });
  }

  const service = createServiceRoleClient();

  const { data: canSpend, error: spendError } = await service.rpc("spend_credits", {
    p_user_id: user.id,
    p_amount: CHARACTER_IMAGE_COST,
    p_video_id: null,
  });

  if (spendError) return NextResponse.json({ error: spendError.message }, { status: 500 });
  if (!canSpend) return NextResponse.json({ error: "Crédits insuffisants." }, { status: 402 });

  const { data: character, error: insertError } = await supabase
    .from("ai_characters")
    .insert({ user_id: user.id, name: body.name.trim(), description: body.description.trim() })
    .select()
    .single();

  if (insertError || !character) {
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

  const { data: referenceImage, error: imageInsertError } = await supabase
    .from("character_images")
    .insert({
      character_id: character.id,
      user_id: user.id,
      prompt: body.description.trim(),
      is_reference: true,
      provider: "fal",
      status: "queued",
      credits_spent: CHARACTER_IMAGE_COST,
    })
    .select()
    .single();

  if (imageInsertError || !referenceImage) {
    return NextResponse.json({ character, referenceImage: null });
  }

  try {
    const requestId = await submitMasterReference(
      body.description.trim(),
      `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/character-generation`
    );

    await supabase
      .from("character_images")
      .update({ provider_job_id: requestId, status: "processing" })
      .eq("id", referenceImage.id);
  } catch (err) {
    await supabase
      .from("character_images")
      .update({
        status: "failed",
        error_message: err instanceof Error ? err.message : "Erreur du fournisseur IA.",
      })
      .eq("id", referenceImage.id);

    await service.rpc("refund_credits", {
      p_user_id: user.id,
      p_amount: CHARACTER_IMAGE_COST,
      p_video_id: null,
    });
  }

  return NextResponse.json({ character, referenceImage });
}
