import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getVideoProvider } from "@/lib/ai/registry";
import { computeGenerationCost } from "@/lib/credit-costs";
import { isUnderGenerationRateLimit } from "@/lib/rate-limit";
import {
  buildCharacterTransformationPrompt,
  buildTransformationPrompt,
} from "@/lib/ai/prompt-builder";
import { buildWebhookUrl } from "@/lib/webhooks";
import { failVideoAndRefund } from "@/lib/generation-finalize";
import { getAvatarTemplateById } from "@/lib/avatar-templates";
import type { GenerationJobInput, TransformationSettings } from "@/types/ai-provider";
import type { CharacterRow, VideoRow } from "@/types/database";

const CHARACTER_PREFIX = "character:";
const TEMPLATE_PREFIX = "template:";
const PHOTO_PREFIX = "photo:";

interface BecomeTarget {
  imageUrl: string;
  description: string;
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { data: source } = await supabase
    .from("videos")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single<VideoRow>();

  if (!source) {
    return NextResponse.json({ error: "Vidéo introuvable." }, { status: 404 });
  }

  if (!(await isUnderGenerationRateLimit(supabase, user.id))) {
    return NextResponse.json(
      { error: "Limite de générations atteinte, réessayez plus tard." },
      { status: 429 }
    );
  }

  const settings = source.settings as unknown as TransformationSettings;
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
  if (!canSpend) return NextResponse.json({ error: "Crédits insuffisants." }, { status: 402 });

  let becomeTarget: BecomeTarget | null = null;
  if (settings.persona.startsWith(CHARACTER_PREFIX)) {
    const characterId = settings.persona.slice(CHARACTER_PREFIX.length);
    const { data } = await supabase
      .from("ai_characters")
      .select("*")
      .eq("id", characterId)
      .eq("user_id", user.id)
      .single<CharacterRow>();
    if (data?.reference_image_url) {
      becomeTarget = { imageUrl: data.reference_image_url, description: data.description };
    }
  } else if (settings.persona.startsWith(TEMPLATE_PREFIX)) {
    const template = getAvatarTemplateById(settings.persona.slice(TEMPLATE_PREFIX.length));
    if (template) becomeTarget = { imageUrl: template.imageUrl, description: template.description };
  } else if (settings.persona.startsWith(PHOTO_PREFIX)) {
    const photoPath = settings.persona.slice(PHOTO_PREFIX.length);
    const { data: signedPhoto } = await supabase.storage
      .from("video-frames")
      .createSignedUrl(photoPath, 60 * 60);
    if (signedPhoto?.signedUrl) {
      becomeTarget = {
        imageUrl: signedPhoto.signedUrl,
        description: "the exact person shown in the reference photo",
      };
    }
  }

  const { data: video, error: insertError } = await supabase
    .from("videos")
    .insert({
      user_id: user.id,
      project_id: source.project_id,
      source_video_url: source.source_video_url,
      source_duration_seconds: source.source_duration_seconds,
      persona: source.persona,
      settings,
      provider: source.provider,
      status: "queued",
      credits_spent: cost,
    })
    .select()
    .single();

  if (insertError || !video) {
    await service.rpc("refund_credits", { p_user_id: user.id, p_amount: cost, p_video_id: null });
    return NextResponse.json(
      { error: insertError?.message ?? "Échec de duplication." },
      { status: 500 }
    );
  }

  const { data: sourceUrlData } = await supabase.storage
    .from("source-videos")
    .createSignedUrl(source.source_video_url, 60 * 60);

  const prompt = becomeTarget
    ? buildCharacterTransformationPrompt(becomeTarget.description, settings)
    : buildTransformationPrompt(settings);

  let finalVideo = video;

  try {
    const provider = getVideoProvider(source.provider);
    const jobInput: GenerationJobInput = {
      sourceVideoUrl: sourceUrlData?.signedUrl ?? source.source_video_url,
      settings,
      prompt,
      webhookUrl: buildWebhookUrl("/api/webhooks/generation"),
      referenceImageUrl: becomeTarget?.imageUrl,
      referenceMode: becomeTarget ? "become" : "preserve",
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
    action: "duplicate",
    metadata: { source_video_id: id },
  });

  return NextResponse.json({ video: finalVideo });
}
