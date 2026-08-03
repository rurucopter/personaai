const QUEUE_BASE = "https://queue.fal.run";
const CONSISTENT_IMAGE_ENDPOINT = "fal-ai/instant-character";

function authHeaders() {
  const key = process.env.FAL_API_KEY;
  if (!key) throw new Error("FAL_API_KEY is not set");
  return { Authorization: `Key ${key}`, "Content-Type": "application/json" };
}

interface FalQueueStatus {
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED";
  request_id: string;
}

interface FalImageOutput {
  images?: Array<{ url: string }>;
  detail?: Array<{ msg: string }>;
}

export interface CharacterImageJobResult {
  status: "queued" | "processing" | "completed" | "failed";
  imageUrl?: string;
  errorMessage?: string;
}

/**
 * Generates a new image reusing the character's reference face
 * (fal-ai/instant-character, verified schema: required image_url + prompt).
 */
export async function submitCharacterImage(
  referenceImageUrl: string,
  scenePrompt: string,
  webhookUrl?: string
): Promise<string> {
  const url = new URL(`${QUEUE_BASE}/${CONSISTENT_IMAGE_ENDPOINT}`);
  if (webhookUrl?.startsWith("https://")) url.searchParams.set("fal_webhook", webhookUrl);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      image_url: referenceImageUrl,
      prompt: scenePrompt,
      image_size: "portrait_4_3",
      output_format: "jpeg",
    }),
  });

  if (!res.ok) {
    throw new Error(`Fal.ai submit failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.request_id;
}

/**
 * Polling fallback for local dev, where fal's webhook can't reach
 * localhost — mirrors the same pattern used for video generation.
 */
export async function getCharacterImageJobStatus(
  requestId: string
): Promise<CharacterImageJobResult> {
  const res = await fetch(`${QUEUE_BASE}/${CONSISTENT_IMAGE_ENDPOINT}/requests/${requestId}/status`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Fal.ai status failed: ${res.status} ${await res.text()}`);
  }

  const data: FalQueueStatus = await res.json();

  if (data.status !== "COMPLETED") {
    return { status: data.status === "IN_QUEUE" ? "queued" : "processing" };
  }

  const resultRes = await fetch(`${QUEUE_BASE}/${CONSISTENT_IMAGE_ENDPOINT}/requests/${requestId}`, {
    headers: authHeaders(),
  });
  const result: FalImageOutput = await resultRes.json();

  if (!resultRes.ok || !result.images?.[0]?.url) {
    const errorMessage =
      result.detail?.map((d) => d.msg).join(" ") ??
      (!resultRes.ok ? `${resultRes.status} error` : "Aucune image produite.");
    return { status: "failed", errorMessage };
  }

  return { status: "completed", imageUrl: result.images[0].url };
}
