// One-off script: generate the 2 ready-made avatar template reference
// images via fal.ai and upload them to the public "avatar-templates" bucket.
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

const IMPERFECTION_SUFFIX =
  "Candid, unretouched phone-camera snapshot look, not a studio shoot. Real, natural skin with visible pores, faint texture, and very subtle asymmetry in the face — not airbrushed or flawless. A couple of small natural imperfections like a faint freckle or slightly uneven eyebrows. Natural, slightly imperfect hair with a few flyaway strands. Avoid a symmetrical, overly smooth, or synthetic AI-generated look.";

const TEMPLATES = [
  {
    id: "blonde-lifestyle",
    prompt:
      `Candid lifestyle photo of a natural-looking 26 year old blonde woman with soft wavy hair, warm friendly smile, effortless elegant style, French Riviera lifestyle setting. Natural lighting, photorealistic. ${IMPERFECTION_SUFFIX}`,
  },
  {
    id: "brunette-lifestyle",
    prompt:
      `Candid lifestyle photo of a natural-looking 27 year old brunette woman with sleek shoulder-length hair, confident warm expression, chic urban style, Parisian city lifestyle setting. Natural lighting, photorealistic. ${IMPERFECTION_SUFFIX}`,
  },
];

async function generateImage(prompt) {
  // flux/dev (28 inference steps) instead of flux/schnell (fixed at 4):
  // schnell is fast but largely ignores nuanced instructions like "subtle
  // asymmetry" or "natural imperfections" — dev actually follows them.
  const res = await fetch("https://queue.fal.run/fal-ai/flux/dev", {
    method: "POST",
    headers: { Authorization: `Key ${FAL_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      image_size: "portrait_4_3",
      output_format: "jpeg",
      num_images: 1,
      num_inference_steps: 35,
    }),
  });

  if (!res.ok) throw new Error(`Fal submit error: ${res.status} ${await res.text()}`);
  const submitData = await res.json();
  // fal's queue routes status/result under the app's base path ("fal-ai/flux"),
  // not the full submit endpoint id ("fal-ai/flux/schnell") — use the
  // status_url the submit response actually gives us instead of guessing.
  const statusUrl = submitData.status_url;
  const resultUrl = submitData.response_url;

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const statusRes = await fetch(statusUrl, { headers: { Authorization: `Key ${FAL_API_KEY}` } });
    const statusData = await statusRes.json();
    if (statusData.status === "COMPLETED") {
      const resultRes = await fetch(resultUrl, { headers: { Authorization: `Key ${FAL_API_KEY}` } });
      const result = await resultRes.json();
      return result.images[0].url;
    }
  }
  throw new Error("Timed out waiting for image generation.");
}

async function uploadToSupabase(path, bytes) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/avatar-templates/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
      "Content-Type": "image/jpeg",
      "x-upsert": "true",
    },
    body: bytes,
  });
  if (!res.ok) throw new Error(`Supabase upload error: ${res.status} ${await res.text()}`);
}

async function main() {
  const results = {};
  for (const t of TEMPLATES) {
    process.stdout.write(`Generating ${t.id}... `);
    try {
      const imageUrl = await generateImage(t.prompt);
      const imageRes = await fetch(imageUrl);
      const bytes = Buffer.from(await imageRes.arrayBuffer());
      const path = `${t.id}.jpg`;
      await uploadToSupabase(path, bytes);
      results[t.id] = `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/${path}`;
      console.log("OK");
    } catch (err) {
      console.log("FAILED:", err.message);
      results[t.id] = null;
    }
  }
  console.log("\n--- RESULTS ---");
  console.log(JSON.stringify(results, null, 2));
}

main();
