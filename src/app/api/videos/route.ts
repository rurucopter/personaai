import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getVideoProvider } from "@/lib/ai/registry";
import { computeGenerationCost } from "@/lib/credit-costs";
import { isUnderGenerationRateLimit } from "@/lib/rate-limit";
import { getPersonaById } from "@/lib/personas";
import type { TransformationSettings } from "@/types/ai-provider";

interface CreateVideoBody {
  sourceVideoPath: string;
  sourceDurationSeconds?: number;
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

  const body = (await request.json()) as CreateVideoBody;
  const persona = getPersonaById(body.personaId);

  if (!persona) {
    return NextResponse.json({ error: "Persona inconnu." }, { status: 400 });
  }

  if (!(await isUnderGenerationRateLimit(supabase, user.id))) {
    return NextResponse.json(
      { error: "Limite de générations atteinte, réessayez plus tard." },
      { status: 429 }
    );
  }

  const settings: TransformationSettings = { ...body.settings, persona: persona.id };
  const cost = computeGenerationCost(settings);

  const service = createServiceRoleClient();

  const { data: canSpend, error: spendError } = await service.rpc("spend_credits", {
    p_user_id: user.id,
    p_amount: cost,
    p_video_id: null,
  });

  if (spendError) {
    return NextResponse.json({ error: spendError.message }, { status: 500 });
  }
  if (!canSpend) {
    return NextResponse.json({ error: "Crédits insuffisants." }, { status: 402 });
  }

  const { data: sourceUrlData } = await supabase.storage
    .from("source-videos")
    .createSignedUrl(body.sourceVideoPath, 60 * 60);

  const { data: video, error: insertError } = await supabase
    .from("videos")
    .insert({
      user_id: user.id,
      source_video_url: body.sourceVideoPath,
      source_duration_seconds: body.sourceDurationSeconds ?? null,
      persona: persona.id,
      settings,
      provider: process.env.DEFAULT_AI_PROVIDER ?? "fal",
      status: "queued",
      credits_spent: cost,
    })
    .select()
    .single();

  if (insertError || !video) {
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
    const handle = await provider.submitJob({
      sourceVideoUrl: sourceUrlData?.signedUrl ?? body.sourceVideoPath,
      settings,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/generation`,
    });

    const { data: updated } = await supabase
      .from("videos")
      .update({ provider_job_id: handle.providerJobId, status: "processing" })
      .eq("id", video.id)
      .select()
      .single();

    if (updated) finalVideo = updated;
  } catch (err) {
    const { data: updated } = await supabase
      .from("videos")
      .update({
        status: "failed",
        error_message: err instanceof Error ? err.message : "Erreur du fournisseur IA.",
      })
      .eq("id", video.id)
      .select()
      .single();

    if (updated) finalVideo = updated;

    await service.rpc("refund_credits", {
      p_user_id: user.id,
      p_amount: cost,
      p_video_id: video.id,
    });
  }

  await supabase.from("history").insert({
    user_id: user.id,
    video_id: video.id,
    action: "generate",
    metadata: { persona: persona.id },
  });

  return NextResponse.json({ video: finalVideo });
}
