import type {
  GenerationJobHandle,
  GenerationJobInput,
  GenerationJobResult,
  VideoGenerationProvider,
} from "@/types/ai-provider";

const FAL_API_BASE = "https://queue.fal.run";
const FAL_MODEL_ENDPOINT = process.env.FAL_MODEL_ENDPOINT ?? "fal-ai/video-to-video-style-transfer";

function authHeaders() {
  const key = process.env.FAL_API_KEY;
  if (!key) throw new Error("FAL_API_KEY is not set");
  return { Authorization: `Key ${key}`, "Content-Type": "application/json" };
}

export const falProvider: VideoGenerationProvider = {
  name: "fal",

  async submitJob(input: GenerationJobInput): Promise<GenerationJobHandle> {
    const res = await fetch(`${FAL_API_BASE}/${FAL_MODEL_ENDPOINT}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        video_url: input.sourceVideoUrl,
        persona: input.settings.persona,
        outfit_style: input.settings.outfitStyle,
        hair_style: input.settings.hairStyle,
        color_palette: input.settings.colorPalette,
        background: input.settings.background,
        lighting: input.settings.lighting,
        expression: input.settings.expression,
        energy_level: input.settings.energyLevel,
        smile_level: input.settings.smileLevel,
        posture: input.settings.posture,
        camera_angle: input.settings.cameraAngle,
        quality: input.settings.quality,
        duration_seconds: input.settings.durationSeconds,
        webhook_url: input.webhookUrl,
      }),
    });

    if (!res.ok) {
      throw new Error(`Fal.ai submit failed: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    return { providerJobId: data.request_id, provider: "fal" };
  },

  async getJobStatus(handle: GenerationJobHandle): Promise<GenerationJobResult> {
    const res = await fetch(
      `${FAL_API_BASE}/${FAL_MODEL_ENDPOINT}/requests/${handle.providerJobId}/status`,
      { headers: authHeaders() }
    );

    if (!res.ok) {
      throw new Error(`Fal.ai status failed: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();

    const statusMap: Record<string, GenerationJobResult["status"]> = {
      IN_QUEUE: "queued",
      IN_PROGRESS: "processing",
      COMPLETED: "completed",
    };

    if (data.status !== "COMPLETED") {
      return {
        status: statusMap[data.status] ?? "processing",
        progress: data.progress,
        estimatedSecondsRemaining: data.eta_seconds,
      };
    }

    const resultRes = await fetch(
      `${FAL_API_BASE}/${FAL_MODEL_ENDPOINT}/requests/${handle.providerJobId}`,
      { headers: authHeaders() }
    );
    const result = await resultRes.json();

    return {
      status: "completed",
      progress: 100,
      resultVideoUrl: result.video?.url,
      thumbnailUrl: result.thumbnail?.url,
    };
  },

  async cancelJob(handle: GenerationJobHandle): Promise<void> {
    await fetch(
      `${FAL_API_BASE}/${FAL_MODEL_ENDPOINT}/requests/${handle.providerJobId}/cancel`,
      { method: "PUT", headers: authHeaders() }
    );
  },
};
