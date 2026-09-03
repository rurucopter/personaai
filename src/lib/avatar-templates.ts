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
      "cheerful original 3D animated humanoid character with a normal human body and a stylized bright yellow banana-shaped head with big expressive eyes and a warm smile, tropical beach setting",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/talking-banana.jpg`,
  },
  {
    id: "talking-strawberry",
    name: "Fraise Complice",
    description:
      "cheerful original 3D animated humanoid character with a normal human body and a stylized bright red strawberry-shaped head with big expressive eyes and a warm smile, tropical beach setting",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/talking-strawberry.jpg`,
  },
  {
    id: "talking-watermelon",
    name: "Pastèque Complice",
    description:
      "cheerful original 3D animated humanoid character with a normal human body and a stylized pink-and-green watermelon-shaped head with big expressive eyes and a warm smile, tropical beach setting",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/talking-watermelon.jpg`,
  },
];

export function getAvatarTemplateById(id: string): AvatarTemplate | undefined {
  return AVATAR_TEMPLATES.find((t) => t.id === id);
}
