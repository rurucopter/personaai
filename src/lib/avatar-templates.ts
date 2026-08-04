export interface AvatarTemplate {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const AVATAR_TEMPLATES: AvatarTemplate[] = [
  {
    id: "blonde-lifestyle",
    name: "Léa",
    description:
      "26 ans, blonde, style naturel-élégant, lifestyle Sud de la France (plages, marchés provençaux, terrasses).",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/blonde-lifestyle.jpg`,
  },
  {
    id: "brunette-lifestyle",
    name: "Camille",
    description:
      "27 ans, brune, style urbain chic, lifestyle citadin (cafés, mode, quotidien parisien).",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/brunette-lifestyle.jpg`,
  },
  {
    id: "curly-everyday",
    name: "Manon",
    description:
      "34 ans, cheveux bouclés châtains mi-longs, visage ordinaire du quotidien, sans maquillage, traits naturellement asymétriques, quelques petites imperfections de peau, look décontracté de tous les jours.",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/curly-everyday.jpg`,
  },
  {
    id: "round-face-casual",
    name: "Julie",
    description:
      "41 ans, cheveux châtains raides mi-longs, visage rond, sourire légèrement de travers, petites rides d'expression visibles, style simple et décontracté, allure très ordinaire.",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/round-face-casual.jpg`,
  },
  {
    id: "redhead-freckles",
    name: "Élise",
    description:
      "23 ans, rousse, cheveux mi-longs légèrement ébouriffés, nombreuses taches de rousseur, dents légèrement irrégulières, look étudiante décontractée sans maquillage.",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/redhead-freckles.jpg`,
  },
  {
    id: "short-hair-natural",
    name: "Nadia",
    description:
      "29 ans, cheveux noirs raides courts, peau mate, traits naturellement asymétriques, expression neutre et détendue, style casual sans retouche, look très naturel.",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/short-hair-natural.jpg`,
  },
];

export function getAvatarTemplateById(id: string): AvatarTemplate | undefined {
  return AVATAR_TEMPLATES.find((t) => t.id === id);
}
