export interface Persona {
  id: string;
  label: string;
  category: string;
  description: string;
  /** Rich English scene description used to build the AI generation prompt. */
  promptDescription: string;
}

export const PERSONA_CATEGORIES = ["Style"] as const;

export const PERSONAS: Persona[] = [
  {
    id: "pixar-3d",
    label: "Style 3D Pixar",
    category: "Style",
    description: "Personnage animé 3D façon film Pixar, rendu cinéma, yeux expressifs.",
    promptDescription:
      "restyled as a high-quality 3D animated character in a warm modern Pixar/Disney-style CG movie look — smooth semi-realistic skin shading, soft rounded features, big expressive eyes, polished cinematic 3D render, soft warm lighting like a premium animated film",
  },
];

export function getPersonasByCategory(category: string): Persona[] {
  return PERSONAS.filter((p) => p.category === category);
}

export function getPersonaById(id: string): Persona | undefined {
  return PERSONAS.find((p) => p.id === id);
}
