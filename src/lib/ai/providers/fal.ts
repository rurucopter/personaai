import type {
  GenerationJobHandle,
  GenerationJobInput,
  GenerationJobResult,
  VideoGenerationProvider,
} from "@/types/ai-provider";
import { buildTransformationPrompt } from "@/lib/ai/prompt-builder";

const QUEUE_BASE = "https://queue.fal.run";
const SUBMIT_ENDPOINT_ID = "fal-ai/kling-video/o1/video-to-video/edit";
// Fal's queue routes status/result/cancel under the app's base path, not the
// full submit endpoint — confirmed against the live API on 2026-08-01
// (GET .../kling-video/o1/video-to-video/edit/requests/{id}/status returns
// 405; GET .../kling-video/requests/{id}/status is the one that works).
const QUEUE_APP_BASE = "fal-ai/kling-video";

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
  video?: { url: string; content_type: string; file_size: number; file_name: string };
  detail?: Array<{ msg: string }>;
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
    const url = new URL(`${QUEUE_BASE}/${SUBMIT_ENDPOINT_ID}`);
    if (input.webhookUrl) url.searchParams.set("fal_webhook", input.webhookUrl);

    let prompt = buildTransformationPrompt(input.settings);
    if (input.referenceImageUrl) {
      prompt += " Use @Image1 as the exact reference for the person's face and identity.";
    }

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        video_url: input.sourceVideoUrl,
        prompt,
        keep_audio: false,
        ...(input.referenceImageUrl ? { image_urls: [input.referenceImageUrl] } : {}),
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
      `${QUEUE_BASE}/${QUEUE_APP_BASE}/requests/${handle.providerJobId}/status`,
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
      `${QUEUE_BASE}/${QUEUE_APP_BASE}/requests/${handle.providerJobId}`,
      { headers: authHeaders() }
    );

    const result: FalVideoOutput = await resultRes.json();

    if (!resultRes.ok || !result.video?.url) {
      const errorMessage =
        result.detail?.map((d) => d.msg).join(" ") ??
        (!resultRes.ok ? `${resultRes.status} error` : "Aucune vidéo produite.");
      return { status: "failed", errorMessage };
    }

    return {
      status: "completed",
      progress: 100,
      resultVideoUrl: result.video.url,
    };
  },

  async cancelJob(handle: GenerationJobHandle): Promise<void> {
    await fetch(`${QUEUE_BASE}/${QUEUE_APP_BASE}/requests/${handle.providerJobId}/cancel`, {
      method: "PUT",
      headers: authHeaders(),
    });
  },
};
