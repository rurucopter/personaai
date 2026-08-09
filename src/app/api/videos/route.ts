import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getVideoProvider } from "@/lib/ai/registry";
import { computeGenerationCost } from "@/lib/credit-costs";
import { isUnderGenerationRateLimit } from "@/lib/rate-limit";
import { getPersonaById } from "@/lib/personas";
import {
  buildCharacterTransformationPrompt,
  buildTransformationPrompt,
} from "@/lib/ai/prompt-builder";
import { buildWebhookUrl } from "@/lib/webhooks";
import { failVideoAndRefund } from "@/lib/generation-finalize";
import { readJson } from "@/lib/http";
import type { GenerationJobInput, TransformationSettings } from "@/types/ai-provider";
import type { CharacterRow } from "@/types/database";

const CHARACTER_PREFIX = "character:";

interface CreateVideoBody {
  sourceVideoPath: string;
  sourceDurationSeconds?: number;
  referenceFramePath?: string | null;
  sourceWidth?: number;
  sourceHeight?: number;
  personaId: string;
  settings: Omit<TransformationSettings, "persona">;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = await readJson<CreateVideoBody>(request);
  if (!body?.personaId || !body.sourceVideoPath) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const isCharacterMode = body.personaId.startsWith(CHARACTER_PREFIX);

  let character: CharacterRow | null = null;

  if (isCharacterMode) {
    const characterId = body.personaId.slice(CHARACTER_PREFIX.length);
    const { data } = await supabase
      .from("ai_characters")
      .select("*")
      .eq("id", characterId)
      .eq("user_id", user.id)
      .single<CharacterRow>();

    if (!data || !data.reference_image_url) {
      return NextResponse.json({ error: "Personnage introuvable." }, { status: 400 });
    }
    character = data;
  } else if (!getPersonaById(body.personaId)) {
    return NextResponse.json({ error: "Persona inconnu." }, { status: 400 });
  }

  if (!(await isUnderGenerationRateLimit(supabase, user.id))) {
    return NextResponse.json(
      { error: "Limite de générations atteinte, réessayez plus tard." },
      { status: 429 }
    );
  }

  const settings: TransformationSettings = { ...body.settings, persona: body.personaId };
  const cost = computeGenerationCost(settings);

  const service = createServiceRoleClient();

  const { data: canSpend, error: spendError } = await service.rpc("spend_credits", {
    p_user_id: user.id,
    p_amount: cost,
    p_video_id: null,
  });

  if (spendError) {
    console.error("spend_credits failed:", spendError);
    return NextResponse.json({ error: spendError.message }, { status: 500 });
  }
  if (!canSpend) {
    return NextResponse.json({ error: "Crédits insuffisants." }, { status: 402 });
  }

  const { data: sourceUrlData } = await supabase.storage
    .from("source-videos")
    .createSignedUrl(body.sourceVideoPath, 60 * 60);

  // Character mode replaces the person, so it targets the character's own
  // face rather than preserving the user's — the user's captured frame
  // (if any) isn't relevant here.
  const referenceImageUrl = character
    ? character.reference_image_url!
    : body.referenceFramePath
      ? (
          await supabase.storage
            .from("video-frames")
            .createSignedUrl(body.referenceFramePath, 60 * 60)
        ).data?.signedUrl
      : undefined;

  const prompt = character
    ? buildCharacterTransformationPrompt(character.description, body.settings)
    : buildTransformationPrompt(settings);

  const { data: video, error: insertError } = await supabase
    .from("videos")
    .insert({
      user_id: user.id,
      source_video_url: body.sourceVideoPath,
      source_duration_seconds: body.sourceDurationSeconds ?? null,
      persona: body.personaId,
      settings,
      provider: process.env.DEFAULT_AI_PROVIDER ?? "fal",
      status: "queued",
      credits_spent: cost,
    })
    .select()
    .single();

  if (insertError || !video) {
    console.error("video insert failed:", insertError);
    await service.rpc("refund_credits", {
      p_user_id: user.id,
      p_amount: cost,
      p_video_id: null,
    });
    return NextResponse.json(
      { error: insertError?.message ?? "Échec de création." },
      { status: 500 }
    );
  }

  let finalVideo = video;

  try {
    const provider = getVideoProvider();
    const jobInput: GenerationJobInput = {
      sourceVideoUrl: sourceUrlData?.signedUrl ?? body.sourceVideoPath,
      settings,
      prompt,
      webhookUrl: buildWebhookUrl("/api/webhooks/generation"),
      referenceImageUrl,
      referenceMode: character ? "become" : "preserve",
      sourceWidth: body.sourceWidth,
      sourceHeight: body.sourceHeight,
    };

    const handle = await provider.submitJob(jobInput);

    const { data: updated } = await supabase
      .from("videos")
      .update({ provider_job_id: handle.providerJobId, status: "processing" })
      .eq("id", video.id)
      .select()
      .single();

    if (updated) finalVideo = updated;
  } catch (err) {
    console.error("provider submitJob failed:", err);
    const updated = await failVideoAndRefund(
      service,
      video,
      err instanceof Error ? err.message : "Erreur du fournisseur IA."
    );
    if (updated) finalVideo = updated;
  }

  await supabase.from("history").insert({
    user_id: user.id,
    video_id: video.id,
    action: "generate",
    metadata: { persona: body.personaId },
  });

  return NextResponse.json({ video: finalVideo });
}
