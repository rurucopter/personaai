// One-off script: generate example imagery for the marketing homepage,
// showcasing the two styles the app now offers (Pixar-3D restyle and
// talking-fruit avatars). Saved as static files under public/marketing so
// the homepage doesn't depend on a Supabase round trip.
import { writeFileSync, readFileSync, existsSync } from "node:fs";
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
const OUT_DIR = join(__dirname, "..", "public", "marketing");

const IMAGES = [
  {
    id: "pixar-hero",
    prompt:
      "A cheerful young woman restyled as a high-quality 3D animated character in a warm modern Pixar/Disney-style CG movie look, close-up portrait, big expressive eyes, smooth semi-realistic skin shading, soft warm cinematic lighting, cozy home background, polished 3D render, completely original character design not based on any existing movie or franchise character.",
  },
  {
    id: "pixar-hero-2",
    prompt:
      "A confident young man restyled as a high-quality 3D animated character in a warm modern Pixar/Disney-style CG movie look, close-up portrait, big expressive eyes, smooth semi-realistic skin shading, soft warm cinematic lighting, cozy home background, polished 3D render, completely original character design not based on any existing movie or franchise character.",
  },
];

async function generateImage(prompt) {
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

async function main() {
  for (const img of IMAGES) {
    const outPath = join(OUT_DIR, `${img.id}.jpg`);
    if (existsSync(outPath) && process.env.FORCE !== "1") {
      console.log(`Skipping ${img.id} (already exists)`);
      continue;
    }
    process.stdout.write(`Generating ${img.id}... `);
    try {
      const imageUrl = await generateImage(img.prompt);
      const imageRes = await fetch(imageUrl);
      const bytes = Buffer.from(await imageRes.arrayBuffer());
      writeFileSync(outPath, bytes);
      console.log("OK");
    } catch (err) {
      console.log("FAILED:", err.message);
    }
  }
}

main();
