// One-off script: generate a style reference image per persona via
// Replicate's flux-schnell, then upload it to the public
// "persona-references" Supabase Storage bucket.
//
// Usage: node scripts/generate-persona-references.mjs
// Requires REPLICATE_API_TOKEN, NEXT_PUBLIC_SUPABASE_URL,
// SUPABASE_SERVICE_ROLE_KEY in the environment (loaded from .env.local).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  const envPath = join(__dirname, "..", ".env.local");
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const FAL_API_KEY = process.env.FAL_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!FAL_API_KEY || !SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing required env vars.");
  process.exit(1);
}

const PERSONAS = [
  { id: "ceo", label: "CEO", prompt: "professional studio portrait photo of a confident business executive in an impeccable dark suit, corporate office background, soft studio lighting, photorealistic, 85mm lens" },
  { id: "entrepreneur", label: "Entrepreneur", prompt: "professional portrait photo of a modern energetic entrepreneur in smart casual attire, bright modern startup office, natural light, photorealistic" },
  { id: "influenceur", label: "Influenceur", prompt: "professional portrait photo of a stylish social media influencer, trendy fashionable outfit, clean minimal background, soft ring light, photorealistic" },
  { id: "commercial", label: "Commercial", prompt: "professional portrait photo of a confident salesperson in business attire, modern office, natural lighting, photorealistic" },
  { id: "conferencier", label: "Conférencier", prompt: "professional portrait photo of a charismatic public speaker on a conference stage, dramatic stage lighting, photorealistic" },
  { id: "coach", label: "Coach", prompt: "professional portrait photo of a warm approachable life coach, cozy well-lit room, friendly expression, photorealistic" },
  { id: "athlete", label: "Athlète", prompt: "professional portrait photo of an athletic person in sportswear, gym or stadium background, dynamic lighting, photorealistic" },
  { id: "acteur", label: "Acteur", prompt: "cinematic portrait photo of an actor with expressive presence, dramatic film lighting, shallow depth of field, photorealistic" },
  { id: "streamer", label: "Streamer", prompt: "professional portrait photo of a casual gaming streamer, RGB lit gaming room background, photorealistic" },
  { id: "createur-youtube", label: "Créateur YouTube", prompt: "professional portrait photo of an expressive YouTube content creator, bright colorful studio background, photorealistic" },
  { id: "business-luxe", label: "Business Luxe", prompt: "professional portrait photo of a person in luxurious high-end business attire, elegant upscale interior, photorealistic" },
  { id: "old-money", label: "Old Money", prompt: "professional portrait photo of a person in classic timeless old-money style clothing, refined estate interior, soft natural light, photorealistic" },
  { id: "cyberpunk", label: "Cyberpunk", prompt: "cinematic portrait photo of a person in cyberpunk streetwear, neon-lit futuristic city background, moody colorful lighting, photorealistic" },
  { id: "anime", label: "Anime", prompt: "vibrant anime style illustrated portrait of a person, japanese animation art style, colorful" },
  { id: "viking", label: "Viking", prompt: "cinematic portrait photo of a person as a nordic viking warrior, fur and leather armor, rugged outdoor background, dramatic lighting, photorealistic" },
  { id: "chevalier", label: "Chevalier", prompt: "cinematic portrait photo of a person as a medieval knight in polished armor, castle background, dramatic lighting, photorealistic" },
  { id: "samourai", label: "Samouraï", prompt: "cinematic portrait photo of a person as a traditional japanese samurai warrior, traditional armor, moody background, photorealistic" },
  { id: "science-fiction", label: "Science-fiction", prompt: "cinematic portrait photo of a person in futuristic sci-fi attire, spaceship interior background, dramatic lighting, photorealistic" },
  { id: "film-hollywood", label: "Film Hollywood", prompt: "cinematic hollywood movie poster style portrait photo of a person, dramatic cinema lighting, photorealistic" },
  { id: "documentaire-netflix", label: "Documentaire Netflix", prompt: "documentary style portrait photo of a person, natural muted tones, realistic interview lighting, photorealistic" },
];

async function generateImage(prompt) {
  const res = await fetch("https://queue.fal.run/fal-ai/flux/schnell", {
    method: "POST",
    headers: {
      Authorization: `Key ${FAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      image_size: "portrait_4_3",
      output_format: "jpeg",
      num_images: 1,
    }),
  });

  if (!res.ok) {
    throw new Error(`Fal submit error: ${res.status} ${await res.text()}`);
  }

  const { request_id } = await res.json();

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const statusRes = await fetch(
      `https://queue.fal.run/fal-ai/flux/schnell/requests/${request_id}/status`,
      { headers: { Authorization: `Key ${FAL_API_KEY}` } }
    );
    const statusData = await statusRes.json();
    if (statusData.status === "COMPLETED") {
      const resultRes = await fetch(
        `https://queue.fal.run/fal-ai/flux/schnell/requests/${request_id}`,
        { headers: { Authorization: `Key ${FAL_API_KEY}` } }
      );
      const result = await resultRes.json();
      return result.images[0].url;
    }
  }

  throw new Error("Timed out waiting for image generation.");
}

async function uploadToSupabase(path, bytes) {
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/persona-references/${path}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        apikey: SERVICE_ROLE_KEY,
        "Content-Type": "image/jpeg",
        "x-upsert": "true",
      },
      body: bytes,
    }
  );

  if (!res.ok) {
    throw new Error(`Supabase upload error: ${res.status} ${await res.text()}`);
  }
}

async function main() {
  const results = {};

  for (const persona of PERSONAS) {
    process.stdout.write(`Generating ${persona.id}... `);
    try {
      const imageUrl = await generateImage(persona.prompt);
      const imageRes = await fetch(imageUrl);
      const bytes = Buffer.from(await imageRes.arrayBuffer());
      const path = `${persona.id}.jpg`;
      await uploadToSupabase(path, bytes);
      results[persona.id] = `${SUPABASE_URL}/storage/v1/object/public/persona-references/${path}`;
      console.log("OK");
    } catch (err) {
      console.log("FAILED:", err.message);
      results[persona.id] = null;
    }
  }

  console.log("\n--- RESULTS ---");
  console.log(JSON.stringify(results, null, 2));
}

main();
