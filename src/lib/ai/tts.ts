const FAL_RUN_BASE = "https://fal.run";
const KOKORO_FRENCH_ENDPOINT = "fal-ai/kokoro/french";

function authHeaders() {
  const key = process.env.FAL_API_KEY;
  if (!key) throw new Error("FAL_API_KEY is not set");
  return { Authorization: `Key ${key}`, "Content-Type": "application/json" };
}

interface KokoroOutput {
  audio: { url: string; content_type: string };
}

/**
 * Generates a French voice-over audio file from text using Kokoro TTS.
 * Uses the synchronous fal.run endpoint (TTS is fast — seconds, not minutes).
 * Returns the raw audio buffer (WAV).
 */
export async function generateFrenchVoiceover(text: string): Promise<Buffer> {
  const res = await fetch(`${FAL_RUN_BASE}/${KOKORO_FRENCH_ENDPOINT}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      text,
      speed: 1.0,
    }),
  });

  if (!res.ok) {
    throw new Error(`Kokoro TTS failed: ${res.status} ${await res.text()}`);
  }

  const data: KokoroOutput = await res.json();
  if (!data.audio?.url) {
    throw new Error("Kokoro TTS returned no audio URL.");
  }

  const audioRes = await fetch(data.audio.url);
  if (!audioRes.ok) {
    throw new Error(`Failed to download TTS audio: ${audioRes.status}`);
  }

  return Buffer.from(await audioRes.arrayBuffer());
}
