/**
 * The wizard's option labels are French (UI-facing). AI prompts read best
 * in English, so this maps each French label to natural English prompt
 * language instead of feeding the model mixed-language text.
 */
export const OUTFIT_STYLE_EN: Record<string, string> = {
  Costume: "a sharp tailored suit",
  Streetwear: "trendy streetwear",
  "Décontracté": "relaxed casual clothing",
  Armure: "detailed armor",
  Traditionnel: "traditional cultural clothing",
  Futuriste: "sleek futuristic clothing",
};

export const HAIR_STYLE_EN: Record<string, string> = {
  Naturel: "natural, effortless hair",
  "Coiffé": "neatly styled hair",
  Court: "short hair",
  Long: "long hair",
  "Attaché": "hair tied back",
};

export const COLOR_PALETTE_EN: Record<string, string> = {
  Neutre: "a neutral color palette",
  Chaude: "warm tones",
  Froide: "cool tones",
  Monochrome: "a monochrome palette",
  "Néon": "vivid neon colors",
};

export const BACKGROUND_EN: Record<string, string> = {
  Studio: "a clean studio backdrop",
  Bureau: "an office setting",
  Ville: "an urban city backdrop",
  Nature: "a natural outdoor setting",
  Abstrait: "an abstract backdrop",
};

export const LIGHTING_EN: Record<string, string> = {
  Naturelle: "soft natural lighting",
  Dramatique: "dramatic high-contrast lighting",
  Douce: "soft diffused lighting",
  "Néon": "colorful neon lighting",
  "Cinéma": "cinematic film lighting",
};

export const EXPRESSION_EN: Record<string, string> = {
  Neutre: "a neutral expression",
  Confiant: "a confident expression",
  Chaleureux: "a warm expression",
  "Sérieux": "a serious expression",
  "Déterminé": "a determined expression",
};

export const POSTURE_EN: Record<string, string> = {
  Debout: "standing",
  Assis: "sitting",
  Marche: "walking",
  "Bras croisés": "arms crossed",
};

export const CAMERA_ANGLE_EN: Record<string, string> = {
  Face: "a straight-on camera angle",
  "Trois-quarts": "a three-quarter camera angle",
  "Plan large": "a wide shot",
  "Gros plan": "a close-up shot",
};

export function translateOption(map: Record<string, string>, value?: string): string | undefined {
  if (!value) return undefined;
  return map[value] ?? value;
}
