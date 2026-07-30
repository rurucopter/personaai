import { getPersonaById } from "@/lib/personas";
import type { TransformationSettings } from "@/types/ai-provider";

/**
 * Builds a single descriptive prompt from the persona + style settings.
 * Video-to-video models like Aleph take one free-text instruction rather
 * than structured fields, so every wizard choice gets folded in here.
 */
export function buildTransformationPrompt(settings: TransformationSettings): string {
  const persona = getPersonaById(settings.persona);
  const parts: string[] = [];

  parts.push(
    persona
      ? `Transform the person in this video into a ${persona.label}: ${persona.description}`
      : "Transform the person in this video."
  );
  parts.push(
    "Keep the same person, face, and identity fully recognizable — only change their styling, outfit, environment, and mood."
  );

  if (settings.outfitStyle) parts.push(`Outfit: ${settings.outfitStyle}.`);
  if (settings.hairStyle) parts.push(`Hair: ${settings.hairStyle}.`);
  if (settings.colorPalette) parts.push(`Color palette: ${settings.colorPalette}.`);
  if (settings.background) parts.push(`Background: ${settings.background}.`);
  if (settings.lighting) parts.push(`Lighting: ${settings.lighting}.`);
  if (settings.expression) parts.push(`Facial expression: ${settings.expression}.`);
  if (settings.posture) parts.push(`Posture: ${settings.posture}.`);
  if (settings.cameraAngle) parts.push(`Camera angle: ${settings.cameraAngle}.`);
  if (typeof settings.energyLevel === "number") {
    parts.push(`Energy level: ${settings.energyLevel}/100.`);
  }
  if (typeof settings.smileLevel === "number") {
    parts.push(`Smile intensity: ${settings.smileLevel}/100.`);
  }

  parts.push("Photorealistic, highly detailed, natural motion.");

  return parts.join(" ");
}
