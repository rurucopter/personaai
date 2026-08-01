import type {
  GenerationJobHandle,
  GenerationJobInput,
  GenerationJobResult,
  VideoGenerationProvider,
} from "@/types/ai-provider";
import { buildTransformationPrompt } from "@/lib/ai/prompt-builder";

const QUEUE_BASE = "https://queue.fal.run";
const ENDPOINT_ID = "fal-ai/kling-video/o1/video-to-video/edit";

function authHeaders() {
  const key = process.env.FAL_API_KEY;
  if (!key) throw new Error("FAL_API_KEY is not set");
  return { Authorization: `Key ${key}`, "Content-Type": "application/json" };
}

interface FalQueueStatus {
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED";
  request_id: string;
  queue_position?: number;
}

interface FalVideoOutput {
  video: { url: string; content_type: string; file_size: number; file_name: string };
}

/**
 * Kling O1 Edit, run via fal.ai's queue API. Verified against the live
 * OpenAPI schema on 2026-08-01: required input { video_url, prompt },
 * optional { keep_audio, image_urls, elements }. Output is
 * { video: { url, ... } }.
 *
 * Source video constraints from the model itself: .mp4/.mov only,
 * 3-10 seconds, 720-2160px resolution, max 200MB.
 */
export const falProvider: VideoGenerationProvider = {
  name: "fal",

  async submitJob(input: GenerationJobInput): Promise<GenerationJobHandle> {
    const url = new URL(`${QUEUE_BASE}/${ENDPOINT_ID}`);
    if (input.webhookUrl) url.searchParams.set("fal_webhook", input.webhookUrl);

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        video_url: input.sourceVideoUrl,
        prompt: buildTransformationPrompt(input.settings),
        keep_audio: false,
      }),
    });

    if (!res.ok) {
      throw new Error(`Fal.ai submit failed: ${res.status} ${await res.text()}`);
    }

    const data: FalQueueStatus = await res.json();
    return { providerJobId: data.request_id, provider: "fal" };
  },

  async getJobStatus(handle: GenerationJobHandle): Promise<GenerationJobResult> {
    const res = await fetch(
      `${QUEUE_BASE}/${ENDPOINT_ID}/requests/${handle.providerJobId}/status`,
      { headers: authHeaders() }
    );

    if (!res.ok) {
      throw new Error(`Fal.ai status failed: ${res.status} ${await res.text()}`);
    }

    const data: FalQueueStatus = await res.json();

    if (data.status !== "COMPLETED") {
      return {
        status: data.status === "IN_QUEUE" ? "queued" : "processing",
        progress: undefined,
      };
    }

    const resultRes = await fetch(
      `${QUEUE_BASE}/${ENDPOINT_ID}/requests/${handle.providerJobId}`,
      { headers: authHeaders() }
    );

    if (!resultRes.ok) {
      return { status: "failed", errorMessage: await resultRes.text() };
    }

    const result: FalVideoOutput = await resultRes.json();

    return {
      status: "completed",
      progress: 100,
      resultVideoUrl: result.video?.url,
    };
  },

  async cancelJob(handle: GenerationJobHandle): Promise<void> {
    await fetch(`${QUEUE_BASE}/${ENDPOINT_ID}/requests/${handle.providerJobId}/cancel`, {
      method: "PUT",
      headers: authHeaders(),
    });
  },
};
