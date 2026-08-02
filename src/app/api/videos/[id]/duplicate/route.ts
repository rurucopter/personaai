import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getVideoProvider } from "@/lib/ai/registry";
import { computeGenerationCost } from "@/lib/credit-costs";
import { isUnderGenerationRateLimit } from "@/lib/rate-limit";
import type { TransformationSettings } from "@/types/ai-provider";
import type { VideoRow } from "@/types/database";

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

  if (spendError) return NextResponse.json({ error: spendError.message }, { status: 500 });
  if (!canSpend) return NextResponse.json({ error: "Crédits insuffisants." }, { status: 402 });

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

  let finalVideo = video;

  try {
    const provider = getVideoProvider(source.provider);
    const handle = await provider.submitJob({
      sourceVideoUrl: sourceUrlData?.signedUrl ?? source.source_video_url,
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
    await service.rpc("refund_credits", { p_user_id: user.id, p_amount: cost, p_video_id: video.id });
  }

  await supabase.from("history").insert({
    user_id: user.id,
    video_id: video.id,
    action: "duplicate",
    metadata: { source_video_id: id },
  });

  return NextResponse.json({ video: finalVideo });
}
