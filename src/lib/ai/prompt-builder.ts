import { getPersonaById } from "@/lib/personas";
import {
  BACKGROUND_EN,
  CAMERA_ANGLE_EN,
  COLOR_PALETTE_EN,
  EXPRESSION_EN,
  HAIR_STYLE_EN,
  LIGHTING_EN,
  OUTFIT_STYLE_EN,
  POSTURE_EN,
  translateOption,
} from "@/lib/ai/option-translations";
import type { TransformationSettings } from "@/types/ai-provider";

function levelToPhrase(level: number | undefined, low: string, mid: string, high: string): string | undefined {
  if (typeof level !== "number") return undefined;
  if (level < 33) return low;
  if (level < 66) return mid;
  return high;
}

function buildTraits(settings: Omit<TransformationSettings, "persona">): string[] {
  return [
    translateOption(OUTFIT_STYLE_EN, settings.outfitStyle),
    translateOption(HAIR_STYLE_EN, settings.hairStyle),
    translateOption(COLOR_PALETTE_EN, settings.colorPalette),
    translateOption(BACKGROUND_EN, settings.background),
    translateOption(LIGHTING_EN, settings.lighting),
    translateOption(EXPRESSION_EN, settings.expression),
    translateOption(POSTURE_EN, settings.posture),
    translateOption(CAMERA_ANGLE_EN, settings.cameraAngle),
    levelToPhrase(settings.energyLevel, "calm, low-key energy", "steady, natural energy", "high, vibrant energy"),
    levelToPhrase(settings.smileLevel, "a subtle, reserved smile", "a natural, easy smile", "a bright, warm smile"),
  ].filter((t): t is string => Boolean(t));
}

function qualityEmphasis(settings: Omit<TransformationSettings, "persona">): string {
  return settings.quality === "ultra"
    ? "Render in the highest possible fidelity, with crisp fine detail and no artifacts."
    : settings.quality === "high"
      ? "Render with strong fidelity and clean detail."
      : "";
}

const REALISM_FOOTER = [
  "The motion, timing, and camera work from the original clip should stay natural and unaltered — no warping, morphing, flickering, or facial features drifting between frames.",
  "Preserve real, natural skin texture with visible pores and fine detail, and natural individual hair strands with realistic flyaways — avoid smoothed, airbrushed, plastic, or waxy skin, and avoid a synthetic CGI or video-game look.",
  "Shot on a real camera with a real lens: natural imperfections, realistic depth of field, true-to-life color, and grounded real-world lighting that matches the environment — not an obviously AI-generated or uncanny-valley look.",
];

/**
 * Builds a single natural-language prompt for the AI video edit model.
 * Kling O1 Edit reads best as fluent English, not a list of labeled
 * fields — and definitely not a mix of English structure with French UI
 * option values, which used to happen here and visibly hurt output quality.
 */
export function buildTransformationPrompt(settings: TransformationSettings): string {
  const persona = getPersonaById(settings.persona);
  const traits = buildTraits(settings);

  const scene = persona
    ? `Turn the person in this video into ${persona.promptDescription}`
    : "Restyle the person in this video";
  const traitClause = traits.length > 0 ? `, with ${traits.join(", ")}` : "";

  return [
    `${scene}${traitClause}.`,
    "Keep their face and identity fully recognizable and unchanged — only their styling, outfit, environment, and mood should shift.",
    ...REALISM_FOOTER,
    qualityEmphasis(settings),
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Builds a prompt that replaces the person in the video with a fictional
 * AI character instead of just restyling them — used when the user picks
 * one of their AI avatars as the "persona" for a video transformation.
 * Provider-agnostic: it describes WHO to become in plain language. Each
 * adapter appends its own reference-image syntax (e.g. Kling's "@Element1")
 * on top, since that syntax differs per provider and some (Aleph) don't
 * use named references at all.
 */
export function buildCharacterTransformationPrompt(
  characterDescription: string,
  settings: Omit<TransformationSettings, "persona">
): string {
  const traits = buildTraits(settings);
  const traitClause = traits.length > 0 ? ` Give them ${traits.join(", ")}.` : "";

  return [
    `Replace the person in this video with a specific character: ${characterDescription}.`,
    "Match that character's exact face and identity throughout the video — every frame should clearly be the same specific person, not just someone in a similar style.",
    `${traitClause}`,
    ...REALISM_FOOTER,
    qualityEmphasis(settings),
  ]
    .filter(Boolean)
    .join(" ");
}
