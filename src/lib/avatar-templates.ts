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
];

export function getAvatarTemplateById(id: string): AvatarTemplate | undefined {
  return AVATAR_TEMPLATES.find((t) => t.id === id);
}
