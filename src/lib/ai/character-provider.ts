const QUEUE_BASE = "https://queue.fal.run";
const REFERENCE_ENDPOINT = "fal-ai/flux/schnell";
const CONSISTENT_IMAGE_ENDPOINT = "fal-ai/instant-character";

function authHeaders() {
  const key = process.env.FAL_API_KEY;
  if (!key) throw new Error("FAL_API_KEY is not set");
  return { Authorization: `Key ${key}`, "Content-Type": "application/json" };
}

async function submitFalJob(
  endpointId: string,
  input: Record<string, unknown>,
  webhookUrl?: string
): Promise<string> {
  const url = new URL(`${QUEUE_BASE}/${endpointId}`);
  if (webhookUrl) url.searchParams.set("fal_webhook", webhookUrl);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(`Fal.ai submit failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.request_id;
}

/**
 * Generates the fixed reference portrait a fictional character will be
 * kept consistent with across every later image (fal-ai/flux/schnell,
 * verified schema).
 */
export async function submitMasterReference(
  description: string,
  webhookUrl?: string
): Promise<string> {
  const prompt = `Professional lifestyle portrait photo of ${description}. Natural lighting, photorealistic, high detail, editorial photography style.`;

  return submitFalJob(
    REFERENCE_ENDPOINT,
    { prompt, image_size: "portrait_4_3", output_format: "jpeg", num_images: 1 },
    webhookUrl
  );
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
  return submitFalJob(
    CONSISTENT_IMAGE_ENDPOINT,
    { image_url: referenceImageUrl, prompt: scenePrompt, image_size: "portrait_4_3", output_format: "jpeg" },
    webhookUrl
  );
}
