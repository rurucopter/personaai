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

// Stronger version for the "ordinary person" avatars: explicitly steers
// away from model-like/conventionally-attractive output, which is exactly
// what reads as synthetic. Real photos of real people are rarely that.
const ORDINARY_PERSON_SUFFIX =
  "This is an ordinary, average-looking real person, not a model or influencer — plain, unremarkable, everyday features. Candid unretouched phone snapshot, bad indoor lighting is fine, slightly imperfect framing. Real skin texture with visible pores, blemishes, uneven tone, redness, or blotchiness. Natural facial asymmetry, imperfect teeth alignment, tired or plain expression is fine — do not make this person look conventionally attractive, glamorous, or like a professional model. Avoid symmetry, smoothness, or any polished/synthetic AI look.";

// For original, non-photorealistic "character" avatars (e.g. the talking
// fruit trend) — humanoid body with a stylized fruit-shaped head, in the
// vein of the popular "fruit people" AI-video genre. Explicitly steers
// toward a generic, original design so we never reproduce an existing
// copyrighted/trademarked character or a specific creator's series.
const FRUIT_PERSON_SUFFIX =
  "Full human body with elegant, graceful proportions, wearing a stylish, modest satin dress. Cozy warm indoor home setting with soft golden lighting. Polished 3D animated movie render, Pixar/Disney-style character design, glamorous but wholesome. Completely original character design, not based on any existing movie, show, game, franchise, or online creator's series.";

