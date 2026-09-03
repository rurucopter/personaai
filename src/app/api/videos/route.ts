import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getVideoProvider } from "@/lib/ai/registry";
import { computeStoryVideoCost } from "@/lib/credit-costs";
import { isUnderGenerationRateLimit } from "@/lib/rate-limit";
import { getPersonaById } from "@/lib/personas";
import { buildStoryPrompt } from "@/lib/ai/prompt-builder";
import { buildWebhookUrl } from "@/lib/webhooks";
import { failVideoAndRefund } from "@/lib/generation-finalize";
import { readJson } from "@/lib/http";
import { getAvatarTemplateById } from "@/lib/avatar-templates";
import type { GenerationJobInput, TransformationSettings } from "@/types/ai-provider";

const TEMPLATE_PREFIX = "template:";
const MAX_STORY_LENGTH = 1000;

interface CreateVideoBody {
  story: string;
  personaId: string;
  durationSeconds?: 5 | 10;
}

function resolveStyleDescription(personaId: string): string | null {
  if (personaId.startsWith(TEMPLATE_PREFIX)) {
    return getAvatarTemplateById(personaId.slice(TEMPLATE_PREFIX.length))?.description ?? null;
  }
  return getPersonaById(personaId)?.promptDescription ?? null;
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
  const story = body?.story?.trim();
  if (!body?.personaId || !story) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  if (story.length > MAX_STORY_LENGTH) {
    return NextResponse.json(
      { error: `Histoire trop longue (${MAX_STORY_LENGTH} caractères maximum).` },
      { status: 400 }
    );
  }

  const styleDescription = resolveStyleDescription(body.personaId);
  if (!styleDescription) {
    return NextResponse.json({ error: "Style inconnu." }, { status: 400 });
  }

  if (!(await isUnderGenerationRateLimit(supabase, user.id))) {
    return NextResponse.json(
      { error: "Limite de générations atteinte, réessayez plus tard." },
      { status: 429 }
    );
  }

  const durationSeconds: 5 | 10 = body.durationSeconds === 10 ? 10 : 5;
  const settings: TransformationSettings = { persona: body.personaId };
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
  if (!canSpend) {
    return NextResponse.json({ error: "Crédits insuffisants." }, { status: 402 });
  }

  const prompt = buildStoryPrompt(styleDescription, story);

  const { data: video, error: insertError } = await supabase
    .from("videos")
    .insert({
      user_id: user.id,
      story,
      // Reused to remember the requested output duration (5s/10s) — there's
      // no source video anymore, so this column just tracks generation
      // length now, which duplicate/retry needs to charge and regenerate
      // at the same duration instead of silently defaulting to 5s.
      source_duration_seconds: durationSeconds,
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
    action: "generate",
    metadata: { persona: body.personaId },
  });

  return NextResponse.json({ video: finalVideo });
}
