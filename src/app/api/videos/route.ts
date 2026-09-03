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
import { getAvatarTemplateById } from "@/lib/avatar-templates";
import type { GenerationJobInput, TransformationSettings } from "@/types/ai-provider";

const TEMPLATE_PREFIX = "template:";

// A ready-made avatar template drives "become" mode: the video's person is
// replaced by this target face.
interface BecomeTarget {
  imageUrl: string;
  description: string;
}

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
  let becomeTarget: BecomeTarget | null = null;

  if (body.personaId.startsWith(TEMPLATE_PREFIX)) {
    const template = getAvatarTemplateById(body.personaId.slice(TEMPLATE_PREFIX.length));
    if (!template) {
      return NextResponse.json({ error: "Avatar introuvable." }, { status: 400 });
    }
    becomeTarget = { imageUrl: template.imageUrl, description: template.description };
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

  // Become mode replaces the person, so it targets the avatar/character's own
  // face rather than preserving the user's — the user's captured frame
  // (if any) isn't relevant here.
  const referenceImageUrl = becomeTarget
    ? becomeTarget.imageUrl
    : body.referenceFramePath
      ? (
          await supabase.storage
            .from("video-frames")
            .createSignedUrl(body.referenceFramePath, 60 * 60)
        ).data?.signedUrl
      : undefined;

  const prompt = becomeTarget
    ? buildCharacterTransformationPrompt(becomeTarget.description, body.settings)
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
      referenceMode: becomeTarget ? "become" : "preserve",
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