const TEMPLATES = [
  {
    id: "talking-banana",
    prompt:
      `An original 3D animated humanoid character with a stylized banana-shaped head (elegant cartoon face, big expressive eyes with lashes, warm smile) atop a normal human body, bright yellow head color. ${FRUIT_PERSON_SUFFIX}`,
  },
  {
    id: "talking-strawberry",
    prompt:
      `An original 3D animated humanoid character with a stylized strawberry-shaped head (elegant cartoon face, big expressive eyes with lashes, warm smile, small green leaf tuft on top) atop a normal human body, bright red head color with small seed dots. ${FRUIT_PERSON_SUFFIX}`,
  },
  {
    id: "talking-watermelon",
    prompt:
      `An original 3D animated humanoid character with a stylized watermelon-shaped head (elegant cartoon face, big expressive eyes with lashes, wide happy smile) atop a normal human body, bright pink and green head color with small black seeds. ${FRUIT_PERSON_SUFFIX}`,
  },
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
  {
    id: "curly-everyday",
    prompt:
      `Casual phone selfie of a 34 year old woman with curly chestnut mid-length hair, no makeup, ordinary everyday appearance, plain indoor or outdoor background, photorealistic. ${ORDINARY_PERSON_SUFFIX}`,
  },
  {
    id: "round-face-casual",
    prompt:
      `Casual phone selfie of a 41 year old woman with straight chestnut mid-length hair, round face, slightly crooked smile, visible expression lines, simple everyday clothing, photorealistic. ${ORDINARY_PERSON_SUFFIX}`,
  },
  {
    id: "redhead-freckles",
    prompt:
      `Casual phone selfie of a 23 year old redhead woman with slightly messy mid-length hair, heavy freckles across the face, slightly uneven teeth, no makeup, student-casual style, photorealistic. ${ORDINARY_PERSON_SUFFIX}`,
  },
  {
    id: "short-hair-natural",
    prompt:
      `Casual phone selfie of a 29 year old woman with short straight black hair, tan skin, relaxed neutral expression, plain casual clothing, photorealistic. ${ORDINARY_PERSON_SUFFIX}`,
  },
  {
    id: "student-young-man",
    prompt:
      `Casual phone selfie of a 19 year old young man with messy brown hair, light acne on the cheeks, faint patchy stubble, plain hoodie, student look, photorealistic. ${ORDINARY_PERSON_SUFFIX}`,
  },
  {
    id: "blond-stubble-man",
    prompt:
      `Casual phone selfie of a 24 year old man with short blond hair, three-day stubble, plain t-shirt, ordinary everyday appearance, photorealistic. ${ORDINARY_PERSON_SUFFIX}`,
  },
  {
    id: "asian-glasses-man",
    prompt:
      `Casual phone selfie of a 28 year old East Asian man with short black hair and simple glasses, neutral expression, plain shirt, everyday office-casual look, photorealistic. ${ORDINARY_PERSON_SUFFIX}`,
  },
  {
    id: "beard-casual-man",
    prompt:
      `Casual phone selfie of a 35 year old North African man with a short dark beard and short black hair, relaxed everyday appearance, plain casual clothing, photorealistic. ${ORDINARY_PERSON_SUFFIX}`,
  },
  {
    id: "balding-dad",
    prompt:
      `Casual phone selfie of a 43 year old man with a receding hairline, slight double chin, tired friendly expression, plain polo shirt, ordinary dad look, photorealistic. ${ORDINARY_PERSON_SUFFIX}`,
  },
  {
    id: "greying-mature-man",
    prompt:
      `Casual phone photo of a 52 year old man with salt-and-pepper hair, visible forehead and eye wrinkles, plain button shirt, ordinary mature appearance, photorealistic. ${ORDINARY_PERSON_SUFFIX}`,
  },
  {
    id: "senior-black-man",
    prompt:
      `Casual phone photo of a 60 year old Black man with short greying hair and a short grey beard, warm plain expression, simple clothing, photorealistic. ${ORDINARY_PERSON_SUFFIX}`,
  },
  {
    id: "elderly-man",
    prompt:
      `Casual phone photo of a 70 year old elderly man with thin white hair, glasses, deep wrinkles and age spots, gentle plain expression, simple cardigan, photorealistic. ${ORDINARY_PERSON_SUFFIX}`,
  },
  {
    id: "teen-braces-woman",
    prompt:
      `Casual phone selfie of a 19 year old young woman with long straight hair, dental braces, minimal makeup, plain t-shirt, ordinary student look, photorealistic. ${ORDINARY_PERSON_SUFFIX}`,
  },
  {
    id: "asian-fringe-woman",
    prompt:
      `Casual phone selfie of a 26 year old East Asian woman with black hair and a straight fringe, no makeup, plain sweater, ordinary everyday appearance, photorealistic. ${ORDINARY_PERSON_SUFFIX}`,
  },
  {
    id: "afro-natural-woman",
    prompt:
      `Casual phone selfie of a 31 year old Black woman with natural afro-textured hair, no makeup, plain top, ordinary everyday appearance, photorealistic. ${ORDINARY_PERSON_SUFFIX}`,
  },
  {
    id: "midlife-woman",
    prompt:
      `Casual phone photo of a 48 year old woman with dyed mid-length hair showing some grey roots, visible expression lines, plain blouse, ordinary appearance, photorealistic. ${ORDINARY_PERSON_SUFFIX}`,
  },
  {
    id: "short-grey-woman",
    prompt:
      `Casual phone photo of a 56 year old woman with short grey hair and glasses, soft wrinkles, plain cardigan, ordinary mature appearance, photorealistic. ${ORDINARY_PERSON_SUFFIX}`,
  },
  {
    id: "senior-woman",
    prompt:
      `Casual phone photo of a 64 year old woman with short curly white hair, warm wrinkled face, simple clothing, ordinary grandmother appearance, photorealistic. ${ORDINARY_PERSON_SUFFIX}`,
  },
  {
    id: "elderly-woman",
    prompt:
      `Casual phone photo of a 73 year old elderly woman with thin white hair, deep wrinkles and age spots, gentle plain expression, simple blouse, photorealistic. ${ORDINARY_PERSON_SUFFIX}`,
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

// Idempotent: skip templates whose image already exists in the bucket, so
// re-runs only fill in newly-added avatars and never regenerate (and change)
// the ones existing characters already reference. Pass FORCE=1 to override.
async function alreadyExists(id) {
  if (process.env.FORCE === "1") return false;
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/${id}.jpg`,
    { method: "HEAD" }
  );
  return res.ok;
}

async function main() {
  const results = {};
  for (const t of TEMPLATES) {
    if (await alreadyExists(t.id)) {
      console.log(`Skipping ${t.id} (already exists)`);
      continue;
    }
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
