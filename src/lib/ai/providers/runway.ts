import type {
  GenerationJobHandle,
  GenerationJobInput,
  GenerationJobResult,
  VideoGenerationProvider,
} from "@/types/ai-provider";
import { buildTransformationPrompt } from "@/lib/ai/prompt-builder";

const REPLICATE_API_BASE = "https://api.replicate.com/v1";
const MODEL_OWNER = "runwayml";
const MODEL_NAME = "gen4-aleph";

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
 * Runway Gen-4 Aleph, run via Replicate's official-model endpoint.
 * Verified against the live model schema on 2026-07-30:
 * required input { video, prompt }, optional { seed, aspect_ratio,
 * reference_image }, output is a single video URI string.
 *
 * Hard constraint from the model itself: input video must be under 16MB
 * and only the first 5 seconds are used.
 */
export const runwayProvider: VideoGenerationProvider = {
  name: "runway",

  async submitJob(input: GenerationJobInput): Promise<GenerationJobHandle> {
    const res = await fetch(
      `${REPLICATE_API_BASE}/models/${MODEL_OWNER}/${MODEL_NAME}/predictions`,
      {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          input: {
            video: input.sourceVideoUrl,
            prompt: buildTransformationPrompt(input.settings),
            ...(input.referenceImageUrl ? { reference_image: input.referenceImageUrl } : {}),
          },
          webhook: input.webhookUrl,
          webhook_events_filter: ["completed"],
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
