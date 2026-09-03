import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getVideoProvider } from "@/lib/ai/registry";
import { computeStoryVideoCost } from "@/lib/credit-costs";
import { isUnderGenerationRateLimit } from "@/lib/rate-limit";
import { getPersonaById } from "@/lib/personas";
import { buildStoryPrompt } from "@/lib/ai/prompt-builder";
import { buildWebhookUrl } from "@/lib/webhooks";
import { failVideoAndRefund } from "@/lib/generation-finalize";
import { getAvatarTemplateById } from "@/lib/avatar-templates";
import type { GenerationJobInput, TransformationSettings } from "@/types/ai-provider";
import type { VideoRow } from "@/types/database";

const TEMPLATE_PREFIX = "template:";

function resolveStyleDescription(personaId: string): string | null {
  if (personaId.startsWith(TEMPLATE_PREFIX)) {
    return getAvatarTemplateById(personaId.slice(TEMPLATE_PREFIX.length))?.description ?? null;
  }
  return getPersonaById(personaId)?.promptDescription ?? null;
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

  if (!source?.story) {
    return NextResponse.json({ error: "Vidéo introuvable." }, { status: 404 });
  }

  if (!(await isUnderGenerationRateLimit(supabase, user.id))) {
    return NextResponse.json(
      { error: "Limite de générations atteinte, réessayez plus tard." },
      { status: 429 }
    );
  }

  const settings = source.settings as unknown as TransformationSettings;
  const styleDescription = resolveStyleDescription(settings.persona);
  if (!styleDescription) {
    return NextResponse.json({ error: "Style inconnu." }, { status: 400 });
  }

  const durationSeconds: 5 | 10 = source.source_duration_seconds === 10 ? 10 : 5;
  const cost = computeStoryVideoCost(durationSeconds);
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

  const { data: video, error: insertError } = await supabase
    .from("videos")
    .insert({
      user_id: user.id,
      project_id: source.project_id,
      story: source.story,
      source_duration_seconds: durationSeconds,
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

  const prompt = buildStoryPrompt(styleDescription, source.story);

  let finalVideo = video;

  try {
    const provider = getVideoProvider(source.provider);
    const jobInput: GenerationJobInput = {
      settings,
      prompt,
      webhookUrl: buildWebhookUrl("/api/webhooks/generation"),
      durationSeconds,
      aspectRatio: "9:16",
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
