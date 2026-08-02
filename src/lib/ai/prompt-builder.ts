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

/**
 * Builds a single natural-language prompt for the AI video edit model.
 * Kling O1 Edit reads best as fluent English, not a list of labeled
 * fields — and definitely not a mix of English structure with French UI
 * option values, which used to happen here and visibly hurt output quality.
 */
export function buildTransformationPrompt(settings: TransformationSettings): string {
  const persona = getPersonaById(settings.persona);

  const traits = [
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
  ].filter(Boolean);

  const qualityEmphasis =
    settings.quality === "ultra"
      ? "Render in the highest possible fidelity, with crisp fine detail and no artifacts."
      : settings.quality === "high"
        ? "Render with strong fidelity and clean detail."
        : "";

  const scene = persona
    ? `Turn the person in this video into ${persona.promptDescription}`
    : "Restyle the person in this video";

  const traitClause = traits.length > 0 ? `, with ${traits.join(", ")}` : "";

  return [
    `${scene}${traitClause}.`,
    "Keep their face and identity fully recognizable and unchanged — only their styling, outfit, environment, and mood should shift.",
    "The motion, timing, and camera work from the original clip should stay natural and unaltered.",
    "Preserve real, natural skin texture with visible pores and fine detail, and natural individual hair strands with realistic flyaways — avoid smoothed, airbrushed, plastic, or waxy skin, and avoid a synthetic CGI or video-game look.",
    "Shot on a real camera, photorealistic, cinematic quality, no visible AI artifacts.",
    qualityEmphasis,
  ]
    .filter(Boolean)
    .join(" ");
}
