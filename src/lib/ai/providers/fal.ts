import type {
  GenerationJobHandle,
  GenerationJobInput,
  GenerationJobResult,
  VideoGenerationProvider,
} from "@/types/ai-provider";

const QUEUE_BASE = "https://queue.fal.run";
const SUBMIT_ENDPOINT_ID = "fal-ai/kling-video/o1/video-to-video/edit";
// Kling V2.6 Pro text-to-video — supports native audio/dialogue generation,
// which is what makes a "talking fruit" video actually talk. Verified
// against fal's live API docs on 2026-09-03.
const TEXT_TO_VIDEO_ENDPOINT_ID = "fal-ai/kling-video/v2.6/pro/text-to-video";
// Same model family, but seeded with a user's uploaded photo as the first
// frame — used when the story flow includes a photo of themselves. Verified
// against fal's live API docs on 2026-09-03.
const IMAGE_TO_VIDEO_ENDPOINT_ID = "fal-ai/kling-video/v2.6/pro/image-to-video";
// Fal's queue routes status/result/cancel under the app's base path, not the
// full submit endpoint — confirmed against the live API on 2026-08-01
// (GET .../kling-video/o1/video-to-video/edit/requests/{id}/status returns
// 405; GET .../kling-video/requests/{id}/status is the one that works). Both
// submit endpoints above share this same app base.
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
 * Kling, run via fal.ai's queue API. Spans two models depending on whether
 * a source video is supplied: with one, Kling O1 Edit does video-to-video
 * restyling; without one, Kling V2.6 Pro generates a video from text alone
 * (with native audio/dialogue). Verified against the live API docs on
 * 2026-08-01 (O1 Edit) and 2026-09-03 (V2.6 Pro text-to-video).
 * Output is { video: { url, ... } } for both.
 *
 * Source video constraints from the model itself: .mp4/.mov only,
 * 3-10 seconds, 720-2160px resolution, max 200MB.
 */
export const falProvider: VideoGenerationProvider = {
  name: "fal",

  async submitJob(input: GenerationJobInput): Promise<GenerationJobHandle> {
    if (!input.sourceVideoUrl && input.startImageUrl) {
      const url = new URL(`${QUEUE_BASE}/${IMAGE_TO_VIDEO_ENDPOINT_ID}`);
      if (input.webhookUrl) url.searchParams.set("fal_webhook", input.webhookUrl);

      const res = await fetch(url.toString(), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          prompt: input.prompt,
          start_image_url: input.startImageUrl,
          duration: input.durationSeconds === 10 ? "10" : "5",
          generate_audio: true,
        }),
      });

      if (!res.ok) {
        throw new Error(`Fal.ai submit failed: ${res.status} ${await res.text()}`);
      }

      const data: FalQueueStatus = await res.json();
      return { providerJobId: data.request_id, provider: "fal" };
    }

    if (!input.sourceVideoUrl) {
      const url = new URL(`${QUEUE_BASE}/${TEXT_TO_VIDEO_ENDPOINT_ID}`);
      if (input.webhookUrl) url.searchParams.set("fal_webhook", input.webhookUrl);

      const res = await fetch(url.toString(), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          prompt: input.prompt,
          duration: input.durationSeconds === 10 ? "10" : "5",
          aspect_ratio: input.aspectRatio ?? "9:16",
          generate_audio: true,
        }),
      });

      if (!res.ok) {
        throw new Error(`Fal.ai submit failed: ${res.status} ${await res.text()}`);
      }

      const data: FalQueueStatus = await res.json();
      return { providerJobId: data.request_id, provider: "fal" };
    }

    const url = new URL(`${QUEUE_BASE}/${SUBMIT_ENDPOINT_ID}`);
    if (input.webhookUrl) url.searchParams.set("fal_webhook", input.webhookUrl);

    let prompt = input.prompt;
    let extra: Record<string, unknown> = {};

    if (input.referenceImageUrl && input.referenceMode === "become") {
      // "elements" defines an actual character (frontal + reference views)
      // for the model to place in the scene — a much stronger identity
      // lock than the generic style reference below, and the right tool
      // for "replace this person with a specific character".
      prompt += " @Element1 is the exact character to place in the video.";
      extra = {
        elements: [
          {
            frontal_image_url: input.referenceImageUrl,
            reference_image_urls: [input.referenceImageUrl],
          },
        ],
      };
    } else if (input.referenceImageUrl) {
      prompt += " Use @Image1 as the exact reference for the face shown.";
      extra = { image_urls: [input.referenceImageUrl] };
    }

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        video_url: input.sourceVideoUrl,
        prompt,
        keep_audio: false,
        ...extra,
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
