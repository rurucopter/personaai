export interface AvatarTemplate {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const AVATAR_TEMPLATES: AvatarTemplate[] = [
  {
    id: "talking-banana",
    name: "Banane Rigolote",
    description:
      "cheerful original cartoon banana character with big round googly eyes and a wide happy smile, bright yellow, playful meme style",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/talking-banana.jpg`,
  },
  {
    id: "talking-strawberry",
    name: "Fraise Complice",
    description:
      "cheerful original cartoon strawberry character with big round googly eyes and a playful smile, bright red, playful meme style",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/talking-strawberry.jpg`,
  },
  {
    id: "talking-watermelon",
    name: "Pastèque Complice",
    description:
      "cheerful original cartoon watermelon slice character with big round googly eyes and a wide happy smile, bright pink and green, playful meme style",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/talking-watermelon.jpg`,
  },
];

export function getAvatarTemplateById(id: string): AvatarTemplate | undefined {
  return AVATAR_TEMPLATES.find((t) => t.id === id);
}
