import type {
  GenerationJobHandle,
  GenerationJobInput,
  GenerationJobResult,
  VideoGenerationProvider,
} from "@/types/ai-provider";

const REPLICATE_API_BASE = "https://api.replicate.com/v1";
const MODEL_OWNER = "runwayml";
const MODEL_NAME = "aleph-2";

function authHeaders() {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("REPLICATE_API_TOKEN is not set");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

interface ReplicatePrediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output: string | null;
  error: string | null;
  urls: { get: string; cancel: string };
}

/**
 * Runway Aleph 2.0, run via Replicate's official-model endpoint. Gen-4
 * Aleph (v1) was sunset by Runway on 2026-07-30; verified this schema
 * against the live model on 2026-08-03: required input { video, prompt },
 * optional { seed, keyframe_images, keyframe_positions }, output is a
 * single video URI string.
 *
 * Source video constraints from the model itself: 2-30 seconds, max 16MB.
 */
export const runwayProvider: VideoGenerationProvider = {
  name: "runway",

  async submitJob(input: GenerationJobInput): Promise<GenerationJobHandle> {
    // Replicate validates the webhook field as a real HTTPS URL and rejects
    // the whole submission (422) otherwise — unlike fal.ai, which silently
    // accepts (and just never calls) an unreachable one. In local dev
    // NEXT_PUBLIC_APP_URL is http://localhost, so omit it entirely and rely
    // on the poll-based fallback instead of sending an invalid webhook.
    const hasValidWebhook = input.webhookUrl?.startsWith("https://");

    const res = await fetch(
      `${REPLICATE_API_BASE}/models/${MODEL_OWNER}/${MODEL_NAME}/predictions`,
      {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          input: {
            video: input.sourceVideoUrl,
            prompt: input.prompt,
            // keyframe_images describe what the OUTPUT should look like at
            // that position. Only use it in "become" mode (an AI character's
            // face — that IS what we want the output to look like). In
            // "preserve" mode it would be the user's own UNEDITED frame,
            // which told the model "the result should look like this
            // (unchanged)" and suppressed the restyling almost entirely.
            ...(input.referenceImageUrl && input.referenceMode === "become"
              ? { keyframe_images: [input.referenceImageUrl], keyframe_positions: ["first"] }
              : {}),
          },
          ...(hasValidWebhook
            ? { webhook: input.webhookUrl, webhook_events_filter: ["completed"] }
            : {}),
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`Replicate submit failed: ${res.status} ${await res.text()}`);
    }

    const data: ReplicatePrediction = await res.json();
    return { providerJobId: data.id, provider: "runway" };
  },

  async getJobStatus(handle: GenerationJobHandle): Promise<GenerationJobResult> {
    const res = await fetch(`${REPLICATE_API_BASE}/predictions/${handle.providerJobId}`, {
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Replicate status failed: ${res.status} ${await res.text()}`);
    }

    const data: ReplicatePrediction = await res.json();

    const statusMap: Record<ReplicatePrediction["status"], GenerationJobResult["status"]> = {
      starting: "queued",
      processing: "processing",
      succeeded: "completed",
      failed: "failed",
      canceled: "cancelled",
    };

    return {
      status: statusMap[data.status],
      progress: data.status === "succeeded" ? 100 : undefined,
      resultVideoUrl: data.output ?? undefined,
      errorMessage: data.error ?? undefined,
    };
  },

  async cancelJob(handle: GenerationJobHandle): Promise<void> {
    await fetch(`${REPLICATE_API_BASE}/predictions/${handle.providerJobId}/cancel`, {
      method: "POST",
      headers: authHeaders(),
    });
  },
};
